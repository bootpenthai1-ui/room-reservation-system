const multer = require("multer");
const path = require("path");

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedExtensions.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น"));
    }
  },
});

module.exports = upload;
