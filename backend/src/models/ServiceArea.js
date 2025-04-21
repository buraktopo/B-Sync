const mongoose = require("mongoose");

const ServiceAreaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  serviceAreaId: {
    type: Number,
    required: true,
  },
  csa: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  stationId: {
    type: String,
    required: true,
  },
  stationName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

ServiceAreaSchema.index({ userId: 1, serviceAreaId: 1 }, { unique: true });

module.exports = mongoose.model("ServiceArea", ServiceAreaSchema);