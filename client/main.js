/**
 * Composition root: finds elements, wires each feature, and isolates failures so
 * one broken feature never takes the others down. Feature logic lives in the
 * imported modules.
 */
import { drawIcons, drawOnScroll, lightSteps } from "./motion/draw.js";
import { wireMagnetic } from "./motion/magnetic.js";
import { revealTitles } from "./motion/reveal.js";
import { wireMockups } from "./motion/tilt.js";
import { showStillStreet, startStreet } from "./street/scene.js";
import { wireCallbar } from "./ui/callbar.js";
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

  // Hero: Main Street opens for business, with its own pause control.
  /** @type {Array<{ setUserPaused: (paused: boolean) => void }>} */
  const scenes = [];
  const street = doc.querySelector("[data-street]");
  if (street instanceof HTMLElement) {
    safely("street", () => {
      try {
        if (reduced) showStillStreet(street);
        else scenes.push(startStreet(win, street));
      } catch (error) {
        showStillStreet(street);
        throw error;
      }
    });
  }
  safely("pause", () => {
    const button = doc.querySelector("[data-motion-toggle]");
    if (button instanceof HTMLButtonElement && !reduced && scenes.length > 0) wireMotionControl(button, () => scenes);
  });

  safely("callbar", () => {
    const bar = doc.querySelector("[data-callbar]");
    const anchors = all(doc, "[data-hero-actions], #contact, .error-page__actions");
    if (bar instanceof HTMLElement) wireCallbar(bar, anchors);
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
