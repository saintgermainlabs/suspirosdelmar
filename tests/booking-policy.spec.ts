import { expect, test } from "@playwright/test"
import { requiresAdvanceDeposit } from "../src/utils/dates"

test("deposit threshold is inclusive at 30 calendar days", () => {
  const today = new Date(2026, 0, 31, 12)
  expect(requiresAdvanceDeposit("2026-03-01", today)).toBe(false)
  expect(requiresAdvanceDeposit("2026-03-02", today)).toBe(true)
  expect(requiresAdvanceDeposit("2026-03-03", today)).toBe(true)
  expect(requiresAdvanceDeposit("", today)).toBe(false)
})

test("advance bookings only offer secure payment; nearer dates offer arrival inquiries", async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 0, 1, 12) })
  await page.addInitScript(() => localStorage.setItem("suspiros-lang", "en"))
  await page.route("**/webhook/**", route => route.fulfill({ json: { success: true } }))
  await page.goto("/contact")
  await expect(page.getByRole("link", { name: "Book a viewing on TidyCal" })).toHaveAttribute("href", "https://tidycal.com/smc/meeting")
  await expect(page.getByRole("button", { name: "Request booking · pay on arrival" })).toHaveCount(0)
  await page.locator("#b-checkin").click()
  await page.locator('#b-checkin-calendar button[aria-pressed]').filter({ hasText: /^31$/ }).click()
  await expect(page.getByRole("button", { name: "Request booking · pay on arrival" })).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Continue to secure payment" })).toBeVisible()
  await page.locator("#b-checkin").click()
  await page.locator('#b-checkin-calendar button[aria-pressed]').filter({ hasText: /^30$/ }).click()
  await expect(page.getByRole("button", { name: "Request booking · pay on arrival" })).toBeVisible()
})
