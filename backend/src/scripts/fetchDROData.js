const puppeteer = require("puppeteer-core");
const axios = require("axios");
const mongoose = require("mongoose");
const Polygon = require("../models/Polygon");
const VehicleSet = require("../models/VehicleSet");
const ServiceArea = require("../models/ServiceArea");
const connectDB = require("../config/db");

const DRO_BASE = "https://pdv2.dro.routesmart.com/api/api";

async function fetchPolygonsForAllPlans(userId) {
  if (!userId) {
    throw new Error("User ID is required to fetch and save data.");
  }

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--start-maximized"],
  });

  await connectDB();

  const page = await browser.newPage();
  await page.goto("https://dro.routesmart.com/login");

  await page.waitForSelector("button");
  const buttons = await page.$$("button");
  await buttons[0].click();

  console.log("🔐 Please log in manually via the popup...");

  await page.waitForResponse(
    (res) => res.url().includes("/api/api/service-areas") && res.status() === 200,
    { timeout: 180000 }
  );

  const cookies = await page.cookies();
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

  const headers = {
    Cookie: cookieHeader,
    "User-Agent": "Mozilla/5.0",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://dro.routesmart.com/"
  };

  try {
    const serviceAreasRes = await axios.get("https://dro.routesmart.com/api/api/service-areas", { headers });
    const serviceAreas = serviceAreasRes.data;
    if (!Array.isArray(serviceAreas) || serviceAreas.length === 0) {
      throw new Error("No service areas found.");
    }

    // Remove existing service areas for the user before inserting new ones
    await ServiceArea.deleteMany({ userId });

    const serviceAreaDocs = serviceAreas.map((area) => ({
      userId,
      serviceAreaId: area.serviceAreaId,
      csa: area.csa,
      businessName: area.businessName,
      stationId: area.stationId,
      stationName: area.stationName,
      createdAt: new Date(),
    }));

    await ServiceArea.insertMany(serviceAreaDocs);
    console.log(`✅ Saved ${serviceAreaDocs.length} service areas to MongoDB`);

    const serviceAreaId = serviceAreasRes.data?.[0]?.serviceAreaId;
    if (!serviceAreaId) {
      throw new Error("No serviceAreaId found.");
    }

    const activePlanRes = await axios.get(`https://pdv2.dro.routesmart.com/api/api/service-areas/${serviceAreaId}/active-plan`, { headers });
    const planIdByDay = {};
    for (const [day, plan] of Object.entries(activePlanRes.data)) {
      if (plan?.id) {
        planIdByDay[day] = plan.id;
      }
    }

    for (const [day, planId] of Object.entries(planIdByDay)) {
      console.log(`📦 Fetching polygons for ${day} (Plan ID: ${planId})...`);

      const res = await axios.get(
        `${DRO_BASE}/anchor-areas/${serviceAreaId}/service-area/${planId}/route-plan`,
        { headers }
      );

      const polygons = res.data;
      console.log(`🧹 Deleting existing polygons for Service Area ${serviceAreaId}, Day: ${day}`);
      await Polygon.deleteMany({ serviceAreaId: serviceAreaId, day: day, userId });
      console.log(`🧹 Cleared existing polygons for ${day}`);
      let count = 0;
      for (const poly of polygons) {
        await Polygon.updateOne(
          { anchorAreaId: poly.anchorAreaId, day, userId },
          {
            $set: {
              name: poly.name,
              coordinates: poly.shape?.rings,
              serviceAreaId: poly.serviceAreaId,
              day,
              userId,
            },
          },
          { upsert: true }
        );
        count++;
      }
      console.log(`✅ ${day} polygons saved to MongoDB (${count} items)`);

      console.log(`🚚 Fetching advanced vehicle set for ${day} (Plan ID: ${planId})...`);
      const vehicleSetRes = await axios.get(
        `${DRO_BASE}/service-areas/${serviceAreaId}/route-plans/${planId}/advanced-vehicle-set`,
        { headers }
      );

      const vehicleSet = vehicleSetRes.data;

      await VehicleSet.deleteMany({ serviceAreaId, day, userId });

      await VehicleSet.create({
        serviceAreaId,
        day,
        planId,
        data: vehicleSet,
        userId,
        updatedAt: new Date()
      });

      console.log(`✅ ${day} vehicle set saved to MongoDB`);
    }
    console.log("🏁 Finished fetching all polygons.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to fetch polygons:", err.response?.data || err.message);
  }

  await browser.close();
}

module.exports = fetchPolygonsForAllPlans;