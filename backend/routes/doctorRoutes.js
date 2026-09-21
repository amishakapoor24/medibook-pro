const express = require("express");
const router = express.Router();
const {
  getAllDoctors, getDoctorById, updateProfile,
  uploadProfilePhoto, uploadDocuments, getNotifications, markNotificationRead,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/auth");
const { uploadProfile, uploadDocument } = require("../config/cloudinary");

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.put("/profile", protect, authorize("doctor"), updateProfile);
router.put("/profile/photo", protect, authorize("doctor"), ...uploadProfile.single("photo"), uploadProfilePhoto);
router.put("/documents", protect, authorize("doctor"), ...uploadDocument.single("document"), uploadDocuments);
router.get("/notifications/all", protect, authorize("doctor"), getNotifications);
router.put("/notifications/:notifId", protect, authorize("doctor"), markNotificationRead);

module.exports = router;
