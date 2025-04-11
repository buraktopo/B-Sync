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

router.get("/dro/manual-fetch", (req, res) => {
  const { exec } = require("child_process");

  exec("node src/scripts/fetchDROData.js", (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ message: "Failed to update maps" });
    }
    console.log(stdout);
    res.json({ message: "Map successfully updated!" });
  });
});

module.exports = router;  // Ensure you're exporting ONLY `router`