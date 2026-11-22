import { describe, expect, it } from "vitest";
import { content, type SiteContent } from "../src/content";
import { toMarkup } from "../src/html";
import { caseStudyPage, errorPage, homePage, nextCaseStudy } from "../src/views/pages";
import { mockup } from "../src/views/mockups";
import { metroMap } from "../src/views/map";
import type { PageContext } from "../src/views/types";

const ctx = (overrides: Partial<PageContext> = {}): PageContext => ({
  content,
  assets: { js: "/assets/app.js", css: "/assets/styles.css", font: "/assets/font.woff2", mono: "/assets/mono.woff2" },
  theme: "dark",
  year: 2026,
  ...overrides,
});

const count = (haystack: string, needle: RegExp) => haystack.match(needle)?.length ?? 0;

describe("home page", () => {
  const page = toMarkup(homePage(ctx()));

  it("has exactly one h1 and every section", () => {
    expect(count(page, /<h1[\s>]/g)).toBe(1);
    for (const id of ["services", "work", "promise", "process", "local", "about", "faq", "contact"]) {
      expect(page).toContain(`id="${id}"`);
    }
  });

  it("renders every service, project, and question", () => {
    for (const service of content.services) expect(page).toContain(service.name.replace("&", "&amp;"));
    for (const study of content.caseStudies) expect(page).toContain(`href="/work/${study.slug}"`);
    expect(count(page, /<details class="faq" name="faq">/g)).toBe(content.faqs.length);
  });

  it("labels example projects honestly", () => {
    const examples = content.caseStudies.filter((study) => study.kind === "example").length;
    expect(count(page, /Example project<\/span>/g)).toBe(examples);
  });

  it("contains no inline scripts or inline styles (CSP)", () => {
    const scripts = page.match(/<script\b[^>]*>/g) ?? [];
    for (const tag of scripts) expect(tag).toMatch(/type="(module|application\/ld\+json)"/);
    expect(page).not.toMatch(/\sstyle="/);
    expect(page).not.toMatch(/<style\b/);
    expect(page).not.toMatch(/\son[a-z]+="/);
  });

  it("puts the terminal's typed text in the HTML for crawlers and screen readers", () => {
    expect(page).toContain("cat howdy.txt");
    expect(page).toContain(content.terminal.greeting.replace("'", "&#39;"));
    for (const service of content.services) expect(page).toContain(`${service.dir}/`);
  });

  it("hides the testimonials section until there are real quotes", () => {
    expect(page).not.toContain('class="quotes"');
    const withQuotes = toMarkup(homePage(ctx({ content: { ...content, testimonials: [{ quote: "Great work.", name: "Ana", business: "Ana's Bakery" }] } })));
    expect(withQuotes).toContain('class="quotes"');
    expect(withQuotes).toContain('<span class="word">owners</span>');
  });

  it("shows a monogram until a portrait is set", () => {
    expect(page).toContain("portrait__placeholder");
    const withPhoto = toMarkup(
      homePage(ctx({ content: { ...content, profile: { ...content.profile, portrait: { src: "/img/pedro.avif", alt: "Pedro", width: 800, height: 1000 } } } })),
    );
    expect(withPhoto).toContain('<img class="portrait__img" src="/img/pedro.avif" alt="Pedro" width="800" height="1000" loading="lazy"');
  });

  it("renders the saved theme on the root element", () => {
    expect(toMarkup(homePage(ctx({ theme: "light" })))).toContain('<html lang="en" data-theme="light">');
  });
});

describe("escaping hostile content", () => {
  it("renders injected markup inert everywhere", () => {
    const evil = `<img src=x onerror=alert(1)>`;
    const hostile: SiteContent = {
      ...content,
      intro: evil,
      faqs: [{ question: evil, answer: evil }],
      caseStudies: content.caseStudies.map((study) => ({ ...study, title: evil, summary: evil })),
    };
    const page = toMarkup(homePage(ctx({ content: hostile })));
    expect(page).not.toContain(evil);
    expect(page).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });
});

describe("case study page", () => {
  it("renders a known project", () => {
    const study = content.caseStudies[0]!;
    const result = caseStudyPage(ctx(), study.slug);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const page = toMarkup(result.value);
      expect(count(page, /<h1[\s>]/g)).toBe(1);
      expect(page).toContain(`<link rel="canonical" href="https://pedromdominguez.dev/work/${study.slug}">`);
    }
  });

  it("returns an explicit NotFound error for unknown slugs", () => {
    expect(caseStudyPage(ctx(), "nope")).toEqual({ ok: false, error: { kind: "NotFound", path: "/work/nope" } });
  });
});

describe("mockups and map", () => {
  it("hides decorative mockups from assistive tech", () => {
    for (const kind of ["ordering", "field-service", "booking"] as const) {
      expect(toMarkup(mockup(kind))).toMatch(/^<div class="mockup mockup--[a-z-]+" data-tilt aria-hidden="true">/);
    }
  });

  it("labels the map and skips unknown cities", () => {
    const svg = toMarkup(metroMap(["Oklahoma City", "Edmond", "Atlantis"]));
    expect(svg).toContain('role="img"');
    expect(svg).toContain(">Edmond</text>");
    expect(svg).not.toContain("Atlantis");
    expect(svg.match(/class="metro-map__road"/g)).toHaveLength(1);
  });
});

describe("next project", () => {
  it("wraps around to the first project", () => {
    const last = content.caseStudies[content.caseStudies.length - 1]!;
    expect(nextCaseStudy(content.caseStudies, last.slug)?.slug).toBe(content.caseStudies[0]!.slug);
    expect(nextCaseStudy(content.caseStudies, "missing")).toBeUndefined();
  });
});

describe("error page", () => {
  it("is not indexable", () => {
    expect(toMarkup(errorPage(ctx(), 404, "/missing"))).toContain('<meta name="robots" content="noindex">');
  });
});
