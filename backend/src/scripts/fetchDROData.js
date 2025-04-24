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
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=800,600',
    ],
  });

  await connectDB();

  const page = await browser.newPage();

  // Attempt to spoof headless detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  await page.goto("https://purpleid.okta.com/app/purpleid_routesmartdro_1/exk3v65bjnqglHK9W357/sso/saml", {
    waitUntil: "networkidle2"
  });

  // Automatically fill Okta login form with updated selectors
  await page.waitForSelector('input[name="identifier"]', { timeout: 30000 });
  await page.type('input[name="identifier"]', '8785549', { delay: 100 });
  
  await page.waitForSelector('input[name="credentials.passcode"]', { timeout: 30000 });
  await page.type('input[name="credentials.passcode"]', 'Hizmet@2025@', { delay: 100 });
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('input[type="submit"], button[data-type="save"]')
  ]);

  console.log("🔐 Please log in manually via the popup...");

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Wait until redirected to the authorized page
  await page.waitForFunction(
    () => window.location.href.includes("https://dro.routesmart.com/authorization/saml/csp"),
    { timeout: 180000 }
  );

  console.log("🔓 Login completed, continuing data fetch...");
  
  const client = await page.target().createCDPSession();
  const { windowId } = await client.send('Browser.getWindowForTarget');
  await client.send('Browser.setWindowBounds', {
    windowId,
    bounds: { windowState: 'minimized' }
  });

  const cookies = await page.cookies();
  await page.close();
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
      isActive: false,
    }));

    await ServiceArea.insertMany(serviceAreaDocs);
    console.log(`✅ Saved ${serviceAreaDocs.length} service areas to MongoDB`);

    // Ensure correct isActive after insert
    const existingActive = await ServiceArea.findOne({ userId, isActive: true });
    const newServiceAreas = await ServiceArea.find({ userId });

    if (existingActive) {
      const stillExists = newServiceAreas.some(area => area.serviceAreaId === existingActive.serviceAreaId);
      if (!stillExists) {
        await ServiceArea.updateMany({ userId }, { $set: { isActive: false } });
        await ServiceArea.updateOne({ userId, serviceAreaId: newServiceAreas[0].serviceAreaId }, { $set: { isActive: true } });
      }
    } else {
      await ServiceArea.updateOne({ userId, serviceAreaId: newServiceAreas[0].serviceAreaId }, { $set: { isActive: true } });
    }

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

    const webMercatorToLatLng = (x, y) => {
      const rMajor = 6378137.0;
      const shift = Math.PI * rMajor;
      const lng = (x / shift) * 180.0;
      let lat = (y / shift) * 180.0;
      lat = (180 / Math.PI) * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2);
      return [lng, lat];
    };

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
        const shapeData = poly.shape;
        try {
          const parsedShape = typeof shapeData === 'string' ? JSON.parse(shapeData) : shapeData;
          const transformedShape = parsedShape.rings[0].map(([x, y]) => {
            const [lng, lat] = webMercatorToLatLng(x, y);
            return [lng, lat];
          });

          await Polygon.updateOne(
            { anchorAreaId: poly.anchorAreaId, day, userId },
            {
              $set: {
                anchorAreaId: poly.anchorAreaId,
                serviceAreaId: poly.serviceAreaId,
                name: poly.name,
                station: poly.station || "",
                coordinates: transformedShape,
                anchorAreaTypes: poly.anchorAreaTypes || [],
                day,
                userId,
              },
            },
            { upsert: true }
          );
          count++;
        } catch (err) {
          console.warn(`⚠️ Skipping ${poly.name} — failed to parse or convert shape data:`, err.message);
        }
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
  } catch (err) {
    console.error("❌ Failed to fetch polygons:", err.response?.data || err.message);
  }

  await browser.close();
}

module.exports = fetchPolygonsForAllPlans;