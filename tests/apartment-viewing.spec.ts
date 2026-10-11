import { expect, test } from "@playwright/test"

test("stay date selectors open local calendars without TidyCal", async ({ page }) => {
  await page.goto("/")
  await page.locator("#home-checkin").click()
  await expect(page.locator("#home-checkin-calendar")).toBeVisible()
  await expect(page.locator(".tidycal-embed")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await page.goto("/contact")
  await page.locator("#b-checkout").click()
  await expect(page.locator("#b-checkout-calendar")).toBeVisible()
  await expect(page.locator('iframe[src*="tidycal.com"]')).toHaveCount(0)
})

test("TidyCal is separate and only schedules apartment viewings", async ({ page }) => {
  await page.route("https://asset-tidycal.b-cdn.net/js/embed.js", (route) => route.fulfill({ contentType: "application/javascript", body: "" }))
  await page.goto("/apartment")
  const section = page.locator("#apartment-viewing")
  await expect(section.locator(".tidycal-embed")).toHaveAttribute("data-path", "smc/meeting")
  await expect(section.locator('a[target="_blank"]')).toHaveAttribute("href", "https://tidycal.com/smc/meeting")
  await expect(page.locator("#reservation-form .tidycal-embed")).toHaveCount(0)
  await page.locator("#b-checkin").click()
  await expect(page.locator("#b-checkin-calendar")).toBeVisible()
})
