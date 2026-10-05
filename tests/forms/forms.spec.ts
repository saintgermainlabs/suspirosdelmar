import { test, expect, type Page, type Request } from "@playwright/test"

/**
 * E2E suite for every form on the site.
 *
 * All booking/contact submissions go through src/components/BookingForm.tsx,
 * which POSTs JSON to VITE_N8N_WEBHOOK_URL (n8n `/webhook/submit`).
 *
 * - Default run: webhook is intercepted (mocked), so nothing reaches n8n.
 * - LIVE_E2E=1: real submissions hit production n8n (sends real emails/WhatsApp).
 *   Test data is tagged "E2E-TEST <id>" so it can be found in n8n executions.
 */

const WEBHOOK = "**/webhook/submit"
const LIVE = !!process.env.LIVE_E2E
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || "saintgermainlabs@gmail.com"

// Spanish is the default language; room labels come from src/i18n.ts roomOptions.
const FORM_PAGES = [
  { name: "contact", path: "/contact", room: "No preference" },
  { name: "room sea-breeze", path: "/rooms/sea-breeze", room: "Habitación Brisa del Mar — S/ 80" },
  { name: "room double-sunset", path: "/rooms/double-sunset", room: "Habitación Doble Atardecer — S/ 80" },
  { name: "room family-shore", path: "/rooms/family-shore", room: "Habitación Familiar Orilla — S/ 80" },
  { name: "room ocean-calm", path: "/rooms/ocean-calm", room: "Habitación Calma Oceánica — S/ 80" },
  { name: "apartment", path: "/apartment", room: "Apartamento Superior — S/ 180" },
]

const SUCCESS = /Solicitud recibida|Request received/

function testId(form: string) {
  const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12)
  return `E2E-${ts}-${form.replace(/\s+/g, "-")}`
}

async function fillBookingForm(page: Page, id: string) {
  await page.fill("#b-name", `E2E-TEST ${id}`)
  await page.fill("#b-email", TEST_EMAIL)
  await page.fill("#b-phone", "+51 918474414")
  await page.fill("#b-checkin", "2026-11-10")
  await page.fill("#b-checkout", "2026-11-13")
  await page.selectOption("#b-guests", "2")
  await page.fill("#b-message", `Automated test ${id} - please ignore`)
}

/** Intercept the webhook and record every POST made to it. */
async function mockWebhook(page: Page, status = 200, body?: string) {
  const posts: Request[] = []
  await page.route(WEBHOOK, async (route) => {
    const req = route.request()
    if (req.method() === "POST") posts.push(req)
    await route.fulfill({
      status,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
      contentType: "application/json",
      body: body ?? JSON.stringify({ success: status < 400, message: "mock" }),
    })
  })
  return posts
}

for (const form of FORM_PAGES) {
  test.describe(`Booking form: ${form.name}`, () => {
    test("blocks empty submission (required fields)", async ({ page }) => {
      const posts = await mockWebhook(page)
      await page.goto(form.path)
      await page.click('form button[type="submit"]')

      const invalid = await page.$$eval("form :invalid", (els) => els.map((e) => e.id))
      expect(invalid).toEqual(expect.arrayContaining(["b-name", "b-email", "b-checkin", "b-checkout"]))
      expect(posts).toHaveLength(0)
    })

    test("sends correct payload and shows success (mocked n8n)", async ({ page }) => {
      const posts = await mockWebhook(page)
      const id = testId(form.name)
      await page.goto(form.path)
      await fillBookingForm(page, id)
      await page.click('form button[type="submit"]')

      await expect(page.getByText(SUCCESS)).toBeVisible()
      expect(posts).toHaveLength(1)
      expect(posts[0].postDataJSON()).toMatchObject({
        form_type: "contact",
        name: `E2E-TEST ${id}`,
        email: TEST_EMAIL,
        phone: "+51 918474414",
        checkin: "2026-11-10",
        checkout: "2026-11-13",
        guests: "2",
        room: form.room,
      })
      expect(posts[0].postDataJSON().message).toContain(id)
    })

    for (const status of [400, 500]) {
      test(`shows error message when n8n responds ${status}`, async ({ page }) => {
        await mockWebhook(page, status)
        await page.goto(form.path)
        await fillBookingForm(page, testId(form.name))
        await page.click('form button[type="submit"]')

        await expect(page.getByText(/Ocurrió un inconveniente/)).toBeVisible()
        await expect(page.getByText(SUCCESS)).toHaveCount(0)
      })
    }

    test("shows error when n8n returns 200 with an empty body (workflow stopped early)", async ({ page }) => {
      await mockWebhook(page, 200, "")
      await page.goto(form.path)
      await fillBookingForm(page, testId(form.name))
      await page.click('form button[type="submit"]')

      await expect(page.getByText(/Ocurrió un inconveniente/)).toBeVisible()
      await expect(page.getByText(SUCCESS)).toHaveCount(0)
    })

    test("shows error message when the network request fails", async ({ page }) => {
      await page.route(WEBHOOK, (route) => route.abort("failed"))
      await page.goto(form.path)
      await fillBookingForm(page, testId(form.name))
      await page.click('form button[type="submit"]')

      await expect(page.getByText(/Ocurrió un inconveniente/)).toBeVisible()
      await expect(page.getByText(SUCCESS)).toHaveCount(0)
    })

    test("live submission reaches n8n (200)", async ({ page }) => {
      test.skip(!LIVE, "set LIVE_E2E=1 to submit to production n8n")
      const id = testId(form.name)
      await page.goto(form.path)
      await fillBookingForm(page, id)

      const responseP = page.waitForResponse(
        (r) => r.url().includes("/webhook/submit") && r.request().method() === "POST",
        { timeout: 30_000 },
      )
      await page.click('form button[type="submit"]')
      const response = await responseP

      test.info().annotations.push({ type: "test-id", description: id })
      expect(response.status()).toBe(200)
      // Empty body = workflow stopped before "Respond to Webhook" (email/WhatsApp failed)
      expect(await response.json().catch(() => null)).toMatchObject({ success: true })
      await expect(page.getByText(SUCCESS)).toBeVisible()
      await page.screenshot({ path: `tests/artifacts/live-${form.name.replace(/\s+/g, "-")}.png`, fullPage: true })
    })
  })
}

test.describe("Home availability widget", () => {
  const ROUTES = [
    { roomIndex: "", expected: "/contact" },
    { roomIndex: "0", expected: "/rooms/sea-breeze" },
    { roomIndex: "3", expected: "/rooms/ocean-calm" },
    { roomIndex: "4", expected: "/apartment" },
  ]

  for (const { roomIndex, expected } of ROUTES) {
    test(`routes room "${roomIndex || "any"}" to ${expected}`, async ({ page }) => {
      await page.goto("/")
      await page.selectOption("#home-room", roomIndex)
      await page.getByRole("button", { name: /Ver disponibilidad|Check availability/i }).click()
      await expect(page).toHaveURL(new RegExp(`${expected}$`))
      await expect(page.locator("#b-name")).toBeVisible()
    })
  }

  test("carries dates and guests into the booking form", async ({ page }) => {
    await page.goto("/")
    await page.fill("#home-checkin", "2026-11-10")
    await page.fill("#home-checkout", "2026-11-13")
    await page.selectOption("#home-guests", "3")
    await page.getByRole("button", { name: /Ver disponibilidad|Check availability/i }).click()

    await expect(page.locator("#b-checkin")).toHaveValue("2026-11-10")
    await expect(page.locator("#b-checkout")).toHaveValue("2026-11-13")
    await expect(page.locator("#b-guests")).toHaveValue("3")
  })
})
