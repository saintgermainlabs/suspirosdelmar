# Los Suspiros del Mar — Complete Website Architecture Design

**Date**: 2026-10-04  
**Status**: Approved  
**Target Application**: Los Suspiros del Mar Coastal Hotel Website (`/home/god/websites/suspiros`)

---

## 1. Executive Summary & Goals

Transform **Los Suspiros del Mar** from a single-page state-navigated website into a production-grade, complete, professional hospitality web application.

### Key Objectives
1. **Dedicated Room Detail Pages (`/rooms/:roomId`)**: Provide every room (`sea-breeze`, `double-sunset`, `family-shore`, `ocean-calm`, `upstairs-apartment`) with its own dedicated page featuring high-res imagery, specs, amenities, and an embedded reservation form pre-set to that room.
2. **Full Client-Side Routing (`react-router-dom`)**: Enable real browser URLs (`/rooms`, `/rooms/ocean-calm`, `/apartment`, `/gallery`, `/contact`) so guests can bookmark, share direct links, and navigate using browser back/forward buttons.
3. **Retina Gallery Lightbox (`Lightbox.tsx`)**: Implement a full-screen, high-res modal lightbox for all gallery and room photos with zoom quality, swipe support, keyboard arrow navigation, and captions.
4. **Comprehensive SEO & Hotel Schema**: Dynamic per-route page titles, meta descriptions, OpenGraph share cards (`og:image`, `og:title`), and `Schema.org/Hotel` JSON-LD structured data for Google rich search results.
5. **Availability Engine & Airbnb / Booking.com Sync (`calendarSync.ts`)**: Parse live iCal (`.ics`) calendar feeds from Airbnb and Booking.com listings to extract occupied date ranges and disable already-booked dates in reservation date pickers.
6. **Reusable Booking Form (`BookingForm.tsx`)**: Shared reservation component across `Contact.tsx`, `RoomDetail.tsx`, `Apartment.tsx`, and `Home.tsx` with n8n webhook submission, error handling, success states, and WhatsApp instant booking deep links.

---

## 2. Technical Architecture & File Structure

### Project File Map
```
src/
├── main.tsx                      # App entry point with React Router BrowserRouter & LanguageProvider
├── App.tsx                       # Main layout shell, Header Nav, Routes, WhatsApp float button, Footer
├── index.css                     # Global Tailwind CSS styles and font imports
├── i18n.ts                       # English (EN) and Spanish (ES) translations
├── site.ts                       # Site metadata, phone, email, WhatsApp link generator
├── data/
│   └── roomsData.ts              # Canonical room catalog with slugs, titles, photos, amenities, prices
├── utils/
│   ├── calendarSync.ts           # iCal (.ics) parser & date availability calculator
│   └── seo.ts                    # Dynamic meta tags & Schema.org JSON-LD generator
├── components/
│   ├── Nav.tsx                   # Header navigation with active link highlighting & lang switcher
│   ├── Footer.tsx                # Footer with quick links, policies, and address
│   ├── WhatsAppButton.tsx        # Floating WhatsApp button
│   ├── Lightbox.tsx              # Full-screen retina image lightbox modal
│   ├── BookingForm.tsx           # Reusable reservation form with date blocking & webhook submission
│   └── SEO.tsx                   # Route-based document title and meta tag manager
└── pages/
    ├── Home.tsx                  # Home hero, booking search bar, room previews, gallery preview, location map
    ├── Rooms.tsx                 # Rooms overview grid with direct links to room detail pages
    ├── RoomDetail.tsx            # Dedicated room detail template page (for any room or apartment)
    ├── ApartmentDetail.tsx       # Dedicated upstairs apartment detail page & photo tour
    ├── Gallery.tsx               # Photo gallery with category filtering and Lightbox integration
    ├── Experiences.tsx           # Local area guide, surf spots, restaurants, sunset walks
    ├── About.tsx                 # Family story, host profiles, values
    └── Contact.tsx               # Contact page with map, location details, FAQs, and BookingForm
```

---

## 3. System Components & Implementation Specifications

### 3.1 Routing & URL Structure (`react-router-dom`)
Replace `useState<Page>` navigation with `react-router-dom` `Routes` and `Route`:

| Route Path | Component | Purpose |
| :--- | :--- | :--- |
| `/` | `Home` | Homepage with hero, quick reservation bar, highlights, map |
| `/rooms` | `Rooms` | Overview of all 4 guest rooms + upstairs apartment card |
| `/rooms/:roomId` | `RoomDetail` | Dedicated detail page for `sea-breeze`, `double-sunset`, `family-shore`, `ocean-calm` |
| `/apartment` | `ApartmentDetail` | Dedicated upstairs apartment page with full photo tour & embedded booking form |
| `/gallery` | `Gallery` | Photo gallery with category filters & lightbox modal |
| `/experiences` | `Experiences` | Local experiences, surf spots, activities |
| `/about` | `About` | Host story, values, team |
| `/contact` | `Contact` | Contact info, Google Maps iframe, FAQs, general reservation form |

### 3.2 Canonical Room Catalog (`src/data/roomsData.ts`)
Define type-safe metadata for each room:
* `id`: `sea-breeze` | `double-sunset` | `family-shore` | `ocean-calm` | `upstairs-apartment`
* `index`: `0`..`4` (mapped to `roomOptions` in `i18n.ts`)
* `slug`: URL slug for route parameter
* `title`: English and Spanish room titles
* `price`: Base nightly rate (e.g. `S/ 80`, `S/ 180`)
* `capacity`: Guest capacity description (e.g. `1–2 guests`, `Up to 5 guests`)
* `bed`: Bed type configuration
* `images`: Primary image + gallery array for room photo tour
* `amenities`: Key features array
* `description`: Detailed room bio

### 3.3 Dedicated Room Detail Page (`RoomDetail.tsx`)
* **Dynamic Route Parameter**: Reads `:roomId` from URL (`useParams`).
* **Header & Hero**: Displays room title, tagline, price rate (`From S/ 80 / night`), capacity, bed type, and "Reserve Room" CTA.
* **Photo Carousel & Grid**: Shows room-specific photos with click-to-enlarge retina `Lightbox`.
* **Amenities Badges & Specs**: Lists all room amenities with icons and clean styling.
* **Embedded Reservation Form**: Renders `<BookingForm defaultRoomIndex={room.index} />` with the room pre-selected in the form.
* **Mobile Sticky Booking Bar**: Fixed bottom bar on mobile screens ("Reserve Room — S/ 80 / night") that smoothly scrolls to the booking form.

### 3.4 Reusable Reservation Form (`BookingForm.tsx`)
* **Props**: `defaultRoomIndex?: string`, `lockRoomSelect?: boolean`, `initialBooking?: BookingQuery`.
* **State Management**: Manages name, email, phone, check-in, check-out, guests, roomIndex, and message.
* **Date Availability Validation**: Integrates with `calendarSync.ts` to disable unavailable date ranges.
* **Webhook Submission**: Submits payload via CORS-compliant `fetch` to `import.meta.env.VITE_N8N_WEBHOOK_URL` (`http://n8n.sg-labs.xyz/webhook/submit`).
* **Success & WhatsApp Link**: Displays success state with a direct WhatsApp action button (`waLink(...)`) containing pre-formatted reservation text.

### 3.5 Retina Gallery Lightbox Modal (`Lightbox.tsx`)
* **State**: Accepts active photo index, total photos array, and `onClose` callback.
* **Image Display**: Renders high-DPI image centered against `bg-[#0d1d28]/95` backdrop.
* **Keyboard & Touch Controls**:
  * `ArrowLeft` / `ArrowRight` for prev/next photo.
  * `Escape` key or click backdrop to close.
  * Swipe gestures for mobile touch devices.
* **Metadata Overlay**: Displays photo title, category badge, and counter (`3 of 15`).

### 3.6 SEO & Hotel JSON-LD Metadata (`SEO.tsx`)
* Updates `<title>` and `<meta name="description">` on route change.
* Injects OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`).
* Appends `Schema.org/Hotel` & `Schema.org/Accommodation` JSON-LD script block:
  * Name: Los Suspiros del Mar
  * Address: Jr. Los Lirios, Mz. W, Lt. 8, Playa Arica, Lurín, Lima, Perú
  * Price Range: S/ 80 - S/ 180
  * Geo Coordinates: `-12.3036704, -76.8473174`
  * Currencies Accepted: PEN, USD

### 3.7 Availability Engine & Calendar Sync (`calendarSync.ts`)
* **iCal Feed Parsing**: Utility function `parseICS(icsText)` to parse standard `.ics` `VEVENT` entries (`DTSTART`, `DTEND`).
* **Occupied Date Range Calculation**: Maps events to an array of `{ start: Date, end: Date }` ranges per room.
* **Date Blocking Logic**: Helper `isDateRangeAvailable(checkin, checkout, occupiedRanges)` used by `BookingForm.tsx` to validate date selections before submission.

---

## 4. Verification & Testing Strategy

1. **Build & Type Check**:
   - Run `pnpm build` or `npx vite build` to verify clean TypeScript compilation and zero bundle errors.
2. **Routing & Navigation Test**:
   - Verify all page routes (`/`, `/rooms`, `/rooms/sea-breeze`, `/rooms/ocean-calm`, `/apartment`, `/gallery`, `/experiences`, `/about`, `/contact`) render cleanly and allow browser back/forward navigation.
3. **Reservation Form & Webhook Test**:
   - Verify form pre-selection when navigating from room detail pages.
   - Verify date validation and submission to n8n webhook with WhatsApp fallback link.
4. **Retina Lightbox Test**:
   - Verify photo clicks open full-screen lightbox, arrow navigation works, and closing via `Esc` or button functions smoothly.
5. **SEO & Metadata Test**:
   - Inspect `<head>` tags and JSON-LD script injection across routes.

---

## 5. Implementation Roadmap & Execution Order

1. **Dependencies**: Install `react-router-dom`.
2. **Data & Utils**: Create `src/data/roomsData.ts`, `src/utils/calendarSync.ts`, and `src/utils/seo.ts`.
3. **Components**: Build `BookingForm.tsx`, `Lightbox.tsx`, and `SEO.tsx`.
4. **Pages**:
   - Create `src/pages/RoomDetail.tsx`.
   - Update `src/pages/Rooms.tsx`, `src/pages/Apartment.tsx` (or `ApartmentDetail.tsx`), `src/pages/Gallery.tsx`, `src/pages/Home.tsx`, and `src/pages/Contact.tsx`.
5. **App Shell & Router**: Configure `BrowserRouter` in `src/main.tsx` and routes in `src/App.tsx`.
6. **Verification**: Run build and test all user flows.
