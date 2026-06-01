const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const {
  sendAppointmentConfirmedEmail,
  sendAppointmentRejectedEmail,
} = require("../utils/sendEmail");

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private (patient)
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.verificationStatus !== "approved") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      reason,
      fees: doctor.fees,
    });

    // Notify doctor in-app
    await Doctor.findByIdAndUpdate(doctorId, {
      $push: {
        notifications: {
          message: `New appointment request from ${req.user.name} on ${new Date(appointmentDate).toDateString()}`,
          type: "appointment",
        },
      },
    });

    res.status(201).json({ success: true, message: "Appointment booked successfully", data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments/my
// @access  Private (patient)
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { patient: req.user._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .populate("doctor", "name specialization profilePhoto fees address rating");

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor
// @access  Private (doctor)
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { doctor: req.user._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .populate("patient", "name email phone profilePhoto dateOfBirth bloodGroup");

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email phone profilePhoto dateOfBirth bloodGroup gender")
      .populate("doctor", "name specialization profilePhoto fees address phone");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept appointment
// @route   PUT /api/appointments/:id/accept
// @access  Private (doctor)
exports.acceptAppointment = async (req, res, next) => {
  try {
    const { meetingInfo } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    appointment.status = "confirmed";
    appointment.meetingInfo = meetingInfo || "Please arrive 10 minutes before your appointment.";
    appointment.isChatEnabled = true;
    await appointment.save();

    // Notify patient in-app
    await User.findByIdAndUpdate(appointment.patient._id, {
      $push: {
        notifications: {
          message: `Your appointment with Dr. ${appointment.doctor.name} on ${new Date(appointment.appointmentDate).toDateString()} has been confirmed!`,
          type: "appointment",
        },
      },
    });

    // Send confirmation email
    await sendAppointmentConfirmedEmail(
      appointment.patient.email,
      appointment.patient.name,
      appointment.doctor.name,
      appointment.appointmentDate,
      appointment.timeSlot,
      appointment.meetingInfo
    );

    res.status(200).json({ success: true, message: "Appointment confirmed", data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject appointment
// @route   PUT /api/appointments/:id/reject
// @access  Private (doctor)
exports.rejectAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    appointment.status = "rejected";
    appointment.rejectionReason = reason || "Doctor unavailable";
    await appointment.save();

    // Notify patient in-app
    await User.findByIdAndUpdate(appointment.patient._id, {
      $push: {
        notifications: {
          message: `Your appointment with Dr. ${appointment.doctor.name} has been rejected. Reason: ${reason || "Doctor unavailable"}`,
          type: "appointment",
        },
      },
    });

    // Send rejection email
    await sendAppointmentRejectedEmail(
      appointment.patient.email,
      appointment.patient.name,
      appointment.doctor.name,
      reason
    );

    res.status(200).json({ success: true, message: "Appointment rejected", data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (patient)
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    appointment.status = "cancelled";
    appointment.isChatEnabled = false;
    await appointment.save();

    res.status(200).json({ success: true, message: "Appointment cancelled", data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete appointment + add prescription
// @route   PUT /api/appointments/:id/complete
// @access  Private (doctor)
exports.completeAppointment = async (req, res, next) => {
  try {
    const { prescription, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    appointment.status = "completed";
    appointment.prescription = prescription || "";
    appointment.notes = notes || "";
    appointment.isChatEnabled = false;
    await appointment.save();

    res.status(200).json({ success: true, message: "Appointment completed", data: appointment });
  } catch (error) {
    next(error);
  }
};
