require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const interviewRoutes = require("./routes/interview");

const app = express();

const allowedOrigin = process.env.CLIENT_URL?.replace(/\/+$/, "") || "*";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use("/api", interviewRoutes);

app.get("/", (req, res) => res.json({ status: "Interview Agent API running" }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = app;
