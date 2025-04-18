const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/dataRoutes");
const authenticateUser = require("./middleware/authenticateUser");

const app = express();
app.use(express.json());
app.use(cors());

// public: signup / login
app.use("/api/auth", authRoutes);

// protected: every route in dataRoutes now requires a valid JWT
app.use("/api/data", authenticateUser, dataRoutes);

app.get("/", (req, res) => res.send("FedEx Route Planning API Running"));

module.exports = app;