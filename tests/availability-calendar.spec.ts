import { expect, test } from "@playwright/test"

test("inquiry availability button opens a large separate calendar dialog", async ({ page }) => {
  await page.route("**/api/public/rooms?**", async (route) => {
    const from = new URL(route.request().url()).searchParams.get("from")!
    await route.fulfill({ json: {
      property: { id: "test", name: "Test property", depositPercent: 50 },
      rooms: [{ id: "room-1", name: "Test room", maxGuests: 2, ratePen: 80, rateUsd: null, bookablePen: true, bookableUsd: false }],
      unavailable: { "room-1": [{ start: from, end: from.slice(0, 8) + "28" }] },
    } })
  })
  await page.goto("/contact")
  const dialog = page.locator('dialog[aria-labelledby="availability-title"]')
  await page.locator('button[aria-haspopup="dialog"]').filter({ hasText: /Ver disponibilidad|View availability/ }).click()
  await expect(dialog).toBeVisible()
  await expect(dialog.locator("h2")).toHaveText(/Disponibilidad de alojamiento|Accommodation availability/)
  await expect(dialog.locator('iframe[src*="tidycal"]')).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(dialog).not.toBeVisible()
})
