const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  droUsername: { type: String, required: true }, // Added DRO username
  droPassword: { type: String, required: true }, // Added DRO password
  droToken: { type: String }, // Stores session token
  serviceAreaId: { type: String, default: null }, // Selected CSA
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);