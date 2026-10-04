# Complete Website Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Los Suspiros del Mar into a complete, professional hotel website with dedicated room detail pages, React Router client-side navigation, retina photo lightbox, dynamic SEO/JSON-LD, reusable reservation form, and Airbnb/Booking.com iCal calendar availability sync.

**Architecture:** Use `react-router-dom` for route management (`/`, `/rooms`, `/rooms/:roomId`, `/apartment`, `/gallery`, `/experiences`, `/about`, `/contact`). Extract shared reservation logic into `BookingForm.tsx` and add a retina photo modal (`Lightbox.tsx`), SEO/JSON-LD helper (`SEO.tsx`), and iCal calendar date parser (`calendarSync.ts`).

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS v4, `react-router-dom` v7, Vite 8.

**Spec:** [`docs/superpowers/specs/2026-10-04-complete-website-architecture-design.md`](file:///home/god/websites/suspiros/docs/superpowers/specs/2026-10-04-complete-website-architecture-design.md)

## Global Constraints
- Use Tailwind CSS v4 utility classes.
- Export all React page components as default exports.
- All room pricing references remain PEN (S/).
- Preserve English (EN) and Spanish (ES) language context.
- Maintain existing n8n booking webhook URL fallback (`http://n8n.sg-labs.xyz/webhook/submit`).

---

### Task 1: Install Dependencies & Setup Data Catalog, SEO & Calendar Utilities

**Files:**
- Create: `src/data/roomsData.ts`
- Create: `src/utils/seo.ts`
- Create: `src/utils/calendarSync.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `RoomData` array in `roomsData.ts`, `updateSEO` in `seo.ts`, `parseICSCalendar` and `isDateOccupied` in `calendarSync.ts`.

- [ ] **Step 1: Install `react-router-dom`**

Run: `pnpm add react-router-dom` or `npm install react-router-dom`

- [ ] **Step 2: Create `src/data/roomsData.ts`**

Write `src/data/roomsData.ts` containing the room objects (slug, room index 0..4, titles, price, capacity, bed, amenities, description, images).

- [ ] **Step 3: Create `src/utils/seo.ts`**

Write `src/utils/seo.ts` to manage document title, meta tags (`description`, OpenGraph), and `Schema.org/Hotel` JSON-LD structured data.

- [ ] **Step 4: Create `src/utils/calendarSync.ts`**

Write `src/utils/calendarSync.ts` to parse iCal `.ics` text and check date availability against occupied date ranges.

- [ ] **Step 5: Verify build**

Run: `npm run build` or `pnpm build`

---

### Task 2: Build Reusable Components (`SEO.tsx`, `Lightbox.tsx`, `BookingForm.tsx`)

**Files:**
- Create: `src/components/SEO.tsx`
- Create: `src/components/Lightbox.tsx`
- Create: `src/components/BookingForm.tsx`

**Interfaces:**
- Consumes: `RoomData` from `roomsData.ts`, `parseICSCalendar` from `calendarSync.ts`.
- Produces: `<SEO />`, `<Lightbox />`, `<BookingForm />`.

- [ ] **Step 1: Build `src/components/SEO.tsx`**

Component that invokes `updateSEO()` on route/language change.

- [ ] **Step 2: Build `src/components/Lightbox.tsx`**

Full-screen modal for high-res retina images with keyboard (`ArrowLeft`, `ArrowRight`, `Esc`), swipe, counter, and caption.

- [ ] **Step 3: Build `src/components/BookingForm.tsx`**

Reusable reservation form with room pre-selection, date pickers, n8n webhook submit, error/success states, and WhatsApp direct link.

- [ ] **Step 4: Verify build**

Run: `npm run build`

---

### Task 3: Build Dedicated Room Detail & Apartment Pages

**Files:**
- Create: `src/pages/RoomDetail.tsx`
- Modify: `src/pages/Apartment.tsx`

**Interfaces:**
- Consumes: `roomsData.ts`, `<BookingForm />`, `<Lightbox />`.
- Produces: `RoomDetail` page component for `/rooms/:roomId`.

- [ ] **Step 1: Build `src/pages/RoomDetail.tsx`**

Dedicated room template with hero header, room info, amenities badges, photo gallery with lightbox, embedded `<BookingForm />`, and mobile sticky booking bar.

- [ ] **Step 2: Upgrade `src/pages/Apartment.tsx`**

Add embedded `<BookingForm defaultRoomIndex="4" />` and lightbox modal to the photo tour.

- [ ] **Step 3: Verify build**

Run: `npm run build`

---

### Task 4: Configure Router & Integrate All Pages

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Nav.tsx`
- Modify: `src/pages/Rooms.tsx`
- Modify: `src/pages/Gallery.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/Contact.tsx`

**Interfaces:**
- Consumes: `react-router-dom` `BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`.

- [ ] **Step 1: Update `src/main.tsx`**

Wrap `<App />` with `<BrowserRouter>`.

- [ ] **Step 2: Update `src/App.tsx` and `src/components/Nav.tsx`**

Configure React Router `Routes` (`/`, `/rooms`, `/rooms/:roomId`, `/apartment`, `/gallery`, `/experiences`, `/about`, `/contact`) and replace manual state switching with React Router `Link` / `useNavigate`.

- [ ] **Step 3: Update `src/pages/Rooms.tsx`**

Link room cards directly to `/rooms/:roomId` and `/apartment` using "Book now" / "View details" buttons.

- [ ] **Step 4: Update `src/pages/Gallery.tsx`**

Connect gallery photos to `<Lightbox />`.

- [ ] **Step 5: Update `src/pages/Contact.tsx`**

Integrate reusable `<BookingForm />`.

- [ ] **Step 6: Verify build**

Run: `npm run build`

---

### Task 5: Final Build & End-to-End Verification

- [ ] **Step 1: Run oxfmt formatting**

Run: `npm run format`

- [ ] **Step 2: Execute Vite production build**

Run: `npm run build`
Expected: Build passes cleanly with zero TypeScript errors or missing imports.
