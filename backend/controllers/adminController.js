const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const {
  sendDoctorApprovedEmail,
  sendDoctorRejectedEmail,
} = require("../utils/sendEmail");

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, pendingDoctors] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments({ verificationStatus: "approved" }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ verificationStatus: "pending" }),
    ]);

    const appointmentStats = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const specializationStats = await Doctor.aggregate([
      { $match: { verificationStatus: "approved" } },
      { $group: { _id: "$specialization", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingDoctors,
        appointmentStats,
        specializationStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending doctors
// @route   GET /api/admin/doctors/pending
// @access  Private (admin)
exports.getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: "pending" }).select("-otp -refreshToken");
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private (admin)
exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().select("-otp -refreshToken");
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve doctor
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (admin)
exports.approveDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "approved", verificationNote: "" },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // In-app notification
    await Doctor.findByIdAndUpdate(req.params.id, {
      $push: {
        notifications: {
          message: "Your profile has been approved! You can now accept appointments.",
          type: "verification",
        },
      },
    });

    await sendDoctorApprovedEmail(doctor.email, doctor.name);

    res.status(200).json({ success: true, message: "Doctor approved successfully", data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject doctor
// @route   PUT /api/admin/doctors/:id/reject
// @access  Private (admin)
exports.rejectDoctor = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a reason for rejecting this doctor" });
    }
    const cleanReason = reason.trim().slice(0, 500);
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "rejected", verificationNote: cleanReason },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    await Doctor.findByIdAndUpdate(req.params.id, {
      $push: {
        notifications: {
          message: `Your profile was rejected. Reason: ${cleanReason}`,
          type: "verification",
        },
      },
    });

    await sendDoctorRejectedEmail(doctor.email, doctor.name, cleanReason);

    res.status(200).json({ success: true, message: "Doctor rejected", data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user/doctor active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { role } = req.body;
    const Model = role === "doctor" ? Doctor : User;
    const user = await Model.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Account ${user.isActive ? "activated" : "suspended"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (admin)
exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-otp -refreshToken");
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (admin)
exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .populate("patient", "name email")
      .populate("doctor", "name specialization");

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};
