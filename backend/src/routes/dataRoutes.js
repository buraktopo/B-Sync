const express = require("express");
const fetchPolygonsForAllPlans = require("../scripts/fetchDROData");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();
const ServiceArea = require("../models/ServiceArea"); // <-- Make sure this is imported

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

// GET service areas for the logged-in user
router.get("/service-areas", authenticateUser, async (req, res) => {
  try {
    const serviceAreas = await ServiceArea.find({ userId: req.userId });
    res.json(serviceAreas);
  } catch (err) {
    console.error("Error fetching service areas:", err.message);
    res.status(500).json({ error: "Failed to fetch service areas." });
  }
});

module.exports = router;