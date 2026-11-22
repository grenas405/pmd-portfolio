/**
 * Colors for the prairie, read from CSS tokens so the stylesheet stays the
 * single source of truth (and light/dark both work).
 */
import { SHADE_COUNT, SHADES } from "./frame.js";

/** @typedef {[number, number, number, number]} Rgba */

/**
 * Parses "rgb(r, g, b)" / "rgba(r, g, b, a)" / "rgb(r g b / a)". Pure.
 * @param {string} text
 * @returns {Rgba}
 */
export const parseRgb = (text) => {
  const parts = text.match(/[\d.]+%?/g)?.map((part) => (part.endsWith("%") ? Number.parseFloat(part) / 100 : Number(part))) ?? [];
  const [r = 0, g = 0, b = 0, a = 1] = parts;
  return [r, g, b, a];
};

/** @param {Rgba} from @param {Rgba} to @param {number} t @returns {Rgba} */
export const mix = (from, to, t) => /** @type {Rgba} */ (from.map((value, i) => value + ((to[i] ?? value) - value) * t));

/** @param {Rgba} color */
export const toCss = ([r, g, b, a]) => `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${a.toFixed(3)})`;

/**
 * @typedef {{ fieldLow: Rgba, fieldMid: Rgba, fieldHigh: Rgba, sunLow: Rgba, sunHigh: Rgba, mill: Rgba, noise: Rgba, grid: Rgba }} Tokens
 */

/**
 * One CSS color per shade index. Pure.
 * @param {Tokens} tokens
 * @returns {string[]}
 */
export const buildPalette = (tokens) => {
  /** @type {string[]} */
  const palette = Array.from({ length: SHADE_COUNT }, () => "transparent");
  for (let k = 0; k < SHADES.field.count; k += 1) {
    const t = k / (SHADES.field.count - 1);
    const color = t < 0.6 ? mix(tokens.fieldLow, tokens.fieldMid, t / 0.6) : mix(tokens.fieldMid, tokens.fieldHigh, (t - 0.6) / 0.4);
    palette[SHADES.field.start + k] = toCss([color[0], color[1], color[2], 0.32 + 0.68 * t]);
  }
  for (let k = 0; k < SHADES.sun.count; k += 1) {
    palette[SHADES.sun.start + k] = toCss(mix(tokens.sunLow, tokens.sunHigh, k / (SHADES.sun.count - 1)));
  }
  palette[SHADES.mill.start] = toCss(tokens.mill);
  palette[SHADES.noise.start] = toCss(tokens.noise);
  return palette;
};

const TOKEN_NAMES = /** @type {const} */ ({
  fieldLow: "--glyph-field-low",
  fieldMid: "--glyph-field-mid",
  fieldHigh: "--glyph-field-high",
  sunLow: "--glyph-sun-low",
  sunHigh: "--glyph-sun-high",
  mill: "--glyph-mill",
  noise: "--glyph-noise",
  grid: "--glyph-grid",
});

/**
 * Resolves the color tokens (including light-dark()) by letting the browser
 * compute them on the canvas element.
 * @param {HTMLElement} element
 * @returns {Tokens}
 */
export const readTokens = (element) => {
  const previous = element.style.color;
  const entries = Object.entries(TOKEN_NAMES).map(([key, name]) => {
    element.style.color = `var(${name})`;
    return [key, parseRgb(getComputedStyle(element).color)];
  });
  element.style.color = previous;
  return /** @type {Tokens} */ (Object.fromEntries(entries));
};
