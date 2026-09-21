const Doctor = require("../models/Doctor");
const { cloudinary } = require("../config/cloudinary");

const PUBLIC_DOCTOR_FIELDS = "name profilePhoto specialization qualifications experience fees bio address availableDays timeSlots rating";
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const queryText = (value) => (typeof value === "string" ? value.trim().slice(0, 60) : "");

exports.PUBLIC_DOCTOR_FIELDS = PUBLIC_DOCTOR_FIELDS;

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
  try {
    const specialization = queryText(req.query.specialization);
    const city = queryText(req.query.city);
    const sort = queryText(req.query.sort);
    const search = queryText(req.query.search);

    let query = { verificationStatus: "approved", isActive: true };

    if (specialization) query.specialization = specialization;
    if (city) query["address.city"] = { $regex: escapeRegex(city), $options: "i" };
    if (search) query.name = { $regex: escapeRegex(search), $options: "i" };

    let sortOption = {};
    if (sort === "rating") sortOption = { "rating.average": -1 };
    else if (sort === "experience") sortOption = { experience: -1 };
    else if (sort === "fees_asc") sortOption = { fees: 1 };
    else if (sort === "fees_desc") sortOption = { fees: -1 };
    else sortOption = { createdAt: -1 };

    const doctors = await Doctor.find(query)
      .sort(sortOption)
      .select(PUBLIC_DOCTOR_FIELDS);

    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, verificationStatus: "approved", isActive: true }).select(PUBLIC_DOCTOR_FIELDS);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (doctor)
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "phone", "bio", "fees", "experience", "availableDays", "timeSlots", "address", "qualifications"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const doctor = await Doctor.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-otp -refreshToken");

    res.status(200).json({ success: true, message: "Profile updated", data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile photo
// @route   PUT /api/doctors/profile/photo
// @access  Private (doctor)
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a photo" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: req.file.path },
      { new: true }
    ).select("-otp -refreshToken");

    res.status(200).json({ success: true, message: "Profile photo updated", data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload verification documents
// @route   PUT /api/doctors/documents
// @access  Private (doctor)
exports.uploadDocuments = async (req, res, next) => {
  try {
    const { documentType } = req.body;
    if (documentType !== "idProof" && documentType !== "medicalLicense") {
      return res.status(400).json({ success: false, message: "Invalid document type" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a document" });
    }

    const updateField = `documents.${documentType}`;
    const doctor = await Doctor.findByIdAndUpdate(
      req.user._id,
      { [updateField]: req.file.path, verificationStatus: "pending" },
      { new: true }
    ).select("-otp -refreshToken");

    res.status(200).json({ success: true, message: "Document uploaded. Pending admin review.", data: doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor notifications
// @route   GET /api/doctors/notifications
// @access  Private (doctor)
exports.getNotifications = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.user._id).select("notifications");
    res.status(200).json({ success: true, data: doctor.notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/doctors/notifications/:notifId
// @access  Private (doctor)
exports.markNotificationRead = async (req, res, next) => {
  try {
    await Doctor.updateOne(
      { _id: req.user._id, "notifications._id": req.params.notifId },
      { $set: { "notifications.$.isRead": true } }
    );
    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};
