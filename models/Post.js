const mongoose = require("mongoose");
const validator = require("validator");

const postSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: "" },
    color: {
      type: String,
      required: true,
      enum: ["red", "orange", "yellow", "green", "blue", "purple"],
    },
    hashtags: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
