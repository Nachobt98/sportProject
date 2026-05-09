const fs = require("fs");
const path = require("path");
const multer = require("multer");

const PROFILE_IMAGE_MAX_BYTES = 1.5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PROFILE_IMAGE_UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "profile-images");

fs.mkdirSync(PROFILE_IMAGE_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, PROFILE_IMAGE_UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const extensionByMimeType = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    const extension = extensionByMimeType[file.mimetype] || path.extname(file.originalname).toLowerCase();
    const safeUserName = String(req.auth?.userName || "user").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    callback(null, `${safeUserName}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: PROFILE_IMAGE_MAX_BYTES,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error("La imagen debe ser JPG, PNG o WEBP."));
      return;
    }

    callback(null, true);
  },
});

function handleProfileImageUpload(req, res, next) {
  upload.single("profileImage")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "La imagen es demasiado grande. Usa una imagen de menos de 1.5 MB." });
      return;
    }

    res.status(400).json({ message: error.message || "La imagen de perfil no es valida." });
  });
}

module.exports = {
  PROFILE_IMAGE_UPLOAD_DIR,
  handleProfileImageUpload,
};
