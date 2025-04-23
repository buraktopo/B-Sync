const VehicleSet = require("../models/VehicleSet");
const express = require("express");
const fetchPolygonsForAllPlans = require("../scripts/fetchDROData");
const authenticateUser = require("../middleware/authenticateUser");
const User = require("../models/User");
const Polygon = require("../models/Polygon");

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

// Set a service area as active
router.post("/set-active-service-area", authenticateUser, async (req, res) => {
  const { serviceAreaId } = req.body;
  const userId = req.userId;

  try {
    // 1. Update user's activeServiceAreaId
    await User.findByIdAndUpdate(userId, { activeServiceAreaId: serviceAreaId });

    // 2. Mark all service areas as inactive, then activate selected one
    await ServiceArea.updateMany({ userId }, { isActive: false });
    await ServiceArea.updateOne({ userId, serviceAreaId }, { isActive: true });

    res.status(200).json({ message: "Active service area updated." });
  } catch (err) {
    console.error("Error setting active service area:", err.message);
    res.status(500).json({ error: "Failed to set active service area." });
  }
});

// Get polygons for a specific day
router.get("/polygons", authenticateUser, async (req, res) => {
  const { day } = req.query;
  const userId = req.userId;

  try {
    const polygons = await Polygon.find({ userId, day });
    res.json(polygons);
  } catch (error) {
    console.error("Error fetching polygons:", error);
    res.status(500).json({ error: "Failed to fetch polygons." });
  }
});

// Group polygons by vehicle (work area) for a specific day
router.get("/polygons/grouped", authenticateUser, async (req, res) => {
  const { day } = req.query;
  const userId = req.userId;

  try {
    const vehicleSet = await VehicleSet.findOne({ userId, day });

    if (!vehicleSet) {
      return res.status(404).json({ error: "Vehicle set not found." });
    }

    const grouped = [];

    for (const vehicle of vehicleSet.data) {
      const anchorIds = vehicle.anchorAreas.map(a => a.anchorAreaId);

      const polygons = await Polygon.find({
        userId,
        day,
        anchorAreaId: { $in: anchorIds }
      });

      grouped.push({
        vehicleName: vehicle.vehicleName,
        workAreaNumber: vehicle.workAreaNumber,
        polygons
      });
    }

    res.json(grouped);
  } catch (err) {
    console.error("Error grouping polygons:", err);
    res.status(500).json({ error: "Failed to group polygons." });
  }
});

module.exports = router;