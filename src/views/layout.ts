import { html, jsonScript, type Html } from "../html";
import type { PageContext, PageMeta } from "./types";

const THEME_COLOR = { dark: "#10202e", light: "#e8f0f3" } as const;

const head = (ctx: PageContext, meta: PageMeta): Html => {
  const url = ctx.content.profile.url + meta.path;
  const image = `${ctx.content.profile.url}/og.png`;
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
<meta name="color-scheme" content="${ctx.theme === "light" ? "light" : "dark"}">
<meta name="theme-color" content="${THEME_COLOR[ctx.theme]}">
${meta.indexable ? html`<link rel="canonical" href="${url}">` : html`<meta name="robots" content="noindex">`}
<link rel="preload" href="${ctx.assets.font}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ctx.assets.css}">
<script type="module" src="${ctx.assets.js}"></script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="/manifest.webmanifest">
<meta property="og:type" content="${meta.ogType}">
<meta property="og:site_name" content="${ctx.content.profile.name}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
${meta.jsonLd.map((data) => html`<script type="application/ld+json">${jsonScript(data)}</script>`)}
</head>`;
};

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#work", label: "Projects" },
  { href: "/#process", label: "Process" },
  { href: "/#faq", label: "Questions" },
] as const;

const header = (ctx: PageContext): Html => {
  const { profile } = ctx.content;
  const nextTheme = ctx.theme === "dark" ? "light" : "dark";
  return html`<header class="site-header">
  <a class="brand" href="/" aria-label="${profile.name}, home">Pedro M. Dominguez</a>
  <nav aria-label="Main">
    <button class="menu-button" type="button" popovertarget="site-menu">Menu</button>
    <ul id="site-menu" class="site-menu" popover>
      ${NAV.map((item) => html`<li><a href="${item.href}">${item.label}</a></li>`)}
    </ul>
  </nav>
  <div class="header-actions">
    <button class="theme-toggle" type="button" data-theme-toggle data-next-theme="${nextTheme}"
      aria-label="Switch to ${nextTheme} theme"><span class="theme-toggle__icon" aria-hidden="true"></span></button>
    <a class="button button--small" href="tel:${profile.phone}">Call</a>
  </div>
</header>`;
};

const footer = (ctx: PageContext): Html => {
  const { profile } = ctx.content;
  return html`<footer class="site-footer">
  <p>${profile.name}. ${profile.role}, ${profile.city}, ${profile.region}.</p>
  <ul class="site-footer__links">
    <li><a href="mailto:${profile.email}">${profile.email}</a></li>
    <li><a href="tel:${profile.phone}">${profile.phoneDisplay}</a></li>
    ${profile.links.map((link) => html`<li><a href="${link.href}" rel="me noopener">${link.label}</a></li>`)}
  </ul>
  <p class="site-footer__fine">© ${ctx.year} ${profile.name}</p>
</footer>`;
};

/** Wraps page content in the document shell. Pure: same input, same markup. */
export const layout = (ctx: PageContext, meta: PageMeta, main: Html): Html => html`<!doctype html>
<html lang="en" data-theme="${ctx.theme}">
${head(ctx, meta)}
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header(ctx)}
<main id="main" tabindex="-1">
${main}
</main>
${footer(ctx)}
<output class="toast" data-toast role="status" aria-live="polite"></output>
</body>
</html>`;
