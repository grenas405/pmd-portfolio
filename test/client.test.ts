import { describe, expect, it } from "vitest";
import { magneticOffset } from "../client/motion/magnetic.js";
import { tiltFor } from "../client/motion/tilt.js";
import { shouldAnimate } from "../client/street/scene.js";
import { increment, nextNotification, parallaxFor, tiltFor as streetTilt } from "../client/street/schedule.js";
import { shouldShowCallbar } from "../client/ui/callbar.js";
import { toggleLabel } from "../client/ui/pause.js";
import { activeSection } from "../client/ui/scrollspy.js";
import { otherTheme, parseTheme, themeCookie } from "../client/ui/theme.js";

const messages = [
  ["order 1", "order 2"],
  ["booking 1"],
  ["sale 1", "sale 2", "sale 3"],
];

describe("main street schedule", () => {
  it("takes turns between shops and cycles each shop's messages", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((tick) => nextNotification(tick, messages))).toEqual([
      { shop: 0, text: "order 1" },
      { shop: 1, text: "booking 1" },
      { shop: 2, text: "sale 1" },
      { shop: 0, text: "order 2" },
      { shop: 1, text: "booking 1" },
      { shop: 2, text: "sale 2" },
      { shop: 0, text: "order 1" },
    ]);
  });

  it("returns nothing when there is nothing to say", () => {
    expect(nextNotification(0, [])).toBeNull();
    expect(nextNotification(0, [[]])).toBeNull();
  });

  it("moves deeper layers further, within bounds", () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 };
    const near = parallaxFor(100, 50, rect, 1.2);
    const far = parallaxFor(100, 50, rect, 0.35);
    expect(Math.abs(near.x)).toBeGreaterThan(Math.abs(far.x));
    expect(parallaxFor(10_000, 10_000, rect, 1, 14)).toEqual({ x: 14, y: 14 * 0.6 });
    expect(parallaxFor(50, 50, rect, 1)).toEqual({ x: 0, y: 0 });
  });

  it("tilts the street gently toward the pointer", () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 };
    const { rotateX, rotateY } = streetTilt(100, 0, rect);
    expect(rotateY).toBeCloseTo(5);
    expect(rotateX).toBeCloseTo(2.4);
  });

  it("counts up the phone's tallies", () => {
    expect(increment("12")).toBe("13");
    expect(increment(null)).toBe("1");
    expect(increment("abc")).toBe("1");
  });

  it("animates only when unpaused and on screen", () => {
    expect(shouldAnimate({ userPaused: false, inView: true })).toBe(true);
    expect(shouldAnimate({ userPaused: true, inView: true })).toBe(false);
    expect(shouldAnimate({ userPaused: false, inView: false })).toBe(false);
    expect(toggleLabel(true)).toBe("Play animation");
  });
});

describe("mobile call bar", () => {
  it("shows only once every anchor has scrolled away", () => {
    expect(shouldShowCallbar([true, false])).toBe(false);
    expect(shouldShowCallbar([false, false])).toBe(true);
    expect(shouldShowCallbar([])).toBe(false);
  });
});

describe("pointer effects", () => {
  const rect = { left: 0, top: 0, width: 200, height: 100 };

  it("tilts toward the pointer within a range", () => {
    expect(tiltFor(100, 50, rect, 9)).toEqual({ rotateX: -0, rotateY: 0 });
    expect(tiltFor(200, 0, rect, 9)).toEqual({ rotateX: 9, rotateY: 9 });
  });

  it("pulls magnetic buttons a capped distance", () => {
    expect(magneticOffset(100, 50, rect, 0.3, 10)).toEqual({ x: 0, y: 0 });
    expect(magneticOffset(1000, 50, rect, 0.3, 10)).toEqual({ x: 10, y: 0 });
  });
});

describe("scrollspy", () => {
  it("picks the most visible section", () => {
    expect(activeSection(new Map([["services", 0.2], ["work", 0.6]]))).toBe("work");
    expect(activeSection(new Map([["services", 0.05]]))).toBeNull();
  });
});

describe("theme", () => {
  it("parses, flips, and serializes the theme cookie", () => {
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("<x>")).toBe("light");
    expect(otherTheme("dark")).toBe("light");
    expect(themeCookie("light", true)).toBe("theme=light; Path=/; Max-Age=31536000; SameSite=Lax; Secure");
  });
});
