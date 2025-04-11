const puppeteer = require("puppeteer-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Polygon = require("../models/Polygon");
const WorkArea = require("../models/WorkArea");
const connectDB = require("../config/db");

const DRO_BASE = "https://pdv2.dro.routesmart.com/api/api";

async function fetchDROData() {
  await connectDB();

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.goto("https://dro.routesmart.com/login");

  // Click "Service Providers"
  await page.waitForSelector("button");
  const buttons = await page.$$("button");
  await buttons[0].click();

  console.log("🔐 Please log in manually via the popup...");

  // Wait until service-areas loads to confirm login
  await page.waitForResponse(
    (res) => res.url().includes("/api/api/service-areas") && res.status() === 200,
    { timeout: 180000 }
  );

  const cookies = await page.cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const headers = { Cookie: cookieHeader, "User-Agent": "Mozilla/5.0" };

  // STEP 1: Get Service Area ID
  const serviceAreas = await axios.get("https://dro.routesmart.com/api/api/service-areas", { headers });
  const serviceAreaId = serviceAreas.data[0].serviceAreaId;

  // STEP 2: Get Active Route Plan IDs
  const planRes = await axios.get(`${DRO_BASE}/service-areas/${serviceAreaId}/active-plan`, { headers });
  const routePlans = planRes.data;

  // Save fetched routePlans for dev
  fs.writeFileSync(path.join(__dirname, "../../routePlans.json"), JSON.stringify(routePlans, null, 2));

  for (const [day, plan] of Object.entries(routePlans)) {
    const routePlanId = plan.id;
    console.log(`📦 Fetching data for ${day}...`);

    // STEP 3a: Fetch Work Areas (Advanced Vehicle Set)
    const vehicleRes = await axios.get(`${DRO_BASE}/service-areas/${serviceAreaId}/route-plans/${routePlanId}/advanced-vehicle-set`, { headers });
    const workAreas = vehicleRes.data;
    fs.writeFileSync(path.join(__dirname, `../../workAreas_${day}.json`), JSON.stringify(workAreas, null, 2));

    for (const wa of workAreas) {
      await WorkArea.updateOne(
        { workAreaId: wa.id, day },
        {
          $set: {
            workAreaName: wa.name,
            driverId: wa.driverId,
            truckId: wa.truckId,
            day,
          },
        },
        { upsert: true }
      );
    }

    // STEP 3b: Fetch Polygons (Anchor Areas)
    const polygonRes = await axios.get(`${DRO_BASE}/anchor-areas/${serviceAreaId}/service-area/${routePlanId}/route-plan`, { headers });
    const polygons = polygonRes.data;
    fs.writeFileSync(path.join(__dirname, `../../polygons_${day}.json`), JSON.stringify(polygons, null, 2));

    for (const poly of polygons) {
      await Polygon.updateOne(
        { anchorAreaId: poly.id, day },
        {
          $set: {
            name: poly.name,
            coordinates: poly.coordinates,
            workAreaId: poly.workAreaId,
            color: poly.color || "#FF0000",
            day,
          },
        },
        { upsert: true }
      );
    }

    console.log(`✅ Saved data for ${day}`);
  }

  await browser.close();
  console.log("🎉 All data fetched and saved to MongoDB + JSON!");
  process.exit();
}

fetchDROData();