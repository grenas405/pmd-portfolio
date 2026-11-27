# pedromdominguez.dev

Portfolio and lead site for **Pedro M. Dominguez**, who builds web apps, APIs and Android apps for local businesses in the Oklahoma City metro. It runs on a single Cloudflare Worker written in TypeScript. The frontend is plain HTML, CSS and JavaScript, animated with [anime.js](https://animejs.com) v4.

## Design

**Concept: "Main Street, open for business."** The site is bright, warm and local, made for business owners rather than developers. The hero shows the owner's world: an animated Main Street where the shops open for the day and their owner's phone fills up with orders, bookings and sales. The message: *this is your business, working while you're busy.*

- **The hero scene** is inline SVG plus a few HTML cards, rendered by the Worker:
  - Three storefronts (a café, a salon and a boutique), each with an awning, windows, a door and an OPEN sign.
  - An abstract OKC skyline with Devon Tower and the Skydance Bridge.
  - A car, a scissor-tailed flycatcher (the state bird), and the owner's phone in the foreground.
- **Motion** (anime.js v4):
  - **Opening:** the shops rise, the awnings unroll and the lights come on, then each sign flips from CLOSED to OPEN.
  - **Business day:** every few seconds a shop pings with a notification ("New pickup order · $42.50", "Booked: Haircut at 2:30", "Online sale · $68.00") and the phone's counter ticks up.
  - **Depth:** three layers move at different rates with the pointer, and the scene tilts slightly.
  - **Pause:** a visible Pause button (WCAG 2.2.2) stops it. Loops also pause off screen.
  - **Reduced motion:** a complete still scene, open for business.
  - **The rest of the page:** section titles rise word by word, line icons draw themselves, the process line and metro map draw as you scroll, project mockups tilt toward the pointer, and the main buttons lean toward it.
- **Look:**
  - Light-first: paper `#fbfaf8`, navy ink `#13294b`, red dirt `#b5482f`, prairie gold `#e9b949`, sky `#cfe6f2` and sage `#5f8a6e`.
  - Dark mode turns the scene into an evening street with a moon and glowing windows.
  - Archivo is the only typeface, with the expanded width for headlines.
- **Built for owners:**
  - Plain-language copy.
  - Before → after on every project.
  - Guarantees, plus slots for real testimonials and a reviews badge that stay hidden until filled.
  - A sticky Call/Text bar on phones.
  - A "Sorry, we're closed" shop door on the 404 page.

**Performance.** No animation targets more than about 50 elements, and only `transform` and `opacity` animate. `npm run perf` (headless Chrome) measures 60 fps on desktop and mobile, a 16.7 ms p95 frame, about 0 ms of style work per frame, LCP around 0.4 s and CLS 0.000. Version 0.1's DOM grass field, for comparison, ran at about 6 fps with about 2,400 GPU layers.

## Architecture

Small, single-purpose modules with no classes and no shared mutable state. Side effects live only at the two entry points: `src/index.ts` (server) and `client/main.js` (browser).

```
src/                      Cloudflare Worker (TypeScript)
  index.ts                entry: route → render → respond; the only I/O; one try/catch boundary
  router.ts               pure: (method, URL) → Route union
  result.ts               Result<T, E> for explicit errors in pure code
  html.ts                 auto-escaping `html` tagged template
  headers.ts              security + cache header policies (CSP, HSTS, COOP, CORP, …)
  respond.ts              pure Response builders
  content.ts              ALL site copy and data: edit this file to change the site
  seo.ts / vcard.ts       JSON-LD, sitemap, vCard builders
  theme.ts                theme cookie parsing (light by default)
  views/                  pure render functions: (context) → Html
    sections/             one file per home-page section (hero, services, work, …)
    street.ts skyline.ts logo.ts   Main Street scene, OKC skyline, awning logo (pure SVG)
    mockups.ts icons.ts map.ts     coded device mockups, line icons, OKC metro map
client/                   browser code (ES modules, JSDoc-typed and type-checked)
  main.js                 composition root; each feature isolated with `safely()`
  street/                 schedule.js (pure: notification order, parallax, counters), scene.js (anime.js wiring)
  motion/                 title reveals, line drawing, mockup tilt/parallax, magnetic buttons
  ui/                     theme toggle, pause control, mobile call bar, scrollspy, copy buttons, menu, toast
  styles/                 tokens, base, components/, sections/, street, mockups, motion
scripts/build-client.mjs  esbuild → content-hashed files in public/assets + src/assets.gen.ts
scripts/screenshot.mjs    Playwright captures for visual review
scripts/perf.mjs          Playwright + CDP performance probe
public/                   static files served through the ASSETS binding
test/                     Vitest, running inside the Workers runtime
```

Every request goes through the Worker (`run_worker_first: true`), so `src/headers.ts` is the single source of truth for response headers.

## Security (OWASP)

- **Enforced CSP:** `default-src 'none'; script-src 'self'; style-src 'self'`, plus `require-trusted-types-for 'script'; trusted-types 'none'`.
  - There are no inline scripts, styles or event handlers, and no third-party origins. Fonts and anime.js are self-hosted.
  - Client code builds DOM only with `createElement` and `textContent`; notification text is set with `textContent`. anime.js's `splitText` writes `innerHTML`, so it isn't used; the Worker sends section titles pre-split into words instead. anime's `onScroll` only writes `innerHTML` in debug mode, which is never enabled.
- **Other headers:** HSTS (preload-ready), `X-Content-Type-Options`, `Referrer-Policy`, a deny-all `Permissions-Policy`, COOP and CORP `same-origin`, and `X-Frame-Options: DENY`.
- **Escaping:** every interpolated value is HTML-escaped by default, and JSON-LD is serialized so it can't break out of its `<script>` tag. Tests feed hostile content through every view.
- **Request handling:**
  - Only `GET` and `HEAD` are accepted; anything else gets a 405 with an `Allow` header.
  - Slugs are validated before lookup.
  - Errors are logged as structured JSON with no request data, and visitors see a generic page.
- **Dependencies:** pinned to exact versions in `package.json`. Run `npm audit` before deploying.

## Develop

```sh
npm install
npm run dev        # build the client bundle, then wrangler dev on http://localhost:8787
npm run check      # build + type-check (server and client) + tests
```

| Script | What it does |
| --- | --- |
| `npm run build:client` | Bundle `client/` into hashed files and regenerate `src/assets.gen.ts` |
| `npm run typecheck` | Build, `wrangler types`, then `tsc` for the Worker and the client JS |
| `npm test` | Build, then run Vitest in the Workers runtime (`@cloudflare/vitest-plugin`) |
| `npm run deploy` | `check`, then `wrangler deploy` |
| `npm run perf` | With `npm run dev` running, measure the animating hero: fps, p95 frame time, long frames, layers, script/style time per frame, LCP and CLS. |
| `npm run screenshots` | With `npm run dev` running, capture desktop, mobile, light, reduced-motion, case-study and 404 views into `.screenshots/` (Playwright). Set `CHROMIUM_PATH` to reuse an installed Chrome instead of running `npx playwright install chromium`. |

## Edit the content

All copy lives in [`src/content.ts`](src/content.ts): profile, availability line, the Main Street shops and their notifications, guarantees, testimonials, services, projects (with before → after), process, service area, about and FAQs.

- **Portrait:** put a photo in `public/img/` and set `profile.portrait` (`src`, `alt`, `width`, `height`). Until then a "PD" monogram is shown.
- **Testimonials:** add real quotes to `testimonials`. The section heading switches to "What owners say" and the quotes appear above the guarantees. While the list is empty, nothing is shown, so no quotes are ever faked.
- **Reviews:** once you have them, set `profile.reviews` (`rating`, `count`, `source`, `url`) to show a star badge in the hero. It stays hidden until then.
- **Main Street:** edit `street.shops` to change the shop names or the notifications they receive. The names are generic on purpose, so they can't be mistaken for real local businesses.
- **Availability:** update `availability` (e.g. "Booking new projects for January 2027") as your schedule changes.
- **Projects:** each project picks a coded mockup (`mockup: "ordering" | "field-service" | "booking"`), plus plain-language `before` and `after` lines for its card.

**Before launch, replace the placeholders:**
- [ ] Phone number (`+14055550123` / `(405) 555-0123` is a fictional 555 number)
- [ ] Email address (`hello@pedromdominguez.dev`). Set up Cloudflare Email Routing if you use this address.
- [ ] Profile links (LinkedIn, Google Business Profile, …)
- [ ] Example projects: they are labeled "Example project" on the site. Change `kind` to `"client"` when you add real work.

## Deploy

1. Make sure the `pedromdominguez.dev` zone is on your Cloudflare account, then run `npx wrangler login`.
2. Run `npm run deploy`. The `routes` in `wrangler.jsonc` attach the Worker to `pedromdominguez.dev` and `www.pedromdominguez.dev` as custom domains, and `www` redirects to the bare domain.
3. In the Cloudflare dashboard, turn on **SSL/TLS → Edge Certificates → Always Use HTTPS**. The http → https redirect happens there rather than in the Worker, which keeps `wrangler dev` working.
4. Once the site has been served over HTTPS for a while, you can submit the domain at [hstspreload.org](https://hstspreload.org). `.dev` is already on the HSTS preload list as a TLD.
5. Verify the deploy:
   - Run `curl -I https://pedromdominguez.dev`.
   - Check headers at securityheaders.com.
   - Check structured data with Google's Rich Results Test.

## Social image

`public/og.png` (1200×630) is a capture of the live Main Street hero with reduced motion, with the header and buttons hidden. If you change the hero, regenerate it the same way.
