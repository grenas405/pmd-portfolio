import { describe, expect, it } from "vitest";
import { magneticOffset } from "../client/motion/magnetic.js";
import { tiltFor } from "../client/motion/tilt.js";
import { bladeGlyph, cellNoise, coveredCells, createLayout, fieldFrame, GLYPHS, SHADES, windmillCells } from "../client/prairie/frame.js";
import { buildPalette, mix, parseRgb } from "../client/prairie/palette.js";
import { glyphFontSize, shouldAnimate } from "../client/prairie/scene.js";
import { typedText } from "../client/terminal/boot.js";
import { okcClock, runCommand } from "../client/terminal/commands.js";
import { toggleLabel } from "../client/ui/pause.js";
import { activeSection } from "../client/ui/scrollspy.js";
import { otherTheme, parseTheme, themeCookie } from "../client/ui/theme.js";

const layout = createLayout(800, 400, { cellWidth: 8, cellHeight: 18, horizon: 0.6, sun: true, windmill: true });
const params = { gustX: 0.5, gustStrength: 1, boot: 1.2, pointerCol: -99, pointerRow: -99, pointerStrength: 0, intensity: 1 };

describe("prairie frame", () => {
  it("sizes the grid from the canvas and cell size", () => {
    expect(layout.cols).toBe(100);
    expect(layout.rows).toBe(23);
    expect(layout.horizon).toBe(14);
  });

  it("is deterministic for the same inputs", () => {
    expect(fieldFrame(layout, params, 3)).toEqual(fieldFrame(layout, params, 3));
    expect(cellNoise(3, 4)).toBe(cellNoise(3, 4));
  });

  it("changes over time (the wind moves)", () => {
    expect(fieldFrame(layout, params, 3).glyph).not.toEqual(fieldFrame(layout, params, 4.5).glyph);
  });

  it("only uses known glyphs and shades", () => {
    const frame = fieldFrame(layout, params, 2);
    expect(Math.max(...frame.glyph)).toBeLessThan(GLYPHS.length);
    expect(Math.max(...frame.shade)).toBeLessThanOrEqual(SHADES.noise.start);
  });

  it("shows nothing below the horizon before the field boots", () => {
    const bare = { ...layout, windmill: false };
    const frame = fieldFrame(bare, { ...params, boot: 0 }, 2);
    const fieldCells = frame.glyph.slice((layout.horizon + 1) * layout.cols);
    expect(fieldCells.every((glyph) => glyph === 0)).toBe(true);
  });

  it("shows no decrypting noise once booted", () => {
    const frame = fieldFrame(layout, params, 2);
    expect([...frame.shade].includes(SHADES.noise.start)).toBe(false);
  });

  it("leans blades with the wind", () => {
    expect(GLYPHS[bladeGlyph(0.9, 0.8, 0.1)]).toBe("/");
    expect(GLYPHS[bladeGlyph(0.9, -0.8, 0.1)]).toBe("\\");
    expect(GLYPHS[bladeGlyph(0.9, 0, 0.1)]).toBe("|");
  });

  it("draws a windmill that stays on the grid and turns", () => {
    const a = windmillCells(layout, 0);
    const b = windmillCells(layout, 0.5);
    expect(a.length).toBeGreaterThan(20);
    for (const [index] of a) expect(index).toBeLessThan(layout.cols * layout.rows);
    expect(a).not.toEqual(b);
  });

  it("finds the cells hidden behind an opaque box", () => {
    expect(coveredCells(layout, { left: 80, top: 36, right: 400, bottom: 360 })).toEqual({ col0: 11, row0: 3, col1: 48, row1: 18 });
    expect(coveredCells(layout, { left: 0, top: 0, right: 10, bottom: 10 })).toBeNull();
  });
});

describe("prairie palette", () => {
  it("parses computed colors and mixes them", () => {
    expect(parseRgb("rgb(16, 32, 46)")).toEqual([16, 32, 46, 1]);
    expect(parseRgb("rgba(16, 32, 46, 0.5)")).toEqual([16, 32, 46, 0.5]);
    expect(mix([0, 0, 0, 0], [10, 20, 30, 1], 0.5)).toEqual([5, 10, 15, 0.5]);
  });

  it("builds one color per shade", () => {
    const c: [number, number, number, number] = [10, 20, 30, 1];
    const palette = buildPalette({ fieldLow: c, fieldMid: c, fieldHigh: c, sunLow: c, sunHigh: c, mill: c, noise: c, grid: c });
    expect(palette).toHaveLength(SHADES.noise.start + 1);
    expect(palette[0]).toBe("transparent");
  });
});

describe("prairie scene", () => {
  it("animates only when unpaused, in view, and motion is allowed", () => {
    expect(shouldAnimate({ userPaused: false, inView: true, reduced: false })).toBe(true);
    expect(shouldAnimate({ userPaused: true, inView: true, reduced: false })).toBe(false);
    expect(shouldAnimate({ userPaused: false, inView: false, reduced: false })).toBe(false);
    expect(shouldAnimate({ userPaused: false, inView: true, reduced: true })).toBe(false);
    expect(toggleLabel(true)).toBe("Play animation");
  });

  it("uses smaller glyphs on small screens", () => {
    expect(glyphFontSize(390)).toBeLessThan(glyphFontSize(1440));
  });
});

describe("terminal", () => {
  const facts = {
    name: "Pedro M. Dominguez",
    role: "Web, API & Android developer",
    city: "Oklahoma City",
    phone: "+14055550123",
    email: "hello@pedromdominguez.dev",
    services: [{ dir: "web-apps", id: "web-apps" }, { dir: "android-apps", id: "android" }],
  };

  it("lists services and navigates to sections", () => {
    expect(runCommand("ls services/", facts).lines).toEqual(["web-apps/  android-apps/"]);
    expect(runCommand("cd android-apps", facts).action).toEqual({ kind: "scroll", target: "#android" });
    expect(runCommand("  CD   Contact ", facts).action).toEqual({ kind: "scroll", target: "#contact" });
  });

  it("opens the phone and mail apps", () => {
    expect(runCommand("call", facts).action).toEqual({ kind: "open", href: "tel:+14055550123" });
    expect(runCommand("email", facts).action).toEqual({ kind: "open", href: "mailto:hello@pedromdominguez.dev" });
  });

  it("explains unknown commands", () => {
    const result = runCommand("rm -rf /", facts);
    expect(result.error).toBe(true);
    expect(result.lines[0]).toBe("bash: rm: command not found. Type help.");
    expect(runCommand("cd nowhere", facts).error).toBe(true);
  });

  it("supports help, whoami, theme, and clear", () => {
    expect(runCommand("help", facts).lines.length).toBeGreaterThan(3);
    expect(runCommand("whoami", facts).lines[0]).toContain("Pedro M. Dominguez");
    expect(runCommand("theme", facts).action).toEqual({ kind: "theme" });
    expect(runCommand("clear", facts).action).toEqual({ kind: "clear" });
  });

  it("caps input length", () => {
    expect(runCommand("x".repeat(200), facts).lines[0]?.length).toBeLessThan(80);
  });

  it("types text out character by character", () => {
    expect(typedText("ls services/", 0)).toBe("");
    expect(typedText("ls services/", 2.4)).toBe("ls");
    expect(typedText("ls services/", 99)).toBe("ls services/");
  });

  it("shows Oklahoma City time", () => {
    expect(okcClock(new Date("2026-07-04T17:30:00Z"))).toBe("OKC 12:30 PM CDT");
    expect(okcClock(new Date("2026-12-01T17:30:00Z"))).toBe("OKC 11:30 AM CST");
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
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("<x>")).toBe("dark");
    expect(otherTheme("dark")).toBe("light");
    expect(themeCookie("light", true)).toBe("theme=light; Path=/; Max-Age=31536000; SameSite=Lax; Secure");
  });
});
