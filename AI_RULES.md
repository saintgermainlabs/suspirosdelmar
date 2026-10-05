# App Development Rules

## Tech Stack
- React 19 and React DOM 19 for the client-side application and UI rendering.
- TypeScript 5.7 for typed application code; use `.tsx` for components and `.ts` for data and utilities.
- Vite 8 with `@vitejs/plugin-react` for development, hot reload, and production builds.
- React Router DOM 7 for page routing and in-app navigation.
- Tailwind CSS 4, integrated through `@tailwindcss/vite`, for styling.
- React Context and hooks for shared language preferences and local UI state.
- Custom Spanish/English translations in `src/i18n.ts`, exposed through `src/LanguageContext.tsx`.
- Native browser `fetch` for external integrations, including n8n form submissions; no application server or database is currently configured.
- Playwright with `@playwright/test` for browser and form tests, with the configured TestDino reporter.
- oxfmt for code formatting.

## Library and Implementation Rules
- Use React function components and hooks. Prefer local `useState` for component state and the existing Context pattern for shared state; do not introduce a state-management library without a concrete need.
- Keep route definitions in `src/App.tsx`. Use React Router `Link`, `NavLink`, and navigation hooks for internal navigation, and normal anchors for external links.
- Put application source in `src/`, pages in `src/pages/`, and reusable UI in `src/components/`. The current `/` route renders `src/pages/Home.tsx`; preserve it unless the task explicitly changes the entry page. Wire new pages or components into the visible application.
- Use Tailwind utility classes for layout, spacing, colors, and responsive styling. Keep global styles, font imports, animations, and theme defaults in `src/index.css`. Preserve the existing Outfit body font and Fraunces display font. Do not add Tailwind v3 configuration or a second CSS framework.
- Prefer shadcn/ui components when available; wrap them in app-specific components rather than editing library primitives. Prefer lucide-react for icons when available. Neither is currently declared in `package.json`, so verify availability and add necessary dependencies before importing them; do not assume scaffold libraries exist.
- Use `useLang()` and the existing translation structure for user-facing Spanish and English text. Update both languages when adding copy; do not introduce another internationalization library.
- Keep shared site information and integration links in `src/site.ts`, room data in `src/data/roomsData.ts`, and reusable non-UI logic in `src/utils/`. Reuse the existing SEO component and utilities rather than adding a separate SEO package.
- Use native `fetch` for HTTP requests, check HTTP status and the documented response payload, and provide submitting, success, and error states for forms. Booking submission is successful only when the response is OK and explicitly contains `success: true`. Do not add Axios or a form library for simple forms.
- Treat all `VITE_*` environment variables as public browser configuration. Never put secrets in client code. Do not imply that inquiry submissions create confirmed reservations; retain the existing external integration contract unless explicitly asked to change it.
- Use semantic HTML, labeled form controls, keyboard-accessible interactions, descriptive image alternatives, and reduced-motion support. Reuse existing assets and UI patterns before adding libraries.
- Use Playwright for browser regressions, especially forms and navigation. Keep normal tests isolated from real external submissions; run live-submission tests only when explicitly requested. Follow oxfmt formatting and the existing default-export convention for page and UI components.
- Keep changes focused on the request. Preserve Vite's Figma integration plugins and deployment configuration. Rely on the existing development server and hot reload for normal edits; do not start another server or reinstall dependencies unnecessarily.
