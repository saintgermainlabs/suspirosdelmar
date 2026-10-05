import { test, expect } from "@playwright/test"

test("Playwright Human Form Test against live website after environment variable redeploy", async ({
  page,
}) => {
  console.log("--> Navigating to http://suspirodelmar.com/contact...")
  await page.goto("http://suspirodelmar.com/contact", {
    waitUntil: "domcontentloaded",
  })

  // Wait for name input
  const nameInput = page.locator("#b-name")
  await expect(nameInput).toBeVisible({ timeout: 15000 })
  console.log("--> Form loaded successfully on redeployed site!")

  // Fill form as a human user
  await nameInput.fill("Live Test User")
  await page.fill("#b-email", "live.test@example.com")
  await page.fill("#b-phone", "+51 918474414")
  await page.selectOption("#b-guests", "2")
  await page.fill("#b-checkin", "2026-10-20")
  await page.fill("#b-checkout", "2026-10-25")

  const messageField = page.locator("#b-message")
  if (await messageField.isVisible()) {
    await messageField.fill(
      "Live verification test after Coolify environment variable rebuild",
    )
  }

  // Intercept request & click submit
  const requestPromise = page.waitForRequest(
    (req) => req.url().includes("/webhook/submit"),
    { timeout: 10000 },
  ).catch(() => null)

  const responsePromise = page.waitForResponse(
    (res) => res.url().includes("/webhook/submit"),
    { timeout: 10000 },
  ).catch(() => null)

  console.log("--> Submitting form...")
  await page.click('button[type="submit"]')

  const request = await requestPromise
  if (request) {
    console.log("--> Target Webhook URL called by site:", request.url())
    console.log("--> Target Webhook Method:", request.method())
  }

  const response = await responsePromise
  if (response) {
    console.log("--> Target Webhook Response Status:", response.status())
  }

  await page.waitForTimeout(2000)

  // Save screenshot artifact
  await page.screenshot({
    path: "tests/artifacts/post-redeploy-success.png",
    fullPage: true,
  })

  expect(request?.url()).toContain("https://n8n.sg-labs.xyz/webhook/submit")
  expect(response?.status()).toBe(200)
})
