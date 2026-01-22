const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ACCEPTED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"), false);
    }
    return cb(null, true);
  },
});

router.post("/images", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).send({ message: "File too large (max 8MB)" });
      }
      return res.status(400).send({ message: err.message || "Upload error" });
    }
    return next();
  });
});

router.post("/images", async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "Image required" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "introspective-color",
          resource_type: "image",
        },
        (err, uploaded) => {
          if (err) return reject(err);
          return resolve(uploaded);
        },
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).send({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).send({ message: "Upload failed" });
  }
});

module.exports = router;
