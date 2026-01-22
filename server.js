require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const uploadsRouter = require("./routes/uploads");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = ["http://localhost:5173", "https://ic.oops.wtf"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/ic");

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// test routes
app.get("/", (req, res) => {
  res.json({ message: "ic is running!" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", authRouter); // /api/signup, /api/signin

app.use("/api/users", auth, usersRouter); // /api/users/me

app.use("/api/uploads", auth, uploadsRouter); // protected uploads

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
