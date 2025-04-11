const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

const DRO_LOGIN_URL = "https://dro.routesmart.com/login";
const OKTA_URL = "purpleid.okta.com";

async function loginToDRO() {
  const browser = await puppeteer.launch({
    headless: false, // Run in visible mode
    defaultViewport: null,
    args: ["--start-maximized", "--disable-notifications"],
  });

  const page = await browser.newPage();
  console.log("🔄 Opening DRO Login Page...");
  await page.goto(DRO_LOGIN_URL, { waitUntil: "networkidle2" });

  // Click on "Service Providers"
  console.log("🔄 Clicking 'Service Providers'...");
  await page.waitForSelector("button:nth-child(1)", { visible: true });
  await page.click("button:nth-child(1)");

  // Wait for Okta Login
  console.log("🔄 Waiting for you to log in manually...");
  await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds for manual login

  console.log("✅ Resuming after manual login...");

  // Wait for navigation to confirm login
  try {
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
    console.log("✅ Login successful!");
  } catch (error) {
    console.error("⚠️ Login navigation timeout. Continuing anyway...");
  }

  // Extract session cookies
  const cookies = await page.cookies();
  const sessionCookies = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

  // Save cookies
  fs.writeFileSync("dro_session.txt", sessionCookies);
  console.log("✅ Session cookies saved to 'dro_session.txt'");

  // Continue with API requests using the session
  console.log("🔄 Fetching service areas...");
  try {
    const response = await page.evaluate(async (sessionCookies) => {
      const res = await fetch("https://pdv2.dro.routesmart.com/api/api/service-areas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: sessionCookies,
        },
      });
      return await res.json();
    }, sessionCookies);

    console.log("✅ Service Areas:", response);
    fs.writeFileSync("service_areas.json", JSON.stringify(response, null, 2));
    console.log("✅ Data saved to 'service_areas.json'");
  } catch (error) {
    console.error("❌ Failed to fetch service areas:", error.message);
  }

  await browser.close();
}

loginToDRO();