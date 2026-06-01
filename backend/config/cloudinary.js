const cloudinary = require("cloudinary").v2;
const CloudinaryStorage = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile photos
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medibook/profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

// Storage for doctor documents
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medibook/documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
  },
});

const uploadProfile = multer({ storage: profileStorage });
const uploadDocument = multer({ storage: documentStorage });

module.exports = { cloudinary, uploadProfile, uploadDocument };
