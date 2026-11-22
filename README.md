# pedromdominguez.dev

Portfolio and lead site for **Pedro M. Dominguez**, who builds web apps, APIs and Android apps for local businesses in the Oklahoma City metro. It runs on a single Cloudflare Worker written in TypeScript. The frontend is plain HTML, CSS and JavaScript, animated with [anime.js](https://animejs.com) v4.

## Design

- **Signature moment:** the hero is a prairie at dusk. A 3D field of grass blades (DOM elements under CSS perspective) rises from the horizon, then sways in waves of wind that roll west to east, with periodic gusts. The first gust also passes through the headline. All of this motion is driven by anime.js (`animate`, `stagger` with grid and jitter, `createScope`, `createAnimatable`). Nothing else on the page moves on its own.
- **Palette:** storm-dusk blue `#10202e`, supercell teal `#1f4e5f`, wheat gold `#e9b949`, sky glow `#8ec3d3` and prairie light `#eef2ec`. Dark is the default theme, light is opt-in.
- **Type:** Archivo variable only. Headlines use the expanded width (`font-stretch: 125%`) and body text uses normal width.
- **Accessibility:**
  - There is a visible Pause button (WCAG 2.2.2).
  - `prefers-reduced-motion` shows a still field.
  - Motion pauses when the hero scrolls out of view.
  - Headline text is never hidden, so it is readable and is the LCP element from the first frame.

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
  theme.ts                theme cookie parsing
  views/                  pure render functions: (context) → Html
client/                   browser code (ES modules, JSDoc-typed and type-checked)
  main.js                 composition root; each feature isolated with `safely()`
  motion/                 field + headline animation, seeded randomness, preferences
  ui/                     theme toggle, pause control, copy buttons, menu, toast
  styles/                 tokens, base, layout, field, motion CSS
scripts/build-client.mjs  esbuild → content-hashed files in public/assets + src/assets.gen.ts
public/                   static files served through the ASSETS binding
test/                     Vitest, running inside the Workers runtime
```

Every request goes through the Worker (`run_worker_first: true`), so `src/headers.ts` is the single source of truth for response headers.

## Security (OWASP)

- **Enforced CSP:** `default-src 'none'; script-src 'self'; style-src 'self'`, plus `require-trusted-types-for 'script'; trusted-types 'none'`.
  - There are no inline scripts, styles or event handlers, and no third-party origins. Fonts and anime.js are self-hosted.
  - Client code builds DOM only with `createElement` and `textContent`. anime.js's `splitText` writes `innerHTML`, so it isn't used; the Worker renders the headline pre-split instead.
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
| `npm run screenshots` | With `npm run dev` running, capture desktop, mobile, light, reduced-motion, case-study and 404 views into `.screenshots/` (Playwright). Set `CHROMIUM_PATH` to reuse an installed Chrome instead of running `npx playwright install chromium`. |

## Edit the content

All copy lives in [`src/content.ts`](src/content.ts): profile, services, projects, process, service area, about and FAQs.

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
