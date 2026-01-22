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

const allowedOrigins = [
  "http://localhost:5173",
  "https://ic.oops.wtf",
  "https://www.ic.oops.wtf",
  "https://api.ic.oops.wtf",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked for origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

app.get("/", (req, res) => {
  res.json({ message: "ic is running!" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", authRouter);
app.use("/api/users", auth, usersRouter);
app.use("/api/uploads", auth, uploadsRouter);

app.use((err, req, res, next) => {
  if (err?.message?.startsWith("CORS blocked")) {
    return res.status(403).send({ message: err.message });
  }
  return next(err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
