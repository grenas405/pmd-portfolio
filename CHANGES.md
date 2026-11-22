# Changes

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
