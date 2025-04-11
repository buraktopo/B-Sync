const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../models/User");

dotenv.config();
const router = express.Router();

const DRO_SERVICE_AREAS_URL = "https://dro.routesmart.com/api/api/service-areas";
const DRO_AUTH_TOKEN = process.env.DRO_AUTH_TOKEN;

// Fetch all CSAs from DRO
router.get("/fetch", async (req, res) => {
  try {
    if (!DRO_AUTH_TOKEN) {
      return res.status(401).json({ message: "Missing DRO_AUTH_TOKEN." });
    }

    const response = await axios.get(DRO_SERVICE_AREAS_URL, {
      headers: { Authorization: `Bearer ${DRO_AUTH_TOKEN}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching CSAs:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Failed to fetch service areas." });
  }
});

// Store user's selected CSA
router.post("/set", async (req, res) => {
  try {
    const { userId, serviceAreaId } = req.body;
    if (!userId || !serviceAreaId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    await User.updateOne({ _id: userId }, { $set: { serviceAreaId } });

    res.json({ message: "Service Area updated successfully.", serviceAreaId });
  } catch (error) {
    console.error("❌ Error updating Service Area:", error.message);
    res.status(500).json({ message: "Failed to update service area." });
  }
});

// Get user's selected CSA
router.get("/selected/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ serviceAreaId: user.serviceAreaId });
  } catch (error) {
    console.error("❌ Error fetching user's Service Area:", error.message);
    res.status(500).json({ message: "Failed to fetch service area." });
  }
});

module.exports = router;
