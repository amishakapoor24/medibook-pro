const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  register, login, verifyOTP, resendOTP, googleAuth,
  refreshToken, forgotPassword, resetPassword, getMe, logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", otpLimiter, resendOTP);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/refresh", refreshToken);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
