const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./db");
const User = require("../models/User");
const Polygon = require("../models/Polygon");
const WorkArea = require("../models/WorkArea");

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Polygon.deleteMany();
    await WorkArea.deleteMany();

    // Create a test user
    const user = await User.create({
      name: "Test Contractor",
      email: "test@example.com",
      password: "password123", // You should hash this later
    });

    // Create a test work area
    const workArea = await WorkArea.create({
      workAreaId: "WA123",
      workAreaName: "Test Work Area",
      driverId: "D123",
      truckId: "T123",
      assignedPolygons: [],
    });

    // Create a test polygon (Route)
    const polygon = await Polygon.create({
      anchorAreaId: "P123",
      name: "Test Route",
      coordinates: [[-98.35, 39.5], [-98.30, 39.6], [-98.25, 39.55]], // Sample Lat/Lng
      workAreaId: workArea._id,
      color: "#00FF00",
    });

    console.log("Data Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Error Seeding Data:", error);
    process.exit(1);
  }
};

seedData();