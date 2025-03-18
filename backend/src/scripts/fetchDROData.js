const axios = require("axios");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Polygon = require("../models/Polygon");
const WorkArea = require("../models/WorkArea");

dotenv.config();
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const DRO_BASE_URL = "https://pdv2.dro.routesmart.com/api/api";
const SERVICE_AREA_ID = "2985394";  // Replace with your actual Service Area ID
const ROUTE_PLAN_ID = "19092";      // Replace with your actual Route Plan ID
const DRO_AUTH_TOKEN = process.env.DRO_AUTH_TOKEN;  // Store in .env

const fetchDROData = async () => {
  try {
    if (!DRO_AUTH_TOKEN) {
      console.error("❌ Missing DRO_AUTH_TOKEN. Set it in the .env file.");
      process.exit(1);
    }

    console.log("🔄 Fetching DRO data...");

    // Fetch Work Areas (Advanced Vehicle Set)
    const workAreaRes = await axios.get(`${DRO_BASE_URL}/service-areas/${SERVICE_AREA_ID}/route-plans/${ROUTE_PLAN_ID}/advanced-vehicle-set`, {
      headers: { Authorization: `Bearer ${DRO_AUTH_TOKEN}` }
    });

    const workAreas = workAreaRes.data;
    console.log(`✅ Retrieved ${workAreas.length} work areas.`);

    // Store Work Areas in MongoDB
    for (const wa of workAreas) {
      await WorkArea.updateOne(
        { workAreaId: wa.id },
        { $set: { workAreaName: wa.name, driverId: wa.driverId, truckId: wa.truckId } },
        { upsert: true }
      );
    }

    // Fetch Polygons (Anchor Areas)
    const polygonRes = await axios.get(`${DRO_BASE_URL}/anchor-areas/${SERVICE_AREA_ID}/service-area/${ROUTE_PLAN_ID}/route-plan`, {
      headers: { Authorization: `Bearer ${DRO_AUTH_TOKEN}` }
    });

    const polygons = polygonRes.data;
    console.log(`✅ Retrieved ${polygons.length} polygons.`);

    // Store Polygons in MongoDB
    for (const poly of polygons) {
      await Polygon.updateOne(
        { anchorAreaId: poly.id },
        { $set: { name: poly.name, coordinates: poly.coordinates, workAreaId: poly.workAreaId, color: poly.color || "#FF0000" } },
        { upsert: true }
      );
    }

    console.log("✅ Data successfully saved to MongoDB!");
    process.exit();

  } catch (error) {
    console.error("❌ Error fetching DRO data:", error.response ? error.response.data : error.message);
    process.exit(1);
  }
};

// Run the script
fetchDROData();