#!/usr/bin/env node
/**
 * Measures the hero while it animates: frame rate, p95 frame time, long
 * animation frames, compositor layers, main-thread script/style time, LCP, CLS.
 * Usage (with `npm run dev` running): node scripts/perf.mjs [baseUrl]
 *   CHROMIUM_PATH=/path/to/chrome  use an existing browser
 * Headless Chrome renders on the CPU, so FPS is pessimistic; layer and style
 * numbers are hardware-independent.
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:8787";
const FRAMES = 180;

const metrics = async (cdp) =>
  Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));

const layerCount = async (cdp) => {
  await cdp.send("LayerTree.enable");
  return new Promise((resolve) => {
    cdp.once("LayerTree.layerTreeDidChange", (event) => resolve(event.layers?.length ?? 0));
    setTimeout(() => resolve("n/a"), 2000);
  });
};

const measure = async (browser, viewport) => {
  const page = await browser.newPage({ viewport });
  const cdp = await page.context().newCDPSession(page);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const layers = await layerCount(cdp);
  await cdp.send("Performance.enable");
  const before = await metrics(cdp);
  const sample = await page.evaluate(
    (frames) =>
      new Promise((resolve) => {
        const deltas = [];
        const long = [];
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((list) => list.getEntries().forEach((e) => long.push(e.duration))).observe({ type: "long-animation-frame" });
        new PerformanceObserver((list) => list.getEntries().forEach((e) => (lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => list.getEntries().forEach((e) => (cls += e.hadRecentInput ? 0 : e.value))).observe({ type: "layout-shift", buffered: true });
        let last = performance.now();
        const tick = (now) => {
          deltas.push(now - last);
          last = now;
          if (deltas.length < frames) requestAnimationFrame(tick);
          else resolve({ deltas, long, lcp, cls });
        };
        requestAnimationFrame(tick);
      }),
    FRAMES,
  );
  const after = await metrics(cdp);
  await page.close();
  const sorted = sample.deltas.slice(5).sort((a, b) => a - b);
  const mean = sorted.reduce((sum, d) => sum + d, 0) / sorted.length;
  const per = (key) => (((after[key] ?? 0) - (before[key] ?? 0)) * 1000) / FRAMES;
  return {
    viewport: `${viewport.width}×${viewport.height}`,
    fps: Math.round(1000 / mean),
    p95: `${sorted[Math.floor(sorted.length * 0.95)]?.toFixed(1)} ms`,
    longFrames: sample.long.length,
    layers,
    scriptPerFrame: `${per("ScriptDuration").toFixed(2)} ms`,
    stylePerFrame: `${per("RecalcStyleDuration").toFixed(2)} ms`,
    layoutPerFrame: `${per("LayoutDuration").toFixed(2)} ms`,
    lcp: `${Math.round(sample.lcp)} ms`,
    cls: sample.cls.toFixed(3),
  };
};

const main = async () => {
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    const rows = [];
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) rows.push(await measure(browser, viewport));
    console.table(rows);
  } finally {
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
