const mongoose = require("mongoose");

const workAreaSchema = new mongoose.Schema({
  workAreaId: { type: String, required: true, unique: true },
  workAreaName: { type: String, required: true },
  driverId: { type: String },
  truckId: { type: String },
  assignedPolygons: [{ type: String }],  // Array of anchorAreaIds
}, { timestamps: true });

module.exports = mongoose.model("WorkArea", workAreaSchema);