# Casita guest checkout

This website calls the separate Casita public API. Do not copy or modify the Casita workspace (`~/websites/casitas`). No payment processing or secrets belong in this frontend.

## Public configuration

- `VITE_CASITA_BASE_URL`: HTTPS Casita API host. Defaults to the intended production hostname `https://bookings.sg-labs.xyz`; this does not imply it is deployed.
- `VITE_CASITA_PROPERTY_ID`: Casita property UUID. Required to load rooms and enable online bookings.

Configure these values in the website hosting environment before building. They are public configuration, not secrets. A local development API URL can be configured for local testing, but real guests require a public HTTPS deployment.

## Backend deployment requirements

The Casita agent must deploy the backend, attach DNS/HTTPS, apply its payments migration, allow the website origin in CORS, configure provider webhook/return URLs and the public website return origin. Return paths on this website are `/reserva/:ref`; the website host must serve its SPA for these deep links.

## Behavior

`/reservar` loads authoritative Casita room UUIDs, pricing and unavailable ranges. The website does not guess mappings from its static marketing room IDs. Availability uses half-open ranges `[start, end)` and is refreshed before hold creation; the backend's 409 is authoritative.

The form creates a hold with the selected provider, saves reference/email/dates in session storage, and opens hosted checkout from `/reserva/:ref`. Checkout failures reuse the existing hold instead of creating another. Saved data is limited to the browser tab session; returning without it prompts for the booking email. The documented status response does not include dates/currency/hold expiry; saved values are used when available, optional returned fields are accepted, and payment expiry is used as a fallback.

Status polling verifies backend status, never the `pago` query parameter. Cancelled and expired bookings cannot reopen checkout; guests start a new booking. Pending holds can retry checkout. Transient status failures stop automatic polling after three failures and provide manual retry.

Bookings with check-in 14 calendar days or more from the guest's local date require a 40% deposit and only offer online checkout. Nearer bookings also offer payment-on-arrival inquiries through n8n; these do not confirm a reservation. The inquiry includes `payment_preference: "on_arrival"` and describes that preference in its message. Viewing appointments link to the existing TidyCal calendar and do not reserve accommodation.

Deposit percentages and amounts remain authoritative in Casita. Configure the property's deposit percentage to 40 before accepting advance bookings. The website blocks advance checkout if Casita advertises a different percentage or returns a hold whose deposit is not 40% of its total. The separate backend must enforce this policy too; frontend controls cannot enforce it against direct API calls. No undocumented deposit or payment-on-arrival fields are sent to the Casita API.

Live testing requires a deployed API and property ID. Normal tests must mock Casita and must not create real bookings or payments.

## Full payment requirement

Guests should optionally be able to pay the full stay amount now. This is not enabled yet: the available frontend contract only uses checkout `purpose: "deposit"`. Obtain the authoritative Casita full-payment checkout contract before enabling or labeling a full-payment option. Do not guess a checkout purpose or imply that a deposit checkout charges the full total.
