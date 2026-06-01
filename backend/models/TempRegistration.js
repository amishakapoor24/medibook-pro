const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  return otp;
};

module.exports = mongoose.model("TempRegistration", TempRegistrationSchema);
