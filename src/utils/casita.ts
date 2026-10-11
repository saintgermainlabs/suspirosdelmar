export type Provider = "mercadopago" | "paypal"
export interface CasitaRoom {
  id: string
  name: string
  maxGuests: number
  ratePen: number | null
  rateUsd: number | null
  bookablePen: boolean
  bookableUsd: boolean
}
export interface RoomsResponse {
  property: { id: string; name: string; depositPercent: number }
  rooms: CasitaRoom[]
  unavailable?: Record<string, { start: string; end: string }[]>
}
export interface Hold {
  publicRef: string
  provider: Provider
  total: number
  deposit: number
  balance: number
  holdExpiresAt: string
}
export interface BookingStatus {
  status: "hold" | "confirmed" | "paid_in_full" | "cancelled" | "expired"
  confirmed: boolean
  paidInFull: boolean
  cancelled: boolean
  total: number
  deposit: number
  balance: number
  amountPaid: number
  holdExpiresAt?: string
  checkIn?: string
  checkOut?: string
  payment: { id: string; status: string; checkoutUrl: string; expiresAt: string } | null
}
export interface SavedBooking {
  email: string
  checkIn: string
  checkOut: string
  hold: Hold
}
export const casita = {
  baseUrl: (import.meta.env.VITE_CASITA_BASE_URL || "https://bookings.sg-labs.xyz").replace(/\/+$/, ""),
  propertyId: import.meta.env.VITE_CASITA_PROPERTY_ID || "",
}
export class CasitaError extends Error {
  constructor(public code: number) { super("Casita request failed") }
}
export async function casitaRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${casita.baseUrl}/api/public${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
      signal: options.signal ?? AbortSignal.timeout(15000),
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    })
  } catch { throw new CasitaError(0) }
  if (!response.ok) throw new CasitaError(response.status)
  try { return await response.json() as T } catch { throw new CasitaError(500) }
}
export function paymentError(error: unknown): "invalid" | "conflict" | "unprocessable" | "limited" | "network" | "service" | "notFound" {
  const code = error instanceof CasitaError ? error.code : 500
  switch (code) {
    case 0: return "network"
    case 400: return "invalid"
    case 409: return "conflict"
    case 422: return "unprocessable"
    case 429: return "limited"
    case 401:
    case 403:
    case 404: return "notFound"
    default: return "service"
  }
}
export function saveBooking(booking: SavedBooking) {
  try { sessionStorage.setItem(`casita:${booking.hold.publicRef}`, JSON.stringify(booking)) } catch { /* Email can be entered on return if storage is unavailable. */ }
}
export function readBooking(ref: string): SavedBooking | null {
  try { return JSON.parse(sessionStorage.getItem(`casita:${ref}`) || "null") } catch { return null }
}
export async function openCheckout(ref: string, email: string) {
  const result = await casitaRequest<{ publicRef: string; checkoutUrl: string; paymentId: string }>(`/bookings/${encodeURIComponent(ref)}/checkout`, {
    method: "POST", body: JSON.stringify({ email, purpose: "deposit" }),
  })
  const url = new URL(result.checkoutUrl)
  const allowed = ["paypal.com", "mercadopago.com", "mercadopago.com.pe"]
  if (url.protocol !== "https:" || url.username || url.password || !allowed.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) throw new CasitaError(500)
  window.location.assign(url.href)
}
export function overlaps(checkIn: string, checkOut: string, ranges: { start: string; end: string }[]) {
  return ranges.some(range => checkIn < range.end.slice(0, 10) && checkOut > range.start.slice(0, 10))
}
