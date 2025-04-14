const mongoose = require("mongoose");

const PolygonSchema = new mongoose.Schema({
  anchorAreaId: Number,
  name: String,
  coordinates: [[[Number]]], // shape.rings format
  serviceAreaId: Number,
  day: String,
});

module.exports = mongoose.model("Polygon", PolygonSchema);