const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    timeSlot: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      minlength: [5, "Reason must be at least 5 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    fees: {
      type: Number,
      required: true,
    },
    meetingInfo: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    isChatEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

AppointmentSchema.index(
  { doctor: 1, appointmentDate: 1, "timeSlot.start": 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "confirmed"] } } }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
