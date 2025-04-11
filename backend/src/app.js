const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes"); // ✅ Ensure Correct Import
const workAreaRoutes = require("./routes/workAreaRoutes"); // ✅ Ensure Correct Import
const polygonRoutes = require("./routes/polygonRoutes");  // ✅ Ensure Correct Import
const csaRoutes = require("./routes/csaRoutes");         // ✅ Ensure Correct Import

connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json());
app.use(cors());

// Register Routes
app.use("/api", userRoutes);
app.use("/api/work-areas", workAreaRoutes);
app.use("/api/polygons", polygonRoutes);
app.use("/api/csas", csaRoutes);

app.get("/", (req, res) => res.send("FedEx Route Planning API Running"));

module.exports = app;


