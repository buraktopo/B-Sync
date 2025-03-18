const express = require("express");
const router = express.Router();
const WorkArea = require("../models/WorkArea");

// Define your routes
router.get("/", async (req, res) => {
  try {
    const workAreas = await WorkArea.find();
    res.json(workAreas);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;  // Ensure you're exporting ONLY `router`