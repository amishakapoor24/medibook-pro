const express = require("express");
const router = express.Router();
const {
  getAnalytics, getPendingDoctors, getAllDoctors,
  approveDoctor, rejectDoctor, toggleUserStatus,
  getAllPatients, getAllAppointments,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/analytics", getAnalytics);
router.get("/doctors/pending", getPendingDoctors);
router.get("/doctors", getAllDoctors);
router.put("/doctors/:id/approve", approveDoctor);
router.put("/doctors/:id/reject", rejectDoctor);
router.put("/users/:id/toggle", toggleUserStatus);
router.get("/patients", getAllPatients);
router.get("/appointments", getAllAppointments);

module.exports = router;
