const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { makeOtp } = require("../utils/otp");

const TempRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    // Doctor specific fields
    specialization: String,
    experience: Number,
    fees: Number,
    house: {
      type: String,
      enum: ["Bhairav", "Bhageshree", "Malhar"],
    },
    address: {
      city: String,
      state: String,
      clinic: String,
    },
    // OTP
    otp: {
      code: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Auto delete after 24 hours
TempRegistrationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 } // 24 hours
);

// Hash password before saving
TempRegistrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate OTP
TempRegistrationSchema.methods.generateOTP = function () {
  this.otp = makeOtp();
  return this.otp.code;
};

module.exports = mongoose.model("TempRegistration", TempRegistrationSchema);
