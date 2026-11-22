/** Canvas drawing for the prairie. The only module here that touches pixels. */
import { GLYPHS, SHADES, SHADE_COUNT } from "./frame.js";
import { toCss } from "./palette.js";

const PAD = 4; // room around each atlas glyph for its glow

/**
 * @typedef {{ canvas: HTMLCanvasElement, cellWidth: number, cellHeight: number, dpr: number }} Atlas
 * @typedef {import("./frame.js").Layout} Layout
 * @typedef {import("./frame.js").Frame} Frame
 */

/**
 * Pre-renders every glyph in every shade once, with its glow baked in, so a
 * frame is just a few thousand drawImage copies.
 * @param {Document} doc
 * @param {{ fontSize: number, cellWidth: number, cellHeight: number, dpr: number, family: string }} metrics
 * @param {string[]} palette
 * @returns {Atlas}
 */
export const buildAtlas = (doc, metrics, palette) => {
  const { dpr, cellWidth, cellHeight } = metrics;
  const w = (cellWidth + PAD * 2) * dpr;
  const h = (cellHeight + PAD * 2) * dpr;
  const canvas = doc.createElement("canvas");
  canvas.width = Math.ceil(w * GLYPHS.length);
  canvas.height = Math.ceil(h * SHADE_COUNT);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable for the glyph atlas");
  ctx.font = `${metrics.fontSize * dpr}px ${metrics.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let shade = 1; shade < SHADE_COUNT; shade += 1) {
    const color = palette[shade] ?? "transparent";
    const glows = shade >= SHADES.field.start + 5 || (shade >= SHADES.sun.start && shade < SHADES.mill.start);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = glows ? 6 * dpr : 0;
    for (let glyph = 1; glyph < GLYPHS.length; glyph += 1) {
      ctx.fillText(GLYPHS[glyph] ?? "", glyph * w + w / 2, shade * h + h / 2);
    }
  }
  return { canvas, cellWidth, cellHeight, dpr };
};

/**
 * The static backdrop: a perspective grid receding to the horizon.
 * @param {Document} doc
 * @param {Layout} layout
 * @param {number} dpr
 * @param {import("./palette.js").Rgba} gridColor
 */
export const buildBackdrop = (doc, layout, dpr, gridColor) => {
  const canvas = doc.createElement("canvas");
  canvas.width = Math.ceil(layout.cols * layout.cellWidth * dpr);
  canvas.height = Math.ceil(layout.rows * layout.cellHeight * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const horizonY = (layout.horizon + 0.5) * layout.cellHeight * dpr;
  const vanishX = (layout.sun ? layout.sunCol : layout.cols / 2) * layout.cellWidth * dpr;
  const depth = canvas.height - horizonY;
  ctx.lineWidth = dpr;
  for (let k = 1; k <= 14; k += 1) {
    const y = horizonY + depth * (k / 14) ** 1.9;
    ctx.strokeStyle = toCss([gridColor[0], gridColor[1], gridColor[2], gridColor[3] * (0.25 + (k / 14) * 0.75)]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  const fade = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
  fade.addColorStop(0, toCss([gridColor[0], gridColor[1], gridColor[2], 0]));
  fade.addColorStop(1, toCss(gridColor));
  ctx.strokeStyle = fade;
  for (let k = -24; k <= 24; k += 1) {
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(vanishX + k * canvas.width * 0.09, canvas.height);
    ctx.stroke();
  }
  return canvas;
};

/**
 * Draws one frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Atlas} atlas
 * @param {HTMLCanvasElement} backdrop
 * @param {Layout} layout
 * @param {Frame} frame
 * @param {{ col0: number, row0: number, col1: number, row1: number } | null} [hidden] cells covered by opaque UI
 */
export const drawFrame = (ctx, atlas, backdrop, layout, frame, hidden = null) => {
  const { dpr, cellWidth, cellHeight } = atlas;
  const w = (cellWidth + PAD * 2) * dpr;
  const h = (cellHeight + PAD * 2) * dpr;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(backdrop, 0, 0);
  const { cols } = layout;
  const total = frame.glyph.length;
  for (let i = 0; i < total; i += 1) {
    const glyph = frame.glyph[i] ?? 0;
    if (glyph === 0) continue;
    if (hidden) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      if (col >= hidden.col0 && col <= hidden.col1 && row >= hidden.row0 && row <= hidden.row1) continue;
    }
    const shade = frame.shade[i] ?? 0;
    const x = ((i % cols) * cellWidth - PAD) * dpr;
    const y = (Math.floor(i / cols) * cellHeight - PAD) * dpr;
    ctx.drawImage(atlas.canvas, glyph * w, shade * h, w, h, x, y, w, h);
  }
};
