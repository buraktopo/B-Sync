const mongoose = require("mongoose");

const polygonSchema = new mongoose.Schema({
  anchorAreaId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  coordinates: { type: [[Number]], required: true }, // Array of Lat/Lng
  workAreaId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkArea" }, // Link to Work Area
  color: { type: String, default: "#FF0000" },  // Default color for visualization
}, { timestamps: true });

module.exports = mongoose.model("Polygon", polygonSchema);