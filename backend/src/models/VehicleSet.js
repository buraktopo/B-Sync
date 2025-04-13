const mongoose = require("mongoose");

const VehicleSetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceAreaId: {
    type: Number,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  planId: {
    type: Number,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

VehicleSetSchema.index({ userId: 1, serviceAreaId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("VehicleSet", VehicleSetSchema);