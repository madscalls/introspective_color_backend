const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Invalid email",
      },
    },
    password: {
      type: String,
      required: true,
      select: false, // don't return password
    },
    name: {
      type: String,
      default: "New User",
      minlength: 2,
      maxlength: 30,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
