/**
 * Composition root: finds elements, wires each feature, and isolates failures so
 * one broken feature never takes the others down. Feature logic lives in the
 * imported modules.
 */
import { drawIcons, drawOnScroll, lightSteps } from "./motion/draw.js";
import { wireMagnetic } from "./motion/magnetic.js";
import { revealTitles } from "./motion/reveal.js";
import { wireMockups } from "./motion/tilt.js";
import { startPrairie, VARIANTS } from "./prairie/scene.js";
import { bootTerminal, showTerminal } from "./terminal/boot.js";
import { wireClock, wirePrompt } from "./terminal/prompt.js";
import { wireCopyButtons } from "./ui/copy.js";
import { wireMenu } from "./ui/menu.js";
import { wireMotionControl } from "./ui/pause.js";
import { wireScrollspy } from "./ui/scrollspy.js";
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
 * @template {Element} T
 * @param {ParentNode} root @param {string} selector
 * @returns {T[]}
 */
const all = (root, selector) => /** @type {T[]} */ ([...root.querySelectorAll(selector)]);

const main = (/** @type {Window} */ win) => {
  const doc = win.document;
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = win.matchMedia("(pointer: fine)").matches;
  const region = doc.querySelector("[data-toast]");
  const toast = region instanceof HTMLElement ? createToast(win, region) : () => {};
  const themeButton = doc.querySelector("[data-theme-toggle]");

  safely("theme", () => {
    if (themeButton instanceof HTMLElement) wireThemeToggle(win, themeButton);
  });
  safely("menu", () => {
    const menu = doc.getElementById("site-menu");
    if (menu) wireMenu(menu);
  });
  safely("copy", () => wireCopyButtons(win, all(doc, "[data-copy]"), toast));
  safely("scrollspy", () => wireScrollspy(doc, all(doc, "[data-spy]")));

  // Hero terminal: boot sequence, prompt, clock.
  const term = doc.querySelector("[data-term]");
  if (term instanceof HTMLElement) {
    safely("boot", () => {
      try {
        if (reduced) showTerminal(term);
        else bootTerminal(term);
      } catch (error) {
        showTerminal(term);
        throw error;
      }
    });
    safely("prompt", () => {
      const form = doc.querySelector("[data-term-form]");
      const log = doc.querySelector("[data-term-log]");
      if (form instanceof HTMLFormElement && log instanceof HTMLElement)
        wirePrompt(win, form, log, () => themeButton instanceof HTMLElement && themeButton.click());
    });
    safely("clock", () => {
      const clock = doc.querySelector("[data-clock]");
      if (clock instanceof HTMLElement) wireClock(win, clock);
    });
  }

  // Prairie canvases (hero and closing band), all sharing one pause control.
  /** @type {Array<{ setUserPaused: (paused: boolean) => void }>} */
  const scenes = [];
  for (const canvas of all(doc, "canvas[data-prairie]")) {
    const options = VARIANTS[/** @type {HTMLCanvasElement} */ (canvas).dataset.prairie ?? ""];
    if (!options) continue;
    const cover = canvas.parentElement?.querySelector("[data-term]");
    startPrairie(win, /** @type {HTMLCanvasElement} */ (canvas), options, cover instanceof HTMLElement ? cover : null)
      .then((scene) => scenes.push(scene))
      .catch((error) => console.error("[prairie] failed to start:", error));
  }
  safely("pause", () => {
    const button = doc.querySelector("[data-motion-toggle]");
    if (button instanceof HTMLButtonElement && !reduced) wireMotionControl(button, () => scenes);
  });

  // Scroll and pointer choreography. With reduced motion everything stays in its final, static state.
  if (reduced) return;
  safely("reveal", () => revealTitles(all(doc, "[data-reveal-title]")));
  safely("icons", () => drawIcons(all(doc, ".trust .icon, .tile__icon .icon, .promise .icon")));
  safely("process", () => {
    const steps = doc.querySelector("[data-steps]");
    if (!steps) return;
    drawOnScroll(steps, all(steps, "[data-draw]"));
    lightSteps(steps, all(steps, ".step"));
  });
  safely("map", () => {
    const map = doc.querySelector("[data-map]");
    if (map) drawOnScroll(map, all(map, ".metro-map__road"));
  });
  safely("mockups", () => wireMockups(all(doc, "[data-tilt]"), finePointer));
  safely("magnetic", () => {
    if (finePointer) wireMagnetic(all(doc, "[data-magnetic]"));
  });
};

main(window);
