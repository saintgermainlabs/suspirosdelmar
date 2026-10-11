import { expect, test } from "@playwright/test"

test("blank and whitespace-only inquiry fields cannot submit", async ({ page }) => {
  let submissions = 0
  await page.route("**/webhook/**", async (route) => {
    submissions += 1
    await route.fulfill({ json: { success: true } })
  })
  await page.goto("/contact")
  const form = page.locator("form").filter({ has: page.locator("#b-name") })
  await form.locator('button[type="submit"]').click()
  for (const field of ["name", "email", "phone", "checkin", "checkout", "message"]) {
    await expect(page.locator(`#b-${field}`)).toHaveAttribute("aria-invalid", "true")
    await expect(page.locator(`#b-${field}-error`)).toBeVisible()
  }
  await expect(page.locator("#b-name")).toBeFocused()
  await page.locator("#b-name").fill("   ")
  await page.locator("#b-email").fill("invalid")
  await page.locator("#b-phone").fill("abc")
  await page.locator("#b-message").fill("   ")
  await form.locator('button[type="submit"]').click()
  for (const field of ["name", "email", "phone", "message"]) {
    await expect(page.locator(`#b-${field}`)).toHaveAttribute("aria-invalid", "true")
  }
  expect(submissions).toBe(0)
})

test("a complete inquiry submits trimmed contact information", async ({ page }) => {
  let payload: Record<string, string> | undefined
  await page.route("**/webhook/**", async (route) => {
    payload = route.request().postDataJSON()
    await route.fulfill({ json: { success: true } })
  })
  await page.goto("/contact")
  await page.locator("#b-name").fill(" Test Guest ")
  await page.locator("#b-email").fill("guest@example.com")
  await page.locator("#b-phone").fill("+1 (210) 365-9988")
  await page.locator("#b-message").fill("Please confirm availability.")
  await page.locator("#b-checkin").click()
  await page.locator('#b-checkin-calendar button[aria-pressed]:not([disabled])').first().click()
  await page.locator("#b-checkout").click()
  await page.locator('#b-checkout-calendar button[aria-pressed]:not([disabled])').first().click()
  await page.locator('form button[type="submit"]').click()
  await expect.poll(() => payload?.name).toBe("Test Guest")
  expect(payload?.phone).toBe("+1 (210) 365-9988")
})
