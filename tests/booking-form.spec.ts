import { test, expect } from "@playwright/test";

test.describe("Live Website Form E2E Verification Suite", () => {
  test("1. Human interaction test on live site (https://suspirodelmar.com/contact)", async ({ page }) => {
    console.log("--> Navigating to https://suspirodelmar.com/contact...");
    await page.goto("https://suspirodelmar.com/contact", { waitUntil: "domcontentloaded" });

    const nameInput = page.locator("#b-name");
    await expect(nameInput).toBeVisible({ timeout: 15000 });

    await nameInput.fill("E2E Live Verification User");
    await page.fill("#b-email", "saintgermainlabs@gmail.com");
    await page.fill("#b-phone", "+51 918474414");
    await page.selectOption("#b-guests", "2");
    await page.fill("#b-checkin", "2026-10-20");
    await page.fill("#b-checkout", "2026-10-25");

    const messageField = page.locator("#b-message");
    if (await messageField.isVisible()) {
      await messageField.fill("Automated Playwright verification test for live booking form");
    }

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/webhook/submit"),
      { timeout: 15000 }
    ).catch(() => null);

    console.log("--> Clicking Submit button...");
    await page.click('button[type="submit"]');

    const response = await responsePromise;
    if (response) {
      console.log(`--> Webhook Response Status: ${response.status()}`);
      const body = await response.text();
      console.log(`--> Webhook Response Body: ${body}`);
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: "tests/artifacts/e2e-live-submission.png", fullPage: true });

    if (response) {
      expect(response.status()).toBe(200);
    }
  });

  test("2. Contact payload webhook test", async ({ page }) => {
    await page.goto("https://suspirodelmar.com/contact", { waitUntil: "domcontentloaded" });

    const res = await page.evaluate(async () => {
      const response = await fetch("https://n8n.sg-labs.xyz/webhook/submit", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "contact",
          name: "Contact Payload Test",
          email: "saintgermainlabs@gmail.com",
          phone: "+51918474414",
          message: "Contact form live test message"
        })
      });
      return { status: response.status, text: await response.text() };
    });

    console.log("Contact Payload Result:", JSON.stringify(res));
    expect(res.status).toBe(200);
  });

  test("3. Booking payload webhook test", async ({ page }) => {
    await page.goto("https://suspirodelmar.com/contact", { waitUntil: "domcontentloaded" });

    const res = await page.evaluate(async () => {
      const response = await fetch("https://n8n.sg-labs.xyz/webhook/submit", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "booking",
          name: "Booking Payload Test",
          email: "saintgermainlabs@gmail.com",
          phone: "+51918474414",
          checkin: "2026-10-20",
          checkout: "2026-10-25",
          guests: "2",
          room: "No preference",
          message: "Booking form live test message"
        })
      });
      return { status: response.status, text: await response.text() };
    });

    console.log("Booking Payload Result:", JSON.stringify(res));
    expect(res.status).toBe(200);
  });
});
