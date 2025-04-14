const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/dataRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);

// Test route
app.get("/", (req, res) => res.send("FedEx Route Planning API Running"));

module.exports = app;