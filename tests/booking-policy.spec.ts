import { expect, test } from "@playwright/test"
import { requiresAdvanceDeposit } from "../src/utils/dates"

test("deposit threshold is inclusive at 14 calendar days", () => {
  const today = new Date(2026, 0, 31, 12)
  expect(requiresAdvanceDeposit("2026-02-13", today)).toBe(false)
  expect(requiresAdvanceDeposit("2026-02-14", today)).toBe(true)
  expect(requiresAdvanceDeposit("2026-02-15", today)).toBe(true)
  expect(requiresAdvanceDeposit("", today)).toBe(false)
})

test("advance bookings require online payment; nearer dates offer arrival inquiries", async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 0, 1, 12) })
  await page.addInitScript(() => localStorage.setItem("suspiros-lang", "en"))
  await page.route("**/webhook/**", route => route.fulfill({ json: { success: true } }))
  await page.goto("/contact")
  const arrival = page.locator('input[type="radio"][value="on_arrival"]')
  await page.locator("#b-checkin").click()
  await page.locator('#b-checkin-calendar button[aria-pressed]').filter({ hasText: /^15$/ }).click()
  await expect(arrival).toBeDisabled()
  await expect(page.getByRole("button", { name: "Continue to secure payment" })).toBeVisible()
  await page.locator("#b-checkin").click()
  await page.locator('#b-checkin-calendar button[aria-pressed]').filter({ hasText: /^14$/ }).click()
  await expect(arrival).toBeEnabled()
  await expect(page.getByRole("button", { name: "Request booking · pay on arrival" })).toBeVisible()
})
