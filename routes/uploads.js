// routes/uploads.js
const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

// Keep uploads in memory (we stream directly to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

router.post("/images", upload.single("image"), async (req, res) => {
  // Quick visibility that the route is being hit
  console.log("UPLOAD ROUTE HIT");

  // Confirm we actually received a file
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
      // This is the Cloudinary upload stream
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

      // Send the file buffer into the stream
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
    // ✅ DEV-FRIENDLY ERROR RESPONSE (so you can see it in Network → Response)
    console.error("UPLOAD ERROR:", err);

    return res.status(500).send({
      message: "Upload failed",
      error: err.message,
      name: err.name,
    });
  }
});

module.exports = router;
