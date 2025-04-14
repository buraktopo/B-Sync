const express = require("express");
const fetchPolygonsForAllPlans = require("../scripts/fetchDROData");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();

// Route to fetch and save DRO data
router.post("/fetch-data", authenticateUser, async (req, res) => {
  const { userId } = req;

  try {
    await fetchPolygonsForAllPlans(userId);
    res.status(200).json({ message: "Data fetched and saved successfully." });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch and save data." });
  }
});

module.exports = router;