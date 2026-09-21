require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) before running this script.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.isVerified = true;
    existing.isActive = true;
    await existing.save({ validateBeforeSave: false });
    console.log(`Admin role granted to ${email}`);
    return;
  }

  await User.create({
    name: "MediBook Administrator",
    email,
    password,
    role: "admin",
    isVerified: true,
    isActive: true,
  });
  console.log(`Admin created: ${email}`);
};

createAdmin()
  .catch((error) => {
    console.error(`Failed to create admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
