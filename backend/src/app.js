const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("FedEx Route Planning API Running"));

module.exports = app;


