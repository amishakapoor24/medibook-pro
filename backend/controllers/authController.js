const User = require("../models/User");
const Doctor = require("../models/Doctor");
const TempRegistration = require("../models/TempRegistration");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { MAX_OTP_ATTEMPTS, codesMatch } = require("../utils/otp");
const {
  sendOTPEmail,
  sendWelcomeEmail,
  sendForgotPasswordEmail,
} = require("../utils/sendEmail");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: send tokens
const sendTokens = async (user, statusCode, res) => {
  const accessToken = user.getAccessToken();
  const refreshToken = user.getRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified,
      ...(user.role === "doctor" && {
        verificationStatus: user.verificationStatus,
        specialization: user.specialization,
      }),
    },
  });
};

// @desc    Register patient / doctor - Store in temp collection, send OTP
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, specialization, experience, fees, address } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim() || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: "Please enter a valid 10-digit phone number" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    if (role !== undefined && role !== "patient" && role !== "doctor") {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role || "patient";

    if (normalizedRole === "doctor") {
      if (!cleanPhone) {
        return res.status(400).json({ success: false, message: "Phone number is required for doctors" });
      }
      if (!specialization) {
        return res.status(400).json({ success: false, message: "Specialization is required for doctors" });
      }
      if (experience === undefined || experience === "" || isNaN(Number(experience))) {
        return res.status(400).json({ success: false, message: "Valid years of experience is required" });
      }
      if (fees === undefined || fees === "" || isNaN(Number(fees))) {
        return res.status(400).json({ success: false, message: "Valid consultation fee is required" });
      }
      if (!address || !address.city || !address.city.trim()) {
        return res.status(400).json({ success: false, message: "City is required for doctors" });
      }
    }

    // Check if email already exists in temp registrations
    await TempRegistration.deleteMany({ email: normalizedEmail });

    // Check if email already registered permanently in User or Doctor
    const [existingUser, existingDoctor] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Doctor.findOne({ email: normalizedEmail }),
    ]);
    if (existingUser || existingDoctor) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create temporary registration
    const tempData = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: cleanPhone || undefined,
      role: normalizedRole,
    };

    if (normalizedRole === "doctor") {
      tempData.specialization = specialization;
      tempData.experience = Number(experience);
      tempData.fees = Number(fees);
      tempData.address = address;
    }

    const tempRegistration = await TempRegistration.create(tempData);
    const otp = tempRegistration.generateOTP();
    await tempRegistration.save();

    console.log(`\n========================================`);
    console.log(`🔐 REGISTRATION OTP FOR [${normalizedEmail}]: ${otp}`);
    console.log(`========================================\n`);

    // Attempt to send email with a 3.5s timeout so SMTP blocking on hosting platforms does not stall signup
    let emailSent = false;
    try {
      await Promise.race([
        sendOTPEmail(normalizedEmail, name.trim(), otp),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), 3500)),
      ]);
      emailSent = true;
    } catch (emailErr) {
      console.warn("⚠️ OTP email notification delayed/failed:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "OTP sent to your email. Please verify to complete registration."
        : "Verification session created. Enter the verification code to continue.",
      userId: tempRegistration._id,
      role: normalizedRole,
      previewOtp: otp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and create user
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    // Find temporary registration
    const tempReg = await TempRegistration.findById(userId);
    if (!tempReg) {
      return res.status(404).json({ success: false, message: "Registration session expired. Please register again." });
    }

    if (tempReg.otp && new Date() > tempReg.otp.expiresAt) {
      await TempRegistration.deleteOne({ _id: userId });
      return res.status(400).json({ success: false, message: "OTP has expired. Please register again." });
    }

    if (!tempReg.otp || tempReg.otp.attempts >= MAX_OTP_ATTEMPTS) {
      await TempRegistration.deleteOne({ _id: userId });
      return res.status(429).json({ success: false, message: "Too many invalid OTP attempts. Please register again." });
    }

    if (!codesMatch(tempReg.otp.code, otp)) {
      tempReg.otp.attempts += 1;
      await tempReg.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const role = tempReg.role;

    // Create actual user/doctor account
    const Model = role === "doctor" ? Doctor : User;
    const user = new Model({
      name: tempReg.name,
      email: tempReg.email,
      password: tempReg.password,
      phone: tempReg.phone,
      role,
      isVerified: true,
      ...(role === "doctor" && {
        specialization: tempReg.specialization,
        experience: tempReg.experience,
        fees: tempReg.fees,
        address: tempReg.address,
      }),
    });
    user.$locals.passwordAlreadyHashed = true;
    await user.save();
    user.$locals.passwordAlreadyHashed = false;

    // Send welcome email gracefully (non-fatal if network/smtp issue)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.warn("Welcome email could not be sent:", emailErr.message);
    }

    // Delete temporary registration
    await TempRegistration.deleteOne({ _id: userId });

    await sendTokens(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const tempReg = await TempRegistration.findById(userId);
    if (!tempReg) {
      return res.status(404).json({ success: false, message: "Registration session expired. Please register again." });
    }

    const otp = tempReg.generateOTP();
    await tempReg.save();

    if (process.env.NODE_ENV === "development") {
      console.log(`\n========================================`);
      console.log(`🔐 RESENT OTP FOR [${tempReg.email}]: ${otp}`);
      console.log(`========================================\n`);
    }

    await sendOTPEmail(tempReg.email, tempReg.name, otp);

    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const Model = role === "doctor" ? Doctor : User;
    const user = await Model.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      // Check if user exists under the other role for user convenience
      const AltModel = role === "doctor" ? User : Doctor;
      const altUser = await AltModel.findOne({ email: normalizedEmail });
      if (altUser) {
        const registeredRole = altUser.role === "doctor" ? "Doctor" : "Patient";
        return res.status(401).json({
          success: false,
          message: `This account is registered as a ${registeredRole}. Please switch to the ${registeredRole} tab to sign in.`,
        });
      }
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Your account has been suspended. Contact support." });
    }

    if (user.isVerified === false) {
      return res.status(401).json({
        success: false,
        message: "Email not verified. Please verify your email first.",
        userId: user._id,
      });
    }

    await sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ success: false, message: "Google login is not configured on this server." });
    }

    const { token, role } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Google credential token is required." });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(400).json({ success: false, message: "Invalid or expired Google token. Please try again." });
    }

    const { name, email, picture, sub: googleId } = payload;
    const safeRole = role === "doctor" ? "doctor" : "patient";
    const Model = safeRole === "doctor" ? Doctor : User;

    let user = await Model.findOne({ email });

    if (!user) {
      if (safeRole === "doctor") {
        return res.status(400).json({ success: false, message: "Doctors need to register with the form so we can collect their details." });
      }
      user = await User.create({
        name,
        email,
        googleId,
        profilePhoto: picture,
        authProvider: "google",
        isVerified: true,
        role: "patient",
      });
      try {
        await sendWelcomeEmail(email, name);
      } catch (err) {
        console.warn("Welcome email could not be sent:", err.message);
      }
    }

    await sendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    let user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) user = await Doctor.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const accessToken = user.getAccessToken();
    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const Model = role === "doctor" ? Doctor : User;
    const user = await Model.findOne({ email: typeof email === "string" ? email.trim().toLowerCase() : email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const otp = user.generateOTP();
    await user.save();

    console.log(`\n========================================`);
    console.log(`🔐 PASSWORD RESET OTP FOR [${email}]: ${otp}`);
    console.log(`========================================\n`);

    try {
      await Promise.race([
        sendForgotPasswordEmail(email, user.name, otp),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), 3500)),
      ]);
    } catch (emailErr) {
      console.warn("⚠️ Password reset email notification delayed/failed:", emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
      userId: user._id,
      previewOtp: otp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword, role } = req.body;
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    const Model = role === "doctor" ? Doctor : User;
    const user = await Model.findById(userId);

    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (user.otp.attempts >= MAX_OTP_ATTEMPTS) {
      user.otp = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({ success: false, message: "Too many invalid OTP attempts" });
    }

    if (!codesMatch(user.otp.code, otp)) {
      user.otp.attempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.refreshToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
