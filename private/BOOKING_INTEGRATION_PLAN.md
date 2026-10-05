# Booking.com iCal sync backend: technical design

Status: draft v1 · 2026-10-04 · Owner: site owner/dev
Scope: a small self-hosted backend that sits next to the existing React + Vite site. It does two-way **availability** sync with Booking.com through per-room iCal feeds, and runs direct bookings (holds, optional Stripe payment, confirmation). It needs no paid tools beyond Stripe's per-transaction fees, and Stripe is optional.

## 0. Constraints this design is built around (verified)

| Fact | Source |
|---|---|
| Booking.com calendar sync uses iCal links to import and export **booked or closed dates**. It is "not in real time". | [B1] |
| Booking.com **imports connected calendars every two hours**. An **Import now** button forces an earlier import. | [B1] |
| Eligibility: property Open/Bookable; user has Rates & Availability permission; **≤ 20 room types**; **max one unit per room type**; **no Connectivity provider**. "Calendar sync is not enabled for all properties." | [B1] |
| Booking.com's real-time Connectivity API is only for certified partners. New partner onboarding is paused, and individual properties can't connect directly. | [B2] |

- [B1] https://partner.booking.com/en-gb/help/rates-availability/extranet-calendar/how-synchronise-your-calendars-across-channels
- [B2] https://connect.booking.com/

What this means for the design:
1. Our feed reaches Booking.com **slowly** (up to about 2 h).
2. We can read Booking.com's export feed **as often as we like**: every 5 min on a schedule, and live at hold time.
3. iCal carries **dates only**: no prices, no guest data.
4. Each physical room must be its own one-unit room type on Booking.com.

---

## 1. Architecture

```mermaid
flowchart LR
  subgraph Browser
    R[React + Vite site<br/>react-day-picker]
  end
  subgraph Coolify
    API[booking-api<br/>Node 24 + TS + Hono]
    SCH[[in-process scheduler<br/>croner: import 5 min, expire holds 1 min]]
    DB[(PostgreSQL 18<br/>exclusion constraint)]
    API --- SCH
    API <--> DB
  end
  BDC[(Booking.com<br/>extranet calendar)]
  STR[Stripe Checkout<br/>optional]
  SMTP[SMTP mailbox<br/>owner + guest emails]

  R -- "GET /api/availability<br/>POST /api/holds, /api/checkout" --> API
  R -- redirect --> STR
  STR -- "webhook checkout.session.*" --> API
  API -- "GET Booking.com export .ics<br/>(every 5 min + live at hold)" --> BDC
  BDC -- "GET /ical/:roomId/:token.ics<br/>(Booking.com polls ~every 2 h)" --> API
  API --> SMTP
```

**Stack choices**

| Concern | Choice | Why |
|---|---|---|
| Runtime | **Node 24 LTS + TypeScript** | Same language as the React site; types can be shared. |
| HTTP | **Hono** (`@hono/node-server`) | Tiny, Web-standard `Request/Response`, first-class TS, built-in `cors`, `secure-headers`, `basic-auth`, JSX for the admin page. Fastify would also work; Hono is simpler here. |
| DB | **PostgreSQL** (Coolify one-click, `postgres:18-alpine` default) | We need an **exclusion constraint** (`daterange &&` + `btree_gist`) so double booking is impossible at the DB level. SQLite can't express this. Coolify has built-in scheduled pg_dump backups to S3 ([Coolify backups](https://coolify.io/docs/databases/backups)). |
| DB access | `postgres` (porsager) + plain `.sql` migrations run at boot | Few layers. The exclusion constraint is raw SQL anyway. |
| Validation | `zod` + `@hono/zod-validator` | |
| iCal parse | **`ical.js`** (Mozilla/kewisch, v2.x) | `ICAL.Time` exposes `isDate` and `year/month/day` directly, so all-day dates avoid JS `Date` timezone pitfalls. |
| iCal export | Hand-written (~40 lines) | Full control over the exact VEVENT shape; nothing to break. |
| Scheduler | **In-process `croner`** + Postgres advisory lock | One deployable; runs are logged in `sync_runs`. A Coolify Scheduled Task is the documented alternative (§9). |
| Payments | Stripe Checkout (optional; `PAYMENT_MODE=none` = pay on arrival) | Hosted page, so no PCI scope for us. |
| Email | `nodemailer` over the owner's existing SMTP mailbox | Free. Mailpit (Coolify one-click) for dev. |
| Rate limit | `hono-rate-limiter` (memory store; single instance) | |

**Date convention everywhere:** stays are **half-open `[check_in, check_out)`** of calendar dates in `PROPERTY_TZ`. A stay covers the *nights* from `check_in` to `check_out − 1`, so check-out day = next guest's check-in day. Postgres `daterange` is canonical `[)`, and iCal all-day `DTEND` is exclusive, so all three line up.

---

## 2. Data model

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;   -- '=' on room_id inside a GiST exclusion constraint

CREATE TABLE rooms (
  id                    smallserial PRIMARY KEY,
  slug                  text UNIQUE NOT NULL,
  name                  text NOT NULL,
  max_guests            smallint NOT NULL,
  nightly_price_cents   integer NOT NULL,
  currency              char(3) NOT NULL DEFAULT 'USD',
  booking_com_ical_url  text,                 -- SECRET: Booking.com export URL we import from
  export_token_hash     bytea NOT NULL,       -- sha256(token) of OUR export URL; token shown once
  import_etag           text,
  last_import_ok_at     timestamptz,
  import_fail_streak    integer NOT NULL DEFAULT 0,
  active                boolean NOT NULL DEFAULT true
);

CREATE TYPE booking_source AS ENUM ('direct', 'booking_com', 'admin_block');
CREATE TYPE booking_status AS ENUM ('hold', 'confirmed', 'cancelled', 'expired');

CREATE TABLE bookings (               -- direct bookings, holds, manual admin blocks
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_ref         text UNIQUE NOT NULL,          -- short code for guest emails, e.g. "K7Q2MX"
  room_id            smallint NOT NULL REFERENCES rooms(id),
  stay               daterange NOT NULL,            -- [check_in, check_out)
  blocked            daterange NOT NULL,            -- stay with check_out + BUFFER_DAYS (= stay when 0)
  source             booking_source NOT NULL,
  status             booking_status NOT NULL,
  hold_expires_at    timestamptz,
  guests             smallint,
  guest_name text, guest_email text, guest_phone text, note text,
  total_cents        integer, currency char(3),
  stripe_session_id  text UNIQUE, stripe_payment_intent text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT isempty(stay) AND NOT lower_inf(stay) AND NOT upper_inf(stay)),
  CHECK (blocked @> stay),
  CHECK (status <> 'hold' OR hold_expires_at IS NOT NULL),
  CONSTRAINT no_double_booking EXCLUDE USING gist (room_id WITH =, blocked WITH &&)
    WHERE (status IN ('hold', 'confirmed'))
);

CREATE TABLE external_blocks (        -- VEVENTs imported from Booking.com's export feed
  id             bigserial PRIMARY KEY,
  room_id        smallint NOT NULL REFERENCES rooms(id),
  source         text NOT NULL DEFAULT 'booking_com',
  uid            text NOT NULL,                     -- VEVENT UID (or hash fallback, see §4)
  stay           daterange NOT NULL,
  summary        text,
  first_seen_at  timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL,
  missing_runs   smallint NOT NULL DEFAULT 0,       -- consecutive successful imports without it
  removed_at     timestamptz,                       -- soft delete = cancelled on Booking.com
  UNIQUE (room_id, source, uid)
);
CREATE INDEX ON external_blocks USING gist (room_id, stay) WHERE removed_at IS NULL;

CREATE TABLE conflicts (
  id                 bigserial PRIMARY KEY,
  room_id            smallint NOT NULL REFERENCES rooms(id),
  booking_id         uuid NOT NULL REFERENCES bookings(id),
  external_block_id  bigint NOT NULL REFERENCES external_blocks(id),
  overlap            daterange NOT NULL,
  detected_at        timestamptz NOT NULL DEFAULT now(),
  notified_at        timestamptz, resolved_at timestamptz, resolution_note text,
  UNIQUE (booking_id, external_block_id)
);

CREATE TABLE sync_runs (
  id bigserial PRIMARY KEY,
  room_id smallint NOT NULL REFERENCES rooms(id),
  trigger text NOT NULL CHECK (trigger IN ('schedule', 'hold', 'admin')),
  started_at timestamptz NOT NULL, finished_at timestamptz,
  ok boolean, http_status integer, events_total integer,
  added integer, updated integer, removed integer, conflicts integer,
  error text, duration_ms integer
);

CREATE TABLE stripe_events (id text PRIMARY KEY, received_at timestamptz NOT NULL DEFAULT now());  -- webhook idempotency
```

Design notes
- **Holds are `bookings` rows with `status='hold'`.** That way one exclusion constraint covers holds and confirmed stays together. A hold can't overlap a confirmed stay or another hold, even under concurrency. Expiry can't live in the constraint, because `now()` isn't allowed in its `WHERE`. So every hold insert first flips that room's stale holds to `expired`, in the same transaction (§5). A 1-minute job also sweeps them.
- **`source='booking_com'`** in `bookings` is only for reservations the admin types in by hand to add guest details. They are **never exported** (echo loop). The real sync data lives in `external_blocks`.
- **`admin_block`** rows (maintenance, owner use) are `status='confirmed'`. They are protected by the constraint and are exported.
- Imported blocks are deliberately **not** under the constraint. They record what Booking.com says. An overlap with a direct booking is a *conflict to alert on*, not something to reject.
- `blocked` stores the stay plus `BUFFER_DAYS`, computed at write time. Default 0 means same-day turnover.
- Optional later: `rate_overrides(room_id, period daterange, nightly_price_cents)` for seasonal prices. The server always computes the total and never trusts the client.

---

## 3. Export feed (Booking.com imports this)

`GET /ical/:roomId/:token.ics`, public, no CORS.
- Compare `sha256(token)` with `rooms.export_token_hash` using `timingSafeEqual`. On mismatch or unknown room, return **404** (not 401), so the endpoint doesn't confirm that a room exists.
- **Includes:** `bookings` for the room with `status='confirmed'` (sources `direct`, `admin_block`), plus `status='hold'` when `EXPORT_HOLDS=true` (default true), with `upper(blocked) >= today-7` and `lower(blocked) <= today+EXPORT_HORIZON_DAYS` (730).
- **Excludes:** all `external_blocks` and `source='booking_com'` rows. Never send Booking.com its own dates back. If another OTA is added later, a channel's feed may include *other* channels' blocks, never its own.
- **Event shape:**
  - All-day `DTSTART;VALUE=DATE`, with exclusive `DTEND;VALUE=DATE` = `upper(blocked)`.
  - **Stable `UID`** = `<booking uuid>@<PUBLIC_HOST>`, so a hold that becomes confirmed keeps the same UID.
  - `SUMMARY:Booked`. **No guest PII** anywhere.
  - `DTSTAMP` = booking `updated_at`, not `now()`, so the body (and ETag) stays stable.
  - CRLF line endings; lines folded at 75 octets.
- **Headers:**
  - `Content-Type: text/calendar; charset=utf-8`
  - `Cache-Control: no-cache` (any proxy must revalidate, so it can never serve stale availability)
  - `ETag: "<sha1(body)>"`, answering `If-None-Match` with 304
  - `X-Robots-Tag: noindex`
  - Make sure no CDN or proxy caches `/ical/*`.

```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Guesthouse//booking-ical 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:7f3c2a9e-3b1d-4c55-9d0e-2a6f1b8e4c11@api.example.com
DTSTAMP:20261004T221500Z
DTSTART;VALUE=DATE:20261110
DTEND;VALUE=DATE:20261113
SUMMARY:Booked
END:VEVENT
END:VCALENDAR
```
(Nights 10, 11, 12 Nov are booked; 13 Nov is free for a check-in.)

**The holds trade-off:** exporting holds narrows the window in which Booking.com sells dates during a checkout. But an abandoned hold can stay closed on Booking.com, and possibly echo back to us, until Booking.com's next import (≤ 2 h). If ghost blocks become annoying, set `EXPORT_HOLDS=false`.

---

## 4. Import (we read Booking.com's export)

**Schedule:** `IMPORT_CRON="*/5 * * * *"`. Rooms run sequentially with a small random jitter. The run is wrapped in `pg_try_advisory_lock(42, 0)`, so overlapping runs or replicas skip instead of piling up. The same `importRoom()` is used by the schedule, by the live check at hold time (§5), and by admin "sync now".

**`importRoom(room)`**
1. **Fetch:** `fetch(url, { signal: AbortSignal.timeout(IMPORT_TIMEOUT_MS=15000), redirect: 'follow' })` with a `User-Agent`, and `If-None-Match` from `import_etag`. Cap the body at 5 MB. A 304 counts as success with no changes.
2. **Validate:** HTTP 200. The body contains both `BEGIN:VCALENDAR` and `END:VCALENDAR` (catches HTML error pages and truncation). `ICAL.parse` succeeds.
3. **Normalise each VEVENT** (`new ICAL.Component(ICAL.parse(text)).getAllSubcomponents('vevent')`, then `new ICAL.Event(v)`):
   - Skip `STATUS:CANCELLED`.
   - `startDate.isDate`: use `year/month/day` directly (no `Date` objects). Otherwise it's a DATE-TIME: convert the instant to a calendar date in `PROPERTY_TZ` (with `TZID`, `toJSDate()` and then `Intl.DateTimeFormat(PROPERTY_TZ)`; floating times are taken as property-local).
   - End: `DTEND` (exclusive). If missing, use `DURATION`. Otherwise start + 1 day. If end ≤ start, set end = start + 1 and log a warning.
   - Ignore events that end before `today-1` or start after the horizon. `RRULE` isn't expected from Booking.com: log a warning and skip.
   - UID missing: fall back to `sha1(start|end|summary)`.
   - Duplicate UIDs in one feed: merge them (min start, max end).
4. **Apply** in **one transaction** holding the per-room lock `pg_advisory_xact_lock(1, room_id)`, the same lock the hold endpoint takes, so imports and holds serialize:
   - Upsert by `(room_id, source, uid)`: set `stay`, `summary`, `last_seen_at=run_start`, `missing_runs=0`, `removed_at=NULL`.
   - Active blocks not in the feed get `missing_runs += 1`. Set `removed_at=now()` when `missing_runs >= IMPORT_REMOVE_AFTER_MISSES` (default 2). This is a **two-strike delete**: a glitchy, half-empty feed can't instantly reopen dates. Releasing dates 5 to 10 min late is harmless.
   - **Conflict detection** (§6), then insert a `sync_runs` row, then `last_import_ok_at=now()`, `import_fail_streak=0`, and store the ETag.
5. **On any error:** roll back. The **last good state stays untouched**. Increment `import_fail_streak` and write `sync_runs(ok=false, error)`, with the URL redacted because it contains Booking.com's secret token. When the streak reaches `IMPORT_ALERT_AFTER_FAILURES` (default 3, about 15 min), email the owner **once**. Email again on recovery.

**Echo handling:** Booking.com's export may include dates it closed because of *our* feed. The help page says export covers "booked or closed dates" [B1]. A block that is fully covered by our own active bookings for that room (`range_agg(blocked) @> stay`, multirange, PG14+) is an **echo**. It is stored, but it never raises a conflict. In Phase 2 staging, check whether Booking.com keeps our UID or `SUMMARY` in its export. If it does, match on that instead.

---

## 5. Booking API for the React site

All `/api/*` routes:
- JSON, validated by zod.
- CORS limited to `CORS_ORIGINS` (the site's origin or origins).
- `secure-headers` on.
- Rate limited per client IP (`TRUST_PROXY=true`, using Coolify/Traefik's `X-Forwarded-For`).
- Optional free Cloudflare Turnstile token on `POST /api/holds`.

Public responses **never** include `booking_com_ical_url`, export tokens, other guests' data, or whether a block came from Booking.com.

| Endpoint | Request | Response |
|---|---|---|
| `GET /api/rooms` | n/a | `[{ id, slug, name, maxGuests, nightlyPriceCents, currency }]` |
| `GET /api/availability?from=2026-11-01&to=2027-01-31[&roomId=1]` (max 400 days; 60 req/min/IP) | n/a | `{ from, to, minCheckIn: "2026-10-07", minNights, maxNights, rooms: [{ roomId, unavailable: [{ start: "2026-11-10", end: "2026-11-13" }] }] }` (merged half-open night ranges from holds + confirmed + admin blocks + external blocks, external blocks extended by `BUFFER_DAYS`). `Cache-Control: no-store`. |
| `POST /api/holds` (5 per 10 min/IP) | `{ roomId, checkIn, checkOut, guests, guest: { name, email, phone? }, turnstileToken? }` | `201 { holdId, publicRef, expiresAt, nights, totalCents, currency }` · `409 { error: "unavailable" }` · `422 { error: "lead_time" \| "min_nights" \| "max_nights" \| "guests" }` · `503 { error: "availability_unverified" }` |
| `POST /api/checkout` | `{ holdId }` | `{ checkoutUrl }`: creates a Stripe Checkout Session (`mode: payment`, server-computed amount, `client_reference_id=booking.id`, `expires_at = now + 30 min`, Stripe's minimum ([Stripe API](https://docs.stripe.com/api/checkout/sessions/create))) and **extends the hold to session expiry + 5 min**. With `PAYMENT_MODE=none`: `POST /api/holds/:holdId/confirm` confirms as pay-on-arrival. |
| `POST /api/stripe/webhook` | raw body, `Stripe-Signature` | Verify the signature (`constructEventAsync`), dedupe via `stripe_events`. `checkout.session.completed` (with `payment_status=paid`) or `checkout.session.async_payment_succeeded` → **confirm**. `checkout.session.expired` → expire the hold. |
| `GET /api/bookings/:publicRef?email=` | n/a | `{ publicRef, status, checkIn, checkOut, roomName }` for the success page. |

**Hold flow, server side:**
1. Validate the dates (`checkIn < checkOut`), `MIN/MAX_NIGHTS`, guests ≤ `max_guests`, and **lead time**: check-in at `CHECKIN_TIME` in `PROPERTY_TZ` must be ≥ now + `MIN_LEAD_HOURS`.
2. **Live re-fetch** of that room's Booking.com feed via `importRoom(room, {trigger:'hold', timeoutMs: 5000})`. If it fails, continue only when `last_import_ok_at` is newer than `LIVE_CHECK_FALLBACK_MAX_AGE_MIN` (15). Otherwise return 503.
3. Run the transaction below. The DB constraint is the final guard; SQLSTATE `23P01` becomes 409.

```ts
app.post('/api/holds', holdLimiter, zValidator('json', HoldReq), async (c) => {
  const req = c.req.valid('json');
  const room = await getActiveRoom(req.roomId);
  if (!room) return c.json({ error: 'room_not_found' }, 404);
  const ruleError = checkStayRules(req, room, settings);          // lead time, nights, guests
  if (ruleError) return c.json({ error: ruleError }, 422);

  const live = await importRoom(room, { trigger: 'hold', timeoutMs: env.LIVE_CHECK_TIMEOUT_MS });
  if (!live.ok && !isFresh(room.last_import_ok_at, env.LIVE_CHECK_FALLBACK_MAX_AGE_MIN))
    return c.json({ error: 'availability_unverified' }, 503);

  const blockedEnd = addDays(req.checkOut, settings.bufferDays);
  try {
    const hold = await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(1, ${room.id})`;
      await tx`UPDATE bookings SET status = 'expired', updated_at = now()
               WHERE room_id = ${room.id} AND status = 'hold' AND hold_expires_at < now()`;
      const ext = await tx`SELECT 1 FROM external_blocks
               WHERE room_id = ${room.id} AND removed_at IS NULL
                 AND daterange(lower(stay), upper(stay) + ${settings.bufferDays}::int)
                     && daterange(${req.checkIn}::date, ${blockedEnd}::date)`;
      if (ext.length) throw new Unavailable();
      const [row] = await tx`INSERT INTO bookings
          (public_ref, room_id, stay, blocked, source, status, hold_expires_at,
           guests, guest_name, guest_email, guest_phone, total_cents, currency)
        VALUES (${newRef()}, ${room.id}, daterange(${req.checkIn}::date, ${req.checkOut}::date),
           daterange(${req.checkIn}::date, ${blockedEnd}::date), 'direct', 'hold',
           now() + make_interval(mins => ${env.HOLD_MINUTES}),
           ${req.guests}, ${req.guest.name}, ${req.guest.email}, ${req.guest.phone ?? null},
           ${quote(room, req)}, ${room.currency})
        RETURNING id, public_ref, hold_expires_at, total_cents`;
      return row;
    });
    return c.json({ holdId: hold.id, publicRef: hold.public_ref, expiresAt: hold.hold_expires_at,
                    totalCents: hold.total_cents, currency: room.currency }, 201);
  } catch (e: any) {
    if (e instanceof Unavailable || e?.code === '23P01') return c.json({ error: 'unavailable' }, 409);
    throw e;
  }
});
```

**Confirm** (webhook or pay-on-arrival), in a transaction holding the same per-room lock:
1. Re-check for non-echo `external_blocks` overlapping the stay.
2. Run `UPDATE bookings SET status='confirmed', hold_expires_at=NULL WHERE id=$1 AND status IN ('hold','expired')`.
3. If an external block overlaps, or the update hits `23P01` (a late payment after expiry and the dates were taken meanwhile): **auto-refund** (`stripe.refunds.create`) and set `status='cancelled'`, then email the guest and the owner.
4. Otherwise send the confirmation emails.

**Hold expiry job (every minute):**
- `UPDATE … SET status='expired' WHERE status='hold' AND hold_expires_at < now() RETURNING stripe_session_id`.
- Call `stripe.checkout.sessions.expire()` on any still-open session, so a late payment can't start.

**Cancellation:** admin only in v1 (§7). `POST /admin/api/bookings/:id/cancel { refund: boolean }` sets `cancelled`, optionally refunds via Stripe, and emails the guest. The dates disappear from the export feed on Booking.com's next import.

---

## 6. Double-booking mitigation

| Window | Max lag | Mitigation |
|---|---|---|
| Booking.com sale → our site | ≤ 5 min scheduled; ≈ 0 at hold time (live fetch) + however long Booking.com takes to update its export (undocumented; measure in staging) | Scheduled import plus the **live re-fetch** before every hold, and a re-check at confirm. |
| Our sale → Booking.com | **≤ 2 h** (Booking.com's import interval [B1]) | **Minimum lead time** (`MIN_LEAD_HOURS`, default 48), so the risky "tonight/tomorrow" dates can't be sold directly. The owner gets a "new booking" email with a reminder to click **Import now** in the extranet's Sync calendars page [B1]. For last-minute or high-season bookings, close the dates manually in the extranet too. |
| Two direct guests at once | n/a | Postgres **exclusion constraint** plus the per-room advisory lock. |

Other layers:
- **Buffer and turnover consistency.** `BUFFER_DAYS` (default 0) is applied to our own bookings, to the exported `DTEND` (so Booking.com sees the cleaning day as closed), and to imported blocks when checking availability. Keep check-in/out times and min-stay rules matching on both sides.
- **Conflict alert.** After each import, find active, non-echo external blocks that overlap any `hold`/`confirmed` direct booking or admin block. Insert into `conflicts` (unique per pair) and **email the owner at once**: room, dates, our `public_ref`, guest contact, the Booking.com block's dates. Also show it on the admin page until it's resolved. At that point the fix is manual: relocate or cancel one guest, or contact Booking.com support [B1].
- **Staleness alarm.** `GET /healthz/sync` returns 503 if any active room's `last_import_ok_at` is older than 30 min. Point Uptime Kuma (Coolify one-click) or any free monitor at it.

---

## 7. Minimal admin

Served by the same app at `/admin` (Hono JSX, server-rendered, no separate build), behind **HTTP Basic auth** over HTTPS (`ADMIN_USER`, bcrypt `ADMIN_PASSWORD_HASH`), rate limited, same-origin only (no CORS). There's no admin token in the React bundle.

Views and endpoints (`/admin/api/*` JSON, used by the page):
- **Bookings:** list by date or room, with status, source and guest. Cancel (± refund). Add a phone/Booking.com reservation manually (`source='booking_com'`, not exported).
- **Calendar strip** per room (60 days): direct / hold / admin block / Booking.com block / conflict.
- **Conflicts:** open list; mark resolved with a note.
- **Sync status:** per room, last OK time, fail streak, last 20 `sync_runs`, a "Sync now" button.
- **Manual blocks:** `POST /admin/api/blocks { roomId, start, end, note }` creates `source='admin_block', status='confirmed'` (constraint-checked, **exported**); `DELETE /admin/api/blocks/:id`.
- **Rooms:** set or replace `booking_com_ical_url`. **Rotate export token** returns the new URL **once**; you then update it in the extranet.

---

## 8. React integration

- `.env`: `VITE_API_URL=https://api.example.com`. Public; it's just the base URL.
- `npm i react-day-picker date-fns` (react-day-picker v9: range mode, `disabled` matchers, `excludeDisabled` ([docs](https://daypicker.dev/v9/selections/range-mode))).
- **Parse API dates with `date-fns/parseISO`**, never `new Date('2026-11-10')`. The latter is read as UTC midnight and shows the previous day in UTC-5.

```ts
// src/lib/bookingApi.ts
const API = import.meta.env.VITE_API_URL as string;
export type Range = { start: string; end: string };          // half-open nights
async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json' } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.error ?? r.statusText), { status: r.status });
  return body as T;
}
export const getAvailability = (from: string, to: string, roomId: number) =>
  j<{ minCheckIn: string; rooms: { roomId: number; unavailable: Range[] }[] }>(
    `/api/availability?from=${from}&to=${to}&roomId=${roomId}`);
export const createHold = (b: unknown) => j<{ holdId: string; expiresAt: string; totalCents: number }>(
  '/api/holds', { method: 'POST', body: JSON.stringify(b) });
export const startCheckout = (holdId: string) =>
  j<{ checkoutUrl: string }>('/api/checkout', { method: 'POST', body: JSON.stringify({ holdId }) });
```

```tsx
// src/components/RoomCalendar.tsx (sketch)
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker';
import 'react-day-picker/style.css';
import { addDays, parseISO } from 'date-fns';

export function RoomCalendar({ unavailable, minCheckIn, value, onChange }: {
  unavailable: { start: string; end: string }[]; minCheckIn: string;
  value?: DateRange; onChange: (r?: DateRange) => void;
}) {
  const nights = unavailable.map(r => ({ from: parseISO(r.start), to: addDays(parseISO(r.end), -1) }));
  // Once a check-in is picked, allow check-out up to and INCLUDING the first booked night
  // (a booked night's date is a valid check-out day under [check_in, check_out)).
  const nextBooked = value?.from && !value.to
    ? nights.map(n => n.from).filter(d => d > value.from!).sort((a, b) => +a - +b)[0] : undefined;
  const disabled: Matcher[] = value?.from && !value.to
    ? [{ before: value.from }, ...(nextBooked ? [{ after: nextBooked }] : [])]
    : [{ before: parseISO(minCheckIn) }, ...nights];
  return <DayPicker mode="range" min={1} selected={value} onSelect={onChange}
                    disabled={disabled} excludeDisabled numberOfMonths={2} />;
}
```

Flow:
1. Pick dates and guests.
2. `createHold`: on 409, refetch availability and show "just booked, pick other dates".
3. `startCheckout` → `window.location = checkoutUrl`.
4. The success page polls `GET /api/bookings/:publicRef` until `confirmed`.

Refetch availability when the page regains focus.

---

## 9. Coolify deployment

**Recommended production layout:**
- A **Coolify one-click PostgreSQL** (standalone resource, so built-in scheduled backups work).
- The app as a **Dockerfile application** from Git, with its domain `api.example.com`. Coolify/Traefik issues Let's Encrypt HTTPS automatically.
- They talk over Coolify's internal network (`DATABASE_URL` = the DB's internal URL).

The compose file below is for local dev, or for a single Coolify "Docker Compose" resource if preferred.

```dockerfile
# Dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
ENV NODE_ENV=production TZ=UTC PORT=3000
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY migrations ./migrations
COPY package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "dist/server.js"]     # runs migrations, then starts HTTP + scheduler
```

```yaml
# docker-compose.yml
services:
  api:
    build: .
    restart: unless-stopped
    environment:
      - SERVICE_FQDN_API_3000                   # Coolify magic var: domain routed to :3000
      - DATABASE_URL=postgres://booking:${SERVICE_PASSWORD_POSTGRES}@postgres:5432/booking
      - PUBLIC_BASE_URL=${PUBLIC_BASE_URL:?}
      - CORS_ORIGINS=${CORS_ORIGINS:?}
      - PROPERTY_TZ=${PROPERTY_TZ:?}
      - ADMIN_USER=${ADMIN_USER:?}
      - ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH:?}
      # ...remaining vars from the table below
    depends_on:
      postgres: { condition: service_healthy }
  postgres:
    image: postgres:18-alpine                   # contrib (btree_gist) is included
    restart: unless-stopped
    environment:
      POSTGRES_USER: booking
      POSTGRES_PASSWORD: ${SERVICE_PASSWORD_POSTGRES}
      POSTGRES_DB: booking
    volumes:
      - pgdata:/var/lib/postgresql              # PG 18+ mount point (PG ≤17: /var/lib/postgresql/data)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U booking -d booking"]
      interval: 10s
      timeout: 5s
      retries: 5
volumes:
  pgdata:
```
Magic variables reference: [Coolify Docker Compose](https://coolify.io/docs/applications/builds/docker-compose).

**Environment variables**

| Var | Example / default | Notes |
|---|---|---|
| `DATABASE_URL` | internal Postgres URL | secret |
| `PUBLIC_BASE_URL` | `https://api.example.com` | used to build export URLs and UIDs |
| `CORS_ORIGINS` | `https://example.com,https://www.example.com` | |
| `PROPERTY_TZ` / `CHECKIN_TIME` | `America/Lima` / `15:00` | set to the property's real zone |
| `MIN_LEAD_HOURS` / `MIN_NIGHTS` / `MAX_NIGHTS` / `BUFFER_DAYS` | `48` / `1` / `30` / `0` | |
| `HOLD_MINUTES` | `15` | extended to session expiry + 5 when Stripe Checkout starts |
| `EXPORT_HOLDS` / `EXPORT_HORIZON_DAYS` | `true` / `730` | |
| `IMPORT_MODE` / `IMPORT_CRON` | `inprocess` / `*/5 * * * *` | `external` disables the in-process scheduler |
| `IMPORT_TIMEOUT_MS` / `LIVE_CHECK_TIMEOUT_MS` / `LIVE_CHECK_FALLBACK_MAX_AGE_MIN` | `15000` / `5000` / `15` | |
| `IMPORT_ALERT_AFTER_FAILURES` / `IMPORT_REMOVE_AFTER_MISSES` | `3` / `2` | |
| `PAYMENT_MODE` | `stripe` \| `none` | |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `CHECKOUT_SUCCESS_URL` / `CHECKOUT_CANCEL_URL` | n/a | secrets; success URL like `https://example.com/booking/{publicRef}` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` / `OWNER_EMAIL` | n/a | secrets |
| `ADMIN_USER` / `ADMIN_PASSWORD_HASH` | n/a | bcrypt hash |
| `TRUST_PROXY` / `TURNSTILE_SECRET` | `true` / optional | |

Room `booking_com_ical_url`s live in the DB, set via admin, not in env.

**Health:**
- `GET /healthz` checks the process and `SELECT 1` (Docker/Coolify healthcheck).
- `GET /healthz/sync` checks import freshness (external monitor).

**Backups:**
- In the Coolify DB resource, go to **Backups → Scheduled Backups**, e.g. `0 3 * * *`, and upload to S3-compatible storage (any free-tier bucket, or a second server running MinIO/Garage). Do a test restore once ([Coolify backups](https://coolify.io/docs/databases/backups)).
- If Postgres runs inside the compose stack instead, add a Coolify Scheduled Task on the `postgres` container running `pg_dump -U booking -Fc booking > /backups/booking-$(date +%F).dump` (needs a mounted `/backups` volume), and copy it off-box.

**Scheduling: in-process (default) or a Coolify Scheduled Task:**
- *In-process* (`IMPORT_MODE=inprocess`): `croner` runs `importAll` every 5 min and `expireHolds` every minute, guarded by advisory locks. No extra setup; everything is logged in `sync_runs`.
- *Coolify Scheduled Task* (`IMPORT_MODE=external`): in the app's **Configuration → Scheduled Tasks**, add `node dist/jobs/import.js` with `*/5 * * * *` and `node dist/jobs/expire-holds.js` with `every_minute`. Coolify runs the command inside the running container via `sh`, using the server's timezone. Default timeout is 300 s ([Coolify scheduled tasks](https://coolify.io/docs/applications/operations/scheduled-tasks)). Use this if you prefer Coolify's execution history, or if you run more than one app replica.

**Stripe:** add the webhook endpoint `https://api.example.com/api/stripe/webhook` in the Dashboard with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.

---

## 10. Booking.com setup (per room) [B1]

0. **Eligibility check** (Rates & Availability in the extranet):
   - ≤ 20 room types.
   - **Each room type has exactly 1 unit.** If you sell e.g. "Double room × 3", split it into "Double 1/2/3", each with 1 unit.
   - Property Open/Bookable; your user has Rates & Availability permission; **no Connectivity provider** connected.
   - Booking.com notes sync "is not enabled for all properties".
1. Sign in to the extranet → **Rates & Availability** → **Sync calendars**.
2. **Import our feed into Booking.com:**
   - Find the room/unit and click **Add calendar connection**.
   - Paste `https://api.example.com/ical/<roomId>/<token>.ics` (from admin → Rooms).
   - Name it (e.g. "Website") → **Next step**.
3. **Export Booking.com's calendar to us:**
   - Continue (or **Add calendar connection** → **Skip to export**) and name the connection.
   - **Copy link**. Booking.com's link contains `/ical/`.
   - Paste it into admin → Rooms → "Booking.com iCal URL". Then **Done**.
4. Repeat for each room.
5. **Check the result:**
   - The connection status should become **Okay**. Other statuses: *Activating*, *Import only*, *Export only*, *Service error* (check both links).
   - In our admin, the first `sync_runs` for that room shows `ok`.
6. **Operating habit:** after a direct booking for near dates, click **Import now** on the Sync calendars page. Otherwise Booking.com picks it up within ~2 h.

---

## 11. Testing plan and build order

**Unit (vitest)**
- Export: golden-file test. CRLF, folding, `VALUE=DATE`, exclusive `DTEND`, stable UID/DTSTAMP/ETag, no PII. Excludes external blocks and `source='booking_com'`. Honours `EXPORT_HOLDS` and `BUFFER_DAYS`.
- Parse fixtures:
  - all-day events; DATE-TIME with `TZID`; floating times; missing `DTEND`; `DURATION`; `STATUS:CANCELLED`
  - duplicate UIDs; missing UID; LF-only and folded lines
  - empty VCALENDAR; HTML error page; truncated body
  - end ≤ start; a far-future event
- Date rules: half-open math, lead time across midnight and DST (if `PROPERTY_TZ` has DST), availability merging, the checkout-day picker logic.

**DB (real Postgres in Docker / testcontainers)**
- Overlapping `confirmed`+`confirmed` and `hold`+`confirmed` rejected with `23P01`.
- Adjacent `[1,3)` + `[3,5)` accepted. `cancelled`/`expired` rows don't block.
- Buffer: `BUFFER_DAYS=1` rejects `[3,5)` after `[1,3)`.
- **Concurrency:** 20 parallel `POST /api/holds` for the same dates → exactly 1 × 201, 19 × 409.

**Integration (fake Booking.com feed)**
- A tiny HTTP server serves a mutable `.ics` fixture with failure modes (500, timeout, HTML, slow).
  - New block → availability excludes it within one run.
  - Removal → released after 2 successful runs.
  - Outage → state kept; alert after 3 failures; recovery mail.
  - Block appears just before a hold → live check returns 409.
  - Block overlapping a direct booking → `conflicts` row + email (captured by **Mailpit**).
  - Echo block covered by our booking → no alert.
- Stripe test mode: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, `stripe trigger checkout.session.completed`.
  - Signature failure → 400; duplicate event → no-op.
  - Payment after hold expiry with the dates taken → refund + emails.
- **Staging against a real Booking.com room** (unpublished/test dates):
  - Booking.com accepts our feed (status **Okay**).
  - Measure the real import lag.
  - Check whether Booking.com's export echoes our events, and their UID/SUMMARY (tunes echo detection).

**Phased build (one TS developer; rough)**

| Phase | Work | Est. |
|---|---|---|
| 0 | Repo, Hono skeleton, migrations, Dockerfile, Coolify app + Postgres, `/healthz`, HTTPS | 0.5 d |
| 1 | Schema, room seeding, **export feed** + tests; connect to Booking.com import early (validates acceptance) | 1 d |
| 2 | **Importer** (ical.js), scheduler, `sync_runs`, two-strike delete, failure alerts, conflict + echo detection, fake-feed tests | 1.5 d |
| 3 | `/api/availability`, `/api/holds` (live check, lock, constraint, lead time), expiry job, CORS/rate limit/validation | 1.5 d |
| 4 | Stripe Checkout + webhook + refunds + emails (or pay-on-arrival only: 0.5 d) | 1 d |
| 5 | React: API client, `RoomCalendar`, booking form, success page | 1 d |
| 6 | Admin page (bookings, conflicts, sync status, manual blocks, token rotation) | 1 d |
| 7 | Real Booking.com staging test, backups + restore drill, monitor, go-live checklist | 0.5–1 d |
| | **Total** | **≈ 8–9 dev days** |

---

## 12. Limitations and when to upgrade

- **Lag:** Booking.com picks up our bookings only every ~2 h [B1]. The lead time, "Import now" and manual closing reduce the risk; they can't remove it. A Booking.com sale is seen within ~5 min, or at hold time, subject to Booking.com's own export latency.
- **Dates only:** iCal sends no prices, rate plans, restrictions or guest details. Booking.com reservations appear as anonymous blocks. Prices and min-stays must be maintained separately in the extranet and in our DB.
- **Eligibility:** one unit per room type, ≤ 20 room types, no connectivity provider, and Booking.com may not enable sync for every property [B1].
- **Ghost blocks:** cancellations and abandoned holds take up to ~2 h to reopen on Booking.com (and may echo back).
- **Upgrade to a channel manager** (e.g. Beds24, from about €15.50/month + €0.55 per channel link, per beds24.com/pricing, checked 2026-10-04) if:
  - conflicts happen more than rarely, or last-minute direct sales matter;
  - you need several units per room type or more than 20 room types;
  - you want rates and restrictions pushed to Booking.com;
  - you add more OTAs and the iCal mesh gets fragile.

  The site can keep this React front end and switch the backend's availability source to the channel manager's API.
