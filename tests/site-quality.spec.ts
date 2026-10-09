import { expect, test } from "@playwright/test"

test("metadata uses clean canonical URLs and resets social images", async ({ page }) => {
  await page.goto("/rooms/sea-breeze?tracking=test#photos")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/rooms\/sea-breeze$/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https?:\/\/.*\/images\/Bedroom1.jpg$/)
  await page.goto("/contact")
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https?:\/\/.*\/images\/Common_Room_View1.jpg$/)
})

test("booking requires checkout after checkin without sending a request", async ({ page }) => {
  let submitted = false
  await page.route("**/webhook/**", async (route) => {
    submitted = true
    await route.fulfill({ json: { success: true } })
  })
  await page.goto("/contact")
  await page.locator("#b-name").fill("Test Guest")
  await page.locator("#b-email").fill("guest@example.com")
  const start = new Date()
  start.setDate(start.getDate() + 7)
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  const checkin = format(start)
  start.setDate(start.getDate() + 1)
  await page.locator("#b-checkin").fill(checkin)
  await expect(page.locator("#b-checkout")).toHaveAttribute("min", format(start))
  await page.locator("#b-checkout").fill(checkin)
  await page.locator('button[type="submit"]').click()
  expect(await page.locator("#b-checkout").evaluate((input: HTMLInputElement) => input.validity.rangeUnderflow)).toBe(true)
  expect(submitted).toBe(false)
})

test("unknown pages have an accessible noindex fallback", async ({ page }) => {
  await page.goto("/not-a-real-page")
  await expect(page.locator("main h1")).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow")
})

test("remote heroes have responsive sources and secondary photos are lazy loaded", async ({ page }) => {
  await page.goto("/rooms")
  await expect(page.locator('main section img').first()).toHaveAttribute("srcset", /400w/)
  await expect(page.locator('main section img').first()).toHaveAttribute("fetchpriority", "high")
  await page.goto("/gallery")
  await expect(page.locator('button img').first()).toHaveAttribute("loading", "lazy")
})
