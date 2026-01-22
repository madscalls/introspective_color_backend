// routes/uploads.js
const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

router.post("/images", upload.single("image"), async (req, res) => {
  console.log("UPLOAD ROUTE HIT");

  console.log("has file?", !!req.file);
  if (req.file) {
    console.log("mimetype:", req.file.mimetype, "size:", req.file.size);
    console.log("buffer length:", req.file.buffer?.length);
  }

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
        }
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

    return res.status(500).send({
      message: "Upload failed",
      error: err.message,
      name: err.name,
    });
  }
});

module.exports = router;
