const mongoose = require("mongoose");

const PolygonSchema = new mongoose.Schema({
  anchorAreaId: Number,
  name: String,
  coordinates: {
    type: [[Number]],
    required: true,
  }, // flat [lng, lat] coordinates for Mapbox
  serviceAreaId: Number,
  day: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

PolygonSchema.index({ userId: 1, anchorAreaId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("Polygon", PolygonSchema);