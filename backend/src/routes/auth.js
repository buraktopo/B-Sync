const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailValidator = require('email-validator');
const axios = require("axios");
const ServiceArea = require("../models/ServiceArea");

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use env variable in production

const passwordRules = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return "Password must be at least 8 characters long.";
  }
  if (!hasUpperCase) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!hasLowerCase) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!hasNumber) {
    return "Password must contain at least one number.";
  }
  if (!hasSpecialChar) {
    return "Password must contain at least one special character.";
  }

  return null;
};

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;

  // Validate email before checking for existing user
  if (!emailValidator.validate(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  const passwordError = passwordRules(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, name, phone });

    // Fetch service areas from DRO API
    const DRO_API_URL = "https://dro.routesmart.com/api/api/service-areas";
    const serviceAreasResponse = await axios.get(DRO_API_URL);

    if (!serviceAreasResponse.data || serviceAreasResponse.data.length === 0) {
      console.error("DRO API request failed with status:", serviceAreasResponse.status);
      console.error("DRO API response data:", serviceAreasResponse.data);
      console.error("DRO API response:", serviceAreasResponse.data);
      return res.status(500).json({ message: "Failed to fetch service areas from DRO." });
    }

    // Save service areas to the database
    const serviceAreas = serviceAreasResponse.data.map((area) => ({
      userId: user._id,
      serviceAreaId: area.serviceAreaId,
      csa: area.csa,
      businessName: area.businessName,
      stationId: area.stationId,
      stationName: area.stationName,
    }));

    await ServiceArea.insertMany(serviceAreas);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error("Registration error:", err.message);
    console.error("Error details:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;