/**
 * Runs one prairie canvas. anime.js animates a small parameter object (gusts,
 * boot progress, pointer glow); a 30 fps anime timer draws a frame from it.
 * Nothing per frame touches the DOM except the single canvas.
 */
import { animate, createAnimatable, createTimer } from "animejs";
import { coveredCells, createLayout, fieldFrame } from "./frame.js";
import { buildPalette, readTokens } from "./palette.js";
import { buildAtlas, buildBackdrop, drawFrame } from "./render.js";

const FONT_FAMILY = '"JetBrains Mono", ui-monospace, monospace';

/** Boot progress at which every row has finished "decrypting" (see fieldFrame). */
export const BOOTED = 1.2;

/**
 * @typedef {{ horizon: number, sun: boolean, windmill: boolean, intensity: number, boot: boolean, pointer: boolean }} SceneOptions
 * @typedef {{ setUserPaused: (paused: boolean) => void }} SceneControl
 */

/** @type {Record<string, SceneOptions>} */
export const VARIANTS = {
  hero: { horizon: 0.6, sun: true, windmill: true, intensity: 1, boot: true, pointer: true },
  band: { horizon: 0.42, sun: false, windmill: false, intensity: 0.6, boot: false, pointer: false },
};

/** Font size for the glyph grid: smaller cells on small screens. Pure. */
export const glyphFontSize = (/** @type {number} */ width) => (width < 640 ? 11 : 13);

/** Whether the scene should animate right now. Pure. */
export const shouldAnimate = (/** @type {{ userPaused: boolean, inView: boolean, reduced: boolean }} */ state) =>
  !state.userPaused && state.inView && !state.reduced;

/**
 * @param {Window} win
 * @param {HTMLCanvasElement} canvas
 * @param {SceneOptions} options
 * @param {HTMLElement | null} [cover] opaque element over the canvas; cells under it are not drawn
 * @returns {Promise<SceneControl>}
 */
export const startPrairie = async (win, canvas, options, cover = null) => {
  const doc = win.document;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  await doc.fonts.load(`13px ${FONT_FAMILY}`);

  const reducedQuery = win.matchMedia("(prefers-reduced-motion: reduce)");
  const params = { gustX: -0.3, gustStrength: 0, boot: options.boot ? 0 : BOOTED, pointerCol: -99, pointerRow: -99, pointerStrength: 0, intensity: options.intensity };
  let state = { userPaused: false, inView: false, reduced: reducedQuery.matches };
  let time = 4; // seconds; also the still frame shown with reduced motion

  /** @type {{ layout: import("./frame.js").Layout, atlas: import("./render.js").Atlas, backdrop: HTMLCanvasElement, hidden: ReturnType<typeof coveredCells> } | null} */
  let surface = null;

  const build = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    const dpr = Math.min(win.devicePixelRatio || 1, 2);
    const fontSize = glyphFontSize(win.innerWidth);
    ctx.font = `${fontSize}px ${FONT_FAMILY}`;
    const cellWidth = Math.max(5, Math.round(ctx.measureText("M").width * 10) / 10);
    const cellHeight = Math.round(fontSize * 1.45);
    const layout = createLayout(width, height, { cellWidth, cellHeight, horizon: options.horizon, sun: options.sun, windmill: options.windmill });
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    const tokens = readTokens(canvas);
    const canvasBox = canvas.getBoundingClientRect();
    const coverBox = cover?.getBoundingClientRect();
    surface = {
      layout,
      hidden: coverBox
        ? coveredCells(layout, { left: coverBox.left - canvasBox.left, top: coverBox.top - canvasBox.top, right: coverBox.right - canvasBox.left, bottom: coverBox.bottom - canvasBox.top })
        : null,
      atlas: buildAtlas(doc, { fontSize, cellWidth, cellHeight, dpr, family: FONT_FAMILY }, buildPalette(tokens)),
      backdrop: buildBackdrop(doc, layout, dpr, tokens.grid),
    };
  };

  const draw = () => {
    if (surface) drawFrame(ctx, surface.atlas, surface.backdrop, surface.layout, fieldFrame(surface.layout, params, time), surface.hidden);
  };

  // Motion: the frame clock, rolling gusts, the boot sequence, and the pointer glow.
  const clock = createTimer({ frameRate: 30, autoplay: false, onUpdate: (self) => { time = 4 + self.currentTime / 1000; draw(); } });
  const gustPosition = animate(params, { gustX: [-0.25, 1.25], duration: 4200, loopDelay: 2600, ease: "inOutSine", loop: true, autoplay: false });
  const gustPower = animate(params, { gustStrength: [0, 0.95, 0], duration: 4200, loopDelay: 2600, ease: "inOutQuad", loop: true, autoplay: false });
  const boot = options.boot ? animate(params, { boot: [0, BOOTED], duration: 2400, delay: 300, ease: "out(2)", autoplay: false }) : null;
  const tickables = [clock, gustPosition, gustPower, ...(boot ? [boot] : [])];

  const apply = () => {
    if (shouldAnimate(state)) {
      for (const tickable of tickables) tickable.play();
    } else {
      for (const tickable of tickables) tickable.pause();
      if (state.reduced) {
        params.boot = BOOTED;
        params.gustStrength = 0;
      }
      draw();
    }
  };

  /** @param {Partial<typeof state>} change */
  const update = (change) => {
    state = { ...state, ...change };
    apply();
  };

  if (options.pointer && win.matchMedia("(pointer: fine)").matches) {
    const glow = createAnimatable(params, { pointerCol: 250, pointerRow: 250, pointerStrength: 500 });
    win.addEventListener(
      "pointermove",
      (event) => {
        if (!surface) return;
        const rect = canvas.getBoundingClientRect();
        const inside = event.clientY >= rect.top && event.clientY <= rect.bottom;
        /** @type {any} */ (glow).pointerCol((event.clientX - rect.left) / surface.layout.cellWidth);
        /** @type {any} */ (glow).pointerRow((event.clientY - rect.top) / surface.layout.cellHeight);
        /** @type {any} */ (glow).pointerStrength(inside ? 1 : 0);
      },
      { passive: true },
    );
  }

  /** @type {number | undefined} */
  let resizeTimer;
  new ResizeObserver(() => {
    win.clearTimeout(resizeTimer);
    resizeTimer = win.setTimeout(() => {
      build();
      draw();
    }, 120);
  }).observe(canvas);

  // Rebuild colors when the theme changes.
  new MutationObserver(() => {
    build();
    draw();
  }).observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (entry) update({ inView: entry.isIntersecting });
  }).observe(canvas);

  reducedQuery.addEventListener("change", (event) => update({ reduced: event.matches }));

  build();
  draw();
  return { setUserPaused: (paused) => update({ userPaused: paused }) };
};
