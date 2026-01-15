const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.port || 3001;

//middleware
app.use(cors());
app.use(express.json());

//connect to mongoDB
mongoose.connect("mongodb://localhost:27017/ic");

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

//basic route
app.get("/", (re, res) => {
  res.json({ message: "ic is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
