const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { makeOtp } = require("../utils/otp");

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    role: {
      type: String,
      default: "doctor",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      enum: [
        "General Physician",
        "Dermatologist",
        "Cardiologist",
        "Orthopedic",
        "Pediatrician",
        "Neurologist",
        "Dentist",
        "Gynecologist",
        "Ophthalmologist",
        "Psychiatrist",
        "ENT Specialist",
        "Other",
      ],
    },
    qualifications: [
      {
        degree: { type: String, required: true },
        institute: { type: String, required: true },
        year: { type: Number, required: true },
      },
    ],
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    fees: {
      type: Number,
      required: [true, "Consultation fees is required"],
      min: [0, "Fees cannot be negative"],
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    address: {
      clinic: String,
      city: { type: String, required: [true, "City is required"] },
      state: String,
      country: { type: String, default: "India" },
    },
    availableDays: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    timeSlots: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
        isBooked: { type: Boolean, default: false },
      },
    ],
    documents: {
      idProof: { type: String, default: "" },
      medicalLicense: { type: String, default: "" },
      certificates: [{ type: String }],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationNote: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    otp: {
      code: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
    },
    refreshToken: {
      type: String,
      select: false,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    notifications: [
      {
        message: String,
        type: {
          type: String,
          enum: ["appointment", "system", "chat", "verification"],
          default: "system",
        },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
DoctorSchema.pre("save", async function (next) {
  if (this.$locals.passwordAlreadyHashed) return next();
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
DoctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Access Token
DoctorSchema.methods.getAccessToken = function () {
  return jwt.sign({ id: this._id, role: "doctor" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate Refresh Token
DoctorSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

// Generate OTP
DoctorSchema.methods.generateOTP = function () {
  this.otp = makeOtp();
  return this.otp.code;
};

module.exports = mongoose.model("Doctor", DoctorSchema);
