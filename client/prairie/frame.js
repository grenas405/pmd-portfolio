/**
 * Pure frame math for the glyph prairie: given the grid layout, the animated
 * parameters and a time, describe every cell as a glyph and a shade. No DOM,
 * no canvas, no randomness beyond a deterministic hash, so it is unit-testable.
 */

/** Every character the renderer can draw. Index 0 is "empty". */
export const GLYPHS = [" ", ".", ",", "'", "`", ":", ";", "i", "l", "|", "/", "\\", "-", "=", "+", "*", "#", "%", "@", "x", "X", "0", "1", "Y", "<", ">", "o", "_"];

/** Shade groups. Each group is a run of indices into the palette (see atlas.js). */
export const SHADES = Object.freeze({
  field: { start: 1, count: 8 }, // dim teal at the horizon → wheat → bright gust sheen
  sun: { start: 9, count: 6 }, // red dirt → orange → gold
  mill: { start: 15, count: 1 }, // windmill silhouette
  noise: { start: 16, count: 1 }, // "decrypting" glyphs while the field boots
});
export const SHADE_COUNT = 17;

const G = Object.fromEntries(GLYPHS.map((glyph, i) => [glyph, i]));
/** @param {string} glyph */
const g = (glyph) => G[glyph] ?? 0;

const FAR = [".", ",", "'", "`", ".", ","].map(g);
const NOISE = ["0", "1", "#", "%", "x", "+", "*"].map(g);
const SUN_RAMP = [".", ":", "-", "=", "+", "*", "#", "%", "@"].map(g);

/**
 * @typedef {{ cols: number, rows: number, cellWidth: number, cellHeight: number, horizon: number,
 *   sun: boolean, windmill: boolean, sunCol: number }} Layout
 * @typedef {{ gustX: number, gustStrength: number, boot: number, pointerCol: number, pointerRow: number,
 *   pointerStrength: number, intensity: number }} Params
 * @typedef {{ glyph: Uint8Array, shade: Uint8Array }} Frame
 */

/**
 * Builds the cell grid for a canvas size. Pure.
 * @param {number} width CSS pixels
 * @param {number} height CSS pixels
 * @param {{ cellWidth: number, cellHeight: number, horizon: number, sun: boolean, windmill: boolean }} options
 * @returns {Layout}
 */
export const createLayout = (width, height, options) => {
  const cols = Math.max(1, Math.ceil(width / options.cellWidth));
  const rows = Math.max(1, Math.ceil(height / options.cellHeight));
  return {
    cols,
    rows,
    cellWidth: options.cellWidth,
    cellHeight: options.cellHeight,
    horizon: Math.round(rows * options.horizon),
    sun: options.sun,
    windmill: options.windmill,
    sunCol: Math.round(cols * (width < 720 ? 0.72 : 0.86)),
  };
};

/**
 * The cells fully covered by an element's box (with a one-cell margin kept
 * visible at the edges). Pure.
 * @param {Layout} layout
 * @param {{ left: number, top: number, right: number, bottom: number }} box relative to the canvas, CSS px
 * @returns {{ col0: number, row0: number, col1: number, row1: number } | null}
 */
export const coveredCells = (layout, box) => {
  const col0 = Math.ceil(box.left / layout.cellWidth) + 1;
  const row0 = Math.ceil(box.top / layout.cellHeight) + 1;
  const col1 = Math.floor(box.right / layout.cellWidth) - 2;
  const row1 = Math.floor(box.bottom / layout.cellHeight) - 2;
  return col1 > col0 && row1 > row0 ? { col0, row0, col1, row1 } : null;
};

/**
 * Deterministic hash of a cell to [0, 1).
 * @param {number} col @param {number} row @param {number} [seed]
 */
export const cellNoise = (col, row, seed = 405) => {
  let h = Math.imul(col, 374761393) + Math.imul(row, 668265263) + Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

/** @param {number} value @param {number} min @param {number} max */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * How far a blade leans: its own resting lean, a rolling wave, and the gust. Pure.
 * @param {number} col @param {number} row @param {number} depth 0 = horizon, 1 = front
 * @param {Layout} layout @param {Params} params @param {number} t seconds
 */
export const bladeLean = (col, row, depth, layout, params, t) => {
  const rest = (cellNoise(col, row, 7) - 0.5) * 0.7;
  const wave = Math.sin(col * 0.16 - t * 1.5 + row * 0.33) * 0.5 * (0.35 + 0.65 * depth);
  const distance = col / layout.cols - params.gustX;
  const gust = params.gustStrength * Math.exp(-(distance * distance) / 0.01);
  return { lean: rest + wave + gust * 1.1, gust };
};

/**
 * Picks the glyph for a blade from its depth and lean. Pure.
 * @param {number} depth @param {number} lean @param {number} noise
 */
export const bladeGlyph = (depth, lean, noise) => {
  if (depth < 0.18) return FAR[Math.floor(noise * FAR.length)] ?? g(".");
  if (depth < 0.5) {
    if (lean < -0.4) return g("\\");
    if (lean > 0.4) return g("/");
    return noise < 0.5 ? g("|") : noise < 0.8 ? g("i") : g(";");
  }
  if (lean < -0.3) return g("\\");
  if (lean > 0.3) return g("/");
  return noise > 0.94 ? g("Y") : g("|");
};

/**
 * The windmill: lattice tower, a wheel of turning vanes and a tail. Pure.
 * @param {Layout} layout @param {number} angle radians
 * @returns {Array<[number, number]>} pairs of [cell index, glyph]
 */
export const windmillCells = (layout, angle) => {
  const { cols, rows, horizon, sunCol, cellWidth, cellHeight } = layout;
  const aspect = cellWidth / cellHeight;
  const height = Math.max(6, Math.round(rows * 0.2));
  const base = Math.min(rows - 1, horizon + 2);
  const hubRow = base - height;
  /** @type {Array<[number, number]>} */
  const cells = [];
  /** @param {number} c @param {number} r @param {number} glyph */
  const put = (c, r, glyph) => {
    const col = Math.round(c);
    const row = Math.round(r);
    if (col >= 0 && col < cols && row >= 0 && row < rows) cells.push([row * cols + col, glyph]);
  };

  // Tower: legs spread toward the ground, braced every few rows.
  for (let r = hubRow + 1; r <= base; r += 1) {
    const spread = 0.6 + ((r - hubRow) / height) * 2.6;
    put(sunCol - spread, r, g("/"));
    put(sunCol + spread, r, g("\\"));
    if ((r - hubRow) % 3 === 0) put(sunCol, r, g("X"));
  }

  // Wheel: 12 vanes; the glyph follows each vane's direction.
  const radius = Math.max(4, Math.round((height * 0.36) / aspect));
  for (let k = 0; k < 12; k += 1) {
    const a = angle + (k * Math.PI * 2) / 12;
    const slope = ((a % Math.PI) + Math.PI) % Math.PI; // direction, 0..π
    const glyph =
      slope < Math.PI / 8 || slope > (7 * Math.PI) / 8 ? g("-") : slope < (3 * Math.PI) / 8 ? g("\\") : slope < (5 * Math.PI) / 8 ? g("|") : g("/");
    for (let rho = 1.5; rho <= radius; rho += 0.75) put(sunCol + Math.cos(a) * rho, hubRow + Math.sin(a) * rho * aspect, glyph);
  }
  put(sunCol, hubRow, g("o"));

  // Tail vane, pointing away from the wind.
  for (let i = 1; i <= Math.round(radius * 0.9); i += 1) put(sunCol - i, hubRow, g("="));
  put(sunCol - Math.round(radius * 0.9) - 1, hubRow, g("<"));
  return cells;
};

/**
 * Describes one frame of the prairie. Pure: same inputs, same frame.
 * @param {Layout} layout @param {Params} params @param {number} t seconds
 * @returns {Frame}
 */
export const fieldFrame = (layout, params, t) => {
  const { cols, rows, horizon } = layout;
  const glyph = new Uint8Array(cols * rows);
  const shade = new Uint8Array(cols * rows);
  const fieldRows = Math.max(1, rows - horizon);
  const sunRadiusX = Math.max(7, cols * 0.1);
  const sunRadiusY = (sunRadiusX * layout.cellWidth) / layout.cellHeight;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const i = row * cols + col;

      // Setting sun above the horizon, with the banded gaps of a heat haze.
      if (layout.sun && row <= horizon) {
        const dx = (col - layout.sunCol) / sunRadiusX;
        const dy = (row - horizon) / sunRadiusY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const band = horizon - row;
        const gap = band > 0 && band < 5 && band % 2 === 0;
        if (distance < 1 && !gap) {
          const level = clamp(Math.floor((1 - distance) * 2.2 * SHADES.sun.count), 0, SHADES.sun.count - 1);
          glyph[i] = SUN_RAMP[clamp(Math.floor((1 - distance) * 2 * SUN_RAMP.length), 0, SUN_RAMP.length - 1)] ?? g(".");
          shade[i] = SHADES.sun.start + level;
        }
        continue;
      }
      if (row <= horizon) continue;

      // The field: denser and brighter toward the viewer.
      const depth = (row - horizon) / fieldRows;
      const noise = cellNoise(col, row);
      if (cellNoise(col, row, 99) > 0.45 + 0.5 * depth) continue;

      const reveal = (row - horizon) / fieldRows; // the field boots from the horizon forward
      if (params.boot < reveal) continue;
      if (params.boot < reveal + 0.12) {
        glyph[i] = NOISE[Math.floor(noise * NOISE.length)] ?? g("0");
        shade[i] = SHADES.noise.start;
        continue;
      }

      const { lean, gust } = bladeLean(col, row, depth, layout, params, t);
      const pd = Math.hypot(col - params.pointerCol, (row - params.pointerRow) * 2);
      const glow = params.pointerStrength * Math.max(0, 1 - pd / 10);
      const level = clamp(Math.round((1.4 + depth * 3.6 + noise * 1.4 + gust * 3 + glow * 3) * params.intensity), 0, SHADES.field.count - 1);
      glyph[i] = bladeGlyph(depth, lean, noise);
      shade[i] = SHADES.field.start + level;
    }
  }

  if (layout.windmill) {
    for (const [i, millGlyph] of windmillCells(layout, t * 0.9)) {
      glyph[i] = millGlyph;
      shade[i] = SHADES.mill.start;
    }
  }
  return { glyph, shade };
};
