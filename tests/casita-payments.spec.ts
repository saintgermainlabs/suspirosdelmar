import { test, expect } from "@playwright/test"

const ref = "SDM-TEST"
const pending = {
  status: "hold", confirmed: false, paidInFull: false, cancelled: false,
  total: 480, deposit: 96, balance: 384, amountPaid: 0,
  payment: { id: "test", status: "pending", checkoutUrl: "https://www.paypal.com/checkout/test", expiresAt: new Date(Date.now() + 1800000).toISOString() },
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("suspiros-lang", "en"))
})

test("return query does not confirm payment; polling verifies backend status", async ({ page }) => {
  let calls = 0
  await page.route("**/api/public/bookings/SDM-TEST?**", route => route.fulfill({ json: ++calls === 1 ? pending : { ...pending, status: "confirmed", confirmed: true, amountPaid: 96 } }))
  await page.goto(`/reserva/${ref}?pago=ok`)
  await expect(page.getByRole("heading", { name: "Your booking is confirmed" })).toHaveCount(0)
  await page.getByRole("textbox", { name: "Email" }).fill("guest@example.com")
  await page.getByRole("button", { name: "Check booking status" }).click()
  await expect(page.getByText("Time remaining to pay:")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Your booking is confirmed" })).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole("button", { name: "Continue to secure checkout" })).toHaveCount(0)
})

test("expired booking offers a new booking, not checkout retry", async ({ page }) => {
  await page.route("**/api/public/bookings/SDM-TEST?**", route => route.fulfill({ json: { ...pending, status: "expired" } }))
  await page.goto(`/reserva/${ref}`)
  await page.getByRole("textbox", { name: "Email" }).fill("guest@example.com")
  await page.getByRole("button", { name: "Check booking status" }).click()
  await expect(page.getByRole("heading", { name: "This booking hold has expired" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Start a new booking" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Continue to secure checkout" })).toHaveCount(0)
})

test("checkout failure preserves a valid hold for retry", async ({ page }) => {
  await page.route("**/api/public/bookings/SDM-TEST?**", route => route.fulfill({ json: pending }))
  await page.route("**/api/public/bookings/SDM-TEST/checkout", route => route.fulfill({ status: 429, json: {} }))
  await page.goto(`/reserva/${ref}?pago=fallo`)
  await page.getByRole("textbox", { name: "Email" }).fill("guest@example.com")
  await page.getByRole("button", { name: "Check booking status" }).click()
  const checkout = page.getByRole("button", { name: "Continue to secure checkout" })
  await expect(checkout).toBeEnabled()
  await checkout.click()
  await expect(page.getByRole("alert")).toContainText("Too many attempts")
  await expect(checkout).toBeEnabled()
})
