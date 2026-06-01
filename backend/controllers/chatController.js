const Message = require("../models/Message");
const Appointment = require("../models/Appointment");

// @desc    Get messages for an appointment
// @route   GET /api/chat/:appointmentId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!appointment.isChatEnabled) {
      return res.status(403).json({ success: false, message: "Chat is not enabled for this appointment" });
    }

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const messages = await Message.find({ appointment: req.params.appointmentId })
      .sort({ createdAt: 1 })
      .populate("sender", "name profilePhoto");

    // Mark messages as read
    await Message.updateMany(
      { appointment: req.params.appointmentId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/chat/:appointmentId
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment || !appointment.isChatEnabled) {
      return res.status(403).json({ success: false, message: "Chat not available" });
    }

    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const newMessage = await Message.create({
      appointment: req.params.appointmentId,
      sender: req.user._id,
      senderModel: req.user.role === "doctor" ? "Doctor" : "User",
      message,
    });

    const populated = await newMessage.populate("sender", "name profilePhoto");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
