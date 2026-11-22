/**
 * Composition root: finds elements, wires each feature, and isolates failures so
 * one broken feature never takes the others down. Feature logic lives in the
 * imported modules.
 */
import { createScope, engine } from "animejs";
import { animateField, bladeSpecs, buildField, tiltWithPointer } from "./motion/field.js";
import { gustThroughHeadline } from "./motion/hero.js";
import { fieldSize, readEnvironment } from "./motion/prefs.js";
import { wireCopyButtons } from "./ui/copy.js";
import { wireMenu } from "./ui/menu.js";
import { wireMotionControl } from "./ui/pause.js";
import { wireThemeToggle } from "./ui/theme.js";
import { createToast } from "./ui/toast.js";

/**
 * Runs one feature and logs (rather than rethrows) its failure.
 * @param {string} name
 * @param {() => void} feature
 */
const safely = (name, feature) => {
  try {
    feature();
  } catch (error) {
    console.error(`[${name}] failed to start:`, error);
  }
};

/**
 * Defers work until the browser is idle so the field never competes with first paint.
 * @param {Window} win
 * @param {() => void} task
 */
const whenIdle = (win, task) => {
  if ("requestIdleCallback" in win) win.requestIdleCallback(task, { timeout: 800 });
  else /** @type {Window} */ (win).setTimeout(task, 200);
};

/**
 * @param {Window} win
 * @param {HTMLElement} field
 */
const startField = (win, field) => {
  const env = readEnvironment(win);
  const size = fieldSize(env);
  const specs = bladeSpecs(size);
  const { scene, blades } = buildField(win.document, size, specs);
  field.append(scene);

  const words = /** @type {HTMLElement[]} */ ([...win.document.querySelectorAll(".hero__title .word")]);
  const toggle = win.document.querySelector("[data-motion-toggle]");

  // The scope reverts every animation when reduced motion turns on, leaving the
  // still field (each blade at its resting lean), and replays them when it turns off.
  if (toggle instanceof HTMLButtonElement) wireMotionControl(win, toggle, field, engine);
  createScope({ mediaQueries: { reduce: "(prefers-reduced-motion: reduce)" } }).add((scope) => {
    const reduce = Boolean(scope?.matches.reduce);
    if (toggle instanceof HTMLButtonElement) toggle.hidden = reduce;
    if (reduce) return;
    animateField(blades, specs, size);
    gustThroughHeadline(words);
    const stopTilt = env.finePointer ? tiltWithPointer(win, scene) : () => {};
    return () => stopTilt();
  });
};

const main = (/** @type {Window} */ win) => {
  const doc = win.document;
  const region = doc.querySelector("[data-toast]");
  const toast = region instanceof HTMLElement ? createToast(win, region) : () => {};

  safely("theme", () => {
    const button = doc.querySelector("[data-theme-toggle]");
    if (button instanceof HTMLElement) wireThemeToggle(win, button);
  });
  safely("menu", () => {
    const menu = doc.getElementById("site-menu");
    if (menu) wireMenu(menu);
  });
  safely("copy", () => wireCopyButtons(win, /** @type {NodeListOf<HTMLElement>} */ (doc.querySelectorAll("[data-copy]")), toast));

  const field = doc.querySelector("[data-field]");
  if (field instanceof HTMLElement) whenIdle(win, () => safely("field", () => startField(win, field)));
};

main(window);
