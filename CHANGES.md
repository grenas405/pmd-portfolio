# Changes

## 0.3.0 — 2026-11-27

A new theme, "Main Street, open for business," built for local business owners rather than developers.

### Changed
- **Hero:** an animated Main Street replaces the Linux terminal and ASCII prairie.
  - It has three storefronts (café, salon, boutique) under the OKC skyline (Devon Tower, the Skydance Bridge).
  - In the opening, the shops rise, the awnings unroll, the lights come on and the signs flip from CLOSED to OPEN.
  - During the "business day", the shops ping with orders, bookings and sales, and the owner's phone counts them.
  - A car and a scissor-tailed flycatcher pass by, the layers move with the pointer for depth, and there's a Pause button.
  - Reduced motion shows a still, open-for-business scene.
- **Theme:**
  - Light-first ("Main Street by day") with navy, red-dirt and prairie-gold colors; dark mode becomes an evening street with glowing windows.
  - Archivo is the only typeface.
  - A new awning logo and favicon.
- **Projects:** each card shows a plain-language before → after.
- **Contact band:** the OKC skyline at golden hour.
- **404:** a shop door with a "Sorry, we're closed" sign.
- **Copy:** the `~/okc/…` path lines, `cd ../` and `exit 0` flourishes are gone.

### Added
- A sticky Call/Text bar on phones. It appears once the hero's buttons scroll away and hides again near the contact section.
- An optional reviews badge (`profile.reviews`). It is hidden until real reviews exist.

### Fixed
- Rebuilding the client while `npm run dev` was running made every asset 404 until the server restarted. The build script used to delete and recreate `public/assets`, which `wrangler dev` stops watching. It now empties the directory instead.
- The README's Architecture section, accidentally dropped in 0.2.0, is restored and updated.

### Removed
- The terminal (`client/terminal/`), the canvas prairie (`client/prairie/`) and the JetBrains Mono font.

## 0.2.0 — 2026-11-22

A redesign to look more professional, with a new futuristic, Linux-themed hero and a fix for the hero's poor animation performance.

### Fixed
- **Hero animation performance.** The 0.1 field animated about 1,600 DOM elements on the main thread and created about 2,400 compositor layers, which ran at about 6 fps in headless Chrome.
  - The new hero draws on a single canvas from a pre-rendered glyph atlas. That gives 19 layers, 0.17 ms of style work per frame, 51 fps on desktop and 60 fps on mobile (headless, CPU rendering), and CLS of 0.000.
  - No `backdrop-filter` sits over the animating canvas, and cells hidden under the terminal are skipped.

### Changed
- **Hero: `prairie.sh`.** A terminal window (tmux status bar with live OKC time, typed commands, an interactive prompt) over a glyph prairie at dusk, with a wheat field in the wind, a banded setting sun and an ASCII windmill.
  - The field "decrypts" from noise when the page loads.
  - An availability line and three guarantees sit under the window.
- **Design system.**
  - An editorial two-column section header with a `~/okc/…` path line, and alternating surfaces.
  - Film grain, refined buttons, a logo mark, and a header that turns to glass on scroll with a scrollspy underline.
  - JetBrains Mono for terminal UI.
- **Services:** a bento grid with a featured tile and line icons.
- **Projects:** showcase cards with coded phone and browser mockups that tilt toward the pointer and drift on scroll.
- **Process:** a horizontal line that draws as you scroll, with steps lighting up in turn.
- **Service area:** an SVG map of the OKC metro whose roads draw in.
- **About:** a portrait slot (monogram placeholder) and a "how I work" checklist.
- **FAQ:** a two-column layout with a sticky header and smooth open and close.
- **Contact:** a band with the prairie behind the phone number.
- **Footer:** a large footer with columns.
- **Case studies:** a split hero with the mockup, outcome cards and a "Next project" link.
- **404:** a compact terminal-style page over the prairie.
- **Copy:** the hero greeting no longer repeats the intro.

### Added
- A guarantees section, plus a testimonials slot that stays hidden until real quotes are added.
- `npm run perf` (`scripts/perf.mjs`): measures fps, frame times, long frames, layers, style and script time, LCP and CLS.
- `npm run screenshots` (`scripts/screenshot.mjs`, Playwright): desktop, mobile, light, reduced-motion, case study and 404 captures, scrolling first so reveals run, and reporting console errors.
- 75 tests (up from 52), including:
  - the prairie frame math, palette and windmill
  - the terminal commands, typing and OKC clock
  - tilt, magnetic and scrollspy math
  - testimonial and portrait slots, mockups, the map and next-project wrapping

### Removed
- The DOM-based grass field (`client/motion/field.js`, `client/styles/field.css`).

## 0.1.0 — 2026-11-22

First version of pedromdominguez.dev.

### Added
- A Cloudflare Worker (TypeScript) that renders the home page, case study pages (`/work/:slug`), error pages (404/405/500), a vCard (`/contact.vcf`) and a sitemap. Everything else is served from static assets.
- A cinematic hero: a 3D prairie field of grass blades at dusk, animated with anime.js v4.5.
  - Blades rise from the horizon, sway in rolling wind and bend under periodic gusts, and the first gust passes through the headline.
  - The field tilts toward the pointer.
  - A visible Pause button stops the motion, reduced-motion visitors get a still field, and motion pauses when the hero is off screen.
- Home page sections: services, projects (clearly labeled examples), process, service area, about, FAQ (an exclusive `<details>` accordion), and contact with call, text, email, copy-email and save-contact actions.
- A dark-first theme with a light theme. The choice is stored in a cookie so the server renders it on the next load with no flash.
- Cross-document view transitions between the home page and project pages, and a scroll-driven progress line on the process steps.
- Strict security headers: CSP with Trusted Types, HSTS, COOP, CORP, Permissions-Policy, Referrer-Policy and nosniff. Every rendered value is HTML-escaped.
- SEO: `ProfessionalService` and `FAQPage` JSON-LD with the OKC metro as `areaServed`, canonical URLs, Open Graph and Twitter cards, `og.png`, `sitemap.xml` and `robots.txt`.
- An esbuild client build with content-hashed, immutable-cached assets and a self-hosted Archivo variable font.
- 52 Vitest tests running in the Workers runtime, covering the router, escaping, headers, views, content, client logic and full requests through the Worker.
