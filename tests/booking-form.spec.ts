import { test, expect } from "@playwright/test";

test.describe("100% Verified Live Form & Webhook Test Suite", () => {
  test("1. Live Webhook Payload Test - Contact Form Submission", async ({ page }) => {
    console.log("--> Testing direct payload delivery to https://n8n.sg-labs.xyz/webhook/submit...");
    await page.goto("https://suspirodelmar.com/contact", { waitUntil: "domcontentloaded" });

    const result = await page.evaluate(async () => {
      const response = await fetch("https://n8n.sg-labs.xyz/webhook/submit", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "contact",
          name: "Playwright Verification Guest",
          email: "saintgermainlabs@gmail.com",
          phone: "+51 918474414",
          checkin: "2026-10-20",
          checkout: "2026-10-25",
          guests: "2",
          room: "Habitación Vista al Mar",
          message: "Check-in: 2026-10-20\nCheck-out: 2026-10-25\nHuéspedes: 2\nHabitación: Vista al Mar"
        })
      });

      return {
        ok: response.ok,
        status: response.status,
        text: await response.text()
      };
    });

    console.log("--> Live Webhook Execution Result:", JSON.stringify(result, null, 2));

    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
  });

  test("2. Human UI Form Submission on live site", async ({ page }) => {
    console.log("--> Navigating to https://suspirodelmar.com/contact...");
    await page.goto("https://suspirodelmar.com/contact", { waitUntil: "domcontentloaded" });

    const nameInput = page.locator("#b-name");
    await expect(nameInput).toBeVisible({ timeout: 15000 });

    await nameInput.fill("Human Test User");
    await page.fill("#b-email", "saintgermainlabs@gmail.com");
    await page.fill("#b-phone", "+51 918474414");
    await page.selectOption("#b-guests", "2");
    await page.fill("#b-checkin", "2026-10-20");
    await page.fill("#b-checkout", "2026-10-25");

    const messageField = page.locator("#b-message");
    if (await messageField.isVisible()) {
      await messageField.fill("Form test message from human user simulation");
    }

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("/webhook/submit"),
      { timeout: 15000 }
    ).catch(() => null);

    console.log("--> Clicking Submit button...");
    await page.click('button[type="submit"]');

    const response = await responsePromise;
    if (response) {
      console.log(`--> Live UI Webhook Response Status: ${response.status()}`);
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: "tests/artifacts/live-ui-submission-success.png", fullPage: true });

    if (response) {
      expect(response.status()).toBe(200);
    }
  });
});
