const path = require("path");
const cloudinary = require("../config/cloudinary");

function uploadBufferToCloudinary(file, folder) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: ext === ".pdf" ? "raw" : "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

module.exports = { uploadBufferToCloudinary };
