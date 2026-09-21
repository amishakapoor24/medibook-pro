const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makeUploader = ({ folder, allowedTypes, maxMB, transformation }) => ({
  single: (fieldName) => {
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: maxMB * 1024 * 1024, files: 1 },
      fileFilter: (req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
          const error = new Error("Unsupported file type");
          error.statusCode = 400;
          return cb(error);
        }
        cb(null, true);
      },
    }).single(fieldName);

    const sendToCloudinary = (req, res, next) => {
      if (!req.file) return next();
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto", transformation },
        (error, result) => {
          if (error) return next(error);
          req.file.path = result.secure_url;
          next();
        }
      );
      stream.end(req.file.buffer);
    };

    return [upload, sendToCloudinary];
  },
});

const uploadProfile = makeUploader({
  folder: "medibook/profiles",
  allowedTypes: ["image/jpeg", "image/png"],
  maxMB: 2,
  transformation: [{ width: 400, height: 400, crop: "fill" }],
});

const uploadDocument = makeUploader({
  folder: "medibook/documents",
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxMB: 5,
});

module.exports = { cloudinary, uploadProfile, uploadDocument };
