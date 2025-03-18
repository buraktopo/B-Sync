const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  droAccountId: { type: String, unique: true },  // Optional: DRO Account Linking
  role: { type: String, enum: ["contractor", "admin"], default: "contractor" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);