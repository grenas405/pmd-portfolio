# pedromdominguez.dev

Portfolio and lead site for **Pedro M. Dominguez**, who builds web apps, APIs and Android apps for local businesses in the Oklahoma City metro. It runs on a single Cloudflare Worker written in TypeScript. The frontend is plain HTML, CSS and JavaScript, animated with [anime.js](https://animejs.com) v4.

## Design

**Concept: `prairie.sh`.** A futuristic, Linux-themed site with a touch of country. The hero is a modern terminal window open over an Oklahoma prairie at dusk, and the prairie is drawn entirely in glyphs.

- **The terminal:**
  - A tmux-style status bar with the live Oklahoma City time.
  - Typed commands (`cat howdy.txt`, `ls services/`) whose output reveals the pitch.
  - A real `<h1>` and real links.
  - An interactive prompt. Type `help`, `ls services`, `cd contact`, `call`, `theme` and so on.
- **The prairie** is drawn on one `<canvas>`:
  - A wheat field of `| / \ ;` glyphs swaying in wind waves and gusts.
  - A banded setting sun.
  - An ASCII Aermotor windmill turning on the horizon.
  - A perspective grid fading into the horizon.
  - Glyphs that "decrypt" into wheat when the page loads.
  - The same scene returns behind the contact band and the 404 page.
- **Motion:**
  - anime.js drives the boot timeline, the wind parameters, the scroll-drawn process line and metro map, the title reveals, the 3D mockup tilt and parallax, and the magnetic CTAs.
  - There is a visible Pause button (WCAG 2.2.2), and the prairie only animates while on screen.
  - `prefers-reduced-motion` shows a complete still scene.
- **Look:**
  - Palette: storm-dusk blue `#10202e`, supercell teal `#1f4e5f`, wheat gold `#e9b949`, sky `#8ec3d3`, red dirt `#c4553a`, prairie light `#eef2ec`.
  - Themes: dark by default; light ("prairie noon") is opt-in.
  - Type: Archivo variable for the voice (the expanded width for headlines), and JetBrains Mono only for terminal UI.
- **Content:** a services bento, project showcases with coded phone and browser mockups, guarantees (with testimonial slots), a scroll-drawn process, an OKC metro map, about with a portrait slot, a FAQ, and the contact band.

**Performance by construction.** Version 0.1 animated about 1,600 DOM nodes and produced about 2,400 compositor layers, which ran at about 6 fps in headless Chrome. The canvas prairie draws a pre-rendered glyph atlas at 30 fps from a small parameter object:

| | 0.1 (DOM field) | 0.2 (canvas) |
|---|---|---|
| Compositor layers | 2,390 | 19 |
| Style recalc per frame | ~12 ms | 0.17 ms |
| Desktop / mobile fps (headless, CPU) | 6 / – | 51 / 60 |
| CLS | – | 0.000 |

Other measures:
- Cells hidden behind the terminal are skipped.
- No `backdrop-filter` sits over the animating canvas (it doubled frame cost).
- Run `npm run perf` to re-measure.

## Security (OWASP)

- **Enforced CSP:** `default-src 'none'; script-src 'self'; style-src 'self'`, plus `require-trusted-types-for 'script'; trusted-types 'none'`.
  - There are no inline scripts, styles or event handlers, and no third-party origins. Fonts and anime.js are self-hosted.
  - Client code builds DOM only with `createElement` and `textContent`. Terminal output is set with `textContent` too. anime.js's `splitText` writes `innerHTML`, so it isn't used; the Worker sends section titles pre-split into words instead. anime's `onScroll` only writes `innerHTML` in debug mode, which is never enabled.
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

All copy lives in [`src/content.ts`](src/content.ts): profile, terminal greeting, availability line, guarantees, testimonials, services, projects, process, service area, about and FAQs.

- **Portrait:** put a photo in `public/img/` and set `profile.portrait` (`src`, `alt`, `width`, `height`). Until then a "PD" monogram is shown.
- **Testimonials:** add real quotes to `testimonials`. The section heading switches to "What owners say" and the quotes appear above the guarantees. While the list is empty, nothing is shown, so no quotes are ever faked.
- **Availability:** update `availability` (e.g. "Booking new projects for January 2027") as your schedule changes.
- **Projects:** each project picks a coded mockup (`mockup: "ordering" | "field-service" | "booking"`) and one `keyOutcome` for its card.

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

`public/og.png` (1200×630) is a capture of the live hero with reduced motion, with the header and buttons hidden. If you change the hero, regenerate it the same way.
