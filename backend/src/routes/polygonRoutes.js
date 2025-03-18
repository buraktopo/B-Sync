const express = require("express");
const router = express.Router();
const Polygon = require("../models/Polygon");

// Define your routes
router.get("/", async (req, res) => {
  try {
    const polygons = await Polygon.find();
    res.json(polygons);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;  // Ensure you're exporting ONLY `router`