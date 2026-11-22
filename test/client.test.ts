import { describe, expect, it } from "vitest";
import { bladeSpecs, frontCentre, tiltFor } from "../client/motion/field.js";
import { fieldSize } from "../client/motion/prefs.js";
import { seededRandom } from "../client/motion/random.js";
import { shouldRun, toggleLabel } from "../client/ui/pause.js";
import { otherTheme, parseTheme, themeCookie } from "../client/ui/theme.js";

const env = { reduceMotion: false, saveData: false, finePointer: true, width: 1440 };

describe("field", () => {
  it("is deterministic for a given seed", () => {
    expect(bladeSpecs({ cols: 4, rows: 3 }, 1)).toEqual(bladeSpecs({ cols: 4, rows: 3 }, 1));
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });

  it("makes one spec per blade, dimmer toward the horizon", () => {
    const specs = bladeSpecs({ cols: 5, rows: 4 });
    expect(specs).toHaveLength(20);
    const average = (row: number) => specs.slice(row * 5, row * 5 + 5).reduce((sum, s) => sum + s.opacity, 0) / 5;
    expect(average(0)).toBeLessThan(average(3));
  });

  it("starts the intro from the front-centre blade", () => {
    expect(frontCentre({ cols: 10, rows: 4 })).toBe(35);
  });

  it("maps the pointer to a small tilt", () => {
    expect(tiltFor(500, 500, 1000, 1000)).toEqual({ rotateX: -0, rotateY: 0 });
    expect(tiltFor(1000, 0, 1000, 1000).rotateY).toBe(4);
  });

  it("scales the blade count to the screen and connection", () => {
    expect(fieldSize(env)).toEqual({ cols: 44, rows: 18 });
    expect(fieldSize({ ...env, width: 390 })).toEqual({ cols: 22, rows: 12 });
    expect(fieldSize({ ...env, saveData: true })).toEqual({ cols: 18, rows: 10 });
  });
});

describe("motion control", () => {
  it("runs only when unpaused and in view", () => {
    expect(shouldRun({ userPaused: false, inView: true })).toBe(true);
    expect(shouldRun({ userPaused: true, inView: true })).toBe(false);
    expect(shouldRun({ userPaused: false, inView: false })).toBe(false);
    expect(toggleLabel(true)).toBe("Play animation");
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
