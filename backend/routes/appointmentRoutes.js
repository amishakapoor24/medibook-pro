const express = require("express");
const router = express.Router();
const {
  bookAppointment, getMyAppointments, getDoctorAppointments,
  getAppointmentById, acceptAppointment, rejectAppointment,
  cancelAppointment, completeAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/my", protect, authorize("patient"), getMyAppointments);
router.get("/doctor", protect, authorize("doctor"), getDoctorAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id/accept", protect, authorize("doctor"), acceptAppointment);
router.put("/:id/reject", protect, authorize("doctor"), rejectAppointment);
router.put("/:id/cancel", protect, authorize("patient"), cancelAppointment);
router.put("/:id/complete", protect, authorize("doctor"), completeAppointment);

module.exports = router;
