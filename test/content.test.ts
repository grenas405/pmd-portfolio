import { describe, expect, it } from "vitest";
import { content } from "../src/content";
import { isValidSlug } from "../src/router";
import { escapeVcardText, vcard } from "../src/vcard";
import { sitemapXml } from "../src/seo";
import { themeFromCookie } from "../src/theme";

describe("content", () => {
  it("uses unique, routable case study slugs", () => {
    const slugs = content.caseStudies.map((study) => study.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(isValidSlug(slug)).toBe(true);
  });

  it("stores the phone number in E.164 format", () => {
    expect(content.profile.phone).toMatch(/^\+1\d{10}$/);
  });
});

describe("vcard", () => {
  it("produces a CRLF-delimited vCard 4.0", () => {
    const card = vcard(content.profile);
    expect(card.startsWith("BEGIN:VCARD\r\nVERSION:4.0\r\n")).toBe(true);
    expect(card.endsWith("END:VCARD\r\n")).toBe(true);
    expect(card).toContain(`FN:${content.profile.name}`);
    expect(card).toContain(`tel:${content.profile.phone}`);
  });

  it("escapes special characters", () => {
    expect(escapeVcardText("a,b;c\\d\ne")).toBe("a\\,b\;c\\\\d\\ne");
  });
});

describe("sitemap", () => {
  it("lists the home page and every case study", () => {
    const xml = sitemapXml(content);
    expect(xml).toContain("<loc>https://pedromdominguez.dev/</loc>");
    for (const study of content.caseStudies) expect(xml).toContain(`/work/${study.slug}</loc>`);
  });
});

describe("themeFromCookie", () => {
  it("defaults to light and honours a saved dark theme", () => {
    expect(themeFromCookie(null)).toBe("light");
    expect(themeFromCookie("a=1; theme=dark")).toBe("dark");
    expect(themeFromCookie("theme=darkish")).toBe("light");
    expect(themeFromCookie("xtheme=dark")).toBe("light");
  });
});
