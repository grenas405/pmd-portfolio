#!/usr/bin/env node
/**
 * Captures the running site for visual review.
 * Usage: node scripts/screenshot.mjs [baseUrl] [outDir]
 *   CHROMIUM_PATH=/path/to/chrome  use an existing browser instead of Playwright's download
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:8787";
const OUT = process.argv[3] ?? ".screenshots";

const SHOTS = [
  { name: "home-desktop", path: "/", viewport: { width: 1440, height: 900 } },
  { name: "home-desktop-full", path: "/", viewport: { width: 1440, height: 900 }, fullPage: true },
  { name: "home-mobile", path: "/", viewport: { width: 390, height: 844 } },
  { name: "home-mobile-full", path: "/", viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "home-light", path: "/", viewport: { width: 1440, height: 900 }, theme: "light" },
  { name: "home-reduced-motion", path: "/", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  { name: "case-desktop-full", path: "/work/field-service-app-for-an-hvac-company", viewport: { width: 1440, height: 900 }, fullPage: true },
  { name: "not-found", path: "/missing", viewport: { width: 1440, height: 900 } },
];

const capture = async (browser, shot) => {
  const context = await browser.newContext({ viewport: shot.viewport, reducedMotion: shot.reducedMotion ?? "no-preference" });
  if (shot.theme) await context.addCookies([{ name: "theme", value: shot.theme, url: BASE }]);
  const page = await context.newPage();
  const problems = [];
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && problems.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  await page.goto(BASE + shot.path, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000); // let the intro animation settle
  const file = join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: shot.fullPage ?? false });
  await context.close();
  return `${file}${problems.length ? `\n  ${problems.join("\n  ")}` : ""}`;
};

const main = async () => {
  await mkdir(OUT, { recursive: true });
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    for (const shot of SHOTS) console.log(await capture(browser, shot));
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
