/**
 * An abstract Oklahoma City skyline: Devon Tower, a few downtown towers, and
 * the Skydance Bridge arch. Pure SVG, colored by CSS classes.
 */
import { html, type Html } from "../html";

/** [x, width, height] for the plain towers, on a 720-wide baseline at y=300. */
const TOWERS: ReadonlyArray<readonly [number, number, number]> = [
  [250, 34, 96],
  [288, 26, 132],
  [318, 40, 108],
  [362, 30, 150],
  [470, 38, 118],
  [512, 28, 88],
  [544, 44, 70],
];

/** @param fit how the drawing fills its box: "cover" crops to fill, "contain" keeps it whole. */
export const skyline = (className: string, fit: "cover" | "contain" = "cover"): Html => html`<svg class="${className}" viewBox="0 0 720 300" preserveAspectRatio="${fit === "cover" ? "xMidYMax slice" : "xMaxYMax meet"}" aria-hidden="true" focusable="false">
  <circle class="sky__sun" cx="560" cy="120" r="54"/>
  <g class="sky__clouds">
    <path class="sky__cloud sky__cloud--1" d="M80 90h90a18 18 0 0 0-18-18a26 26 0 0 0-48-6a20 20 0 0 0-24 24z"/>
    <path class="sky__cloud sky__cloud--2" d="M600 60h70a14 14 0 0 0-14-14a20 20 0 0 0-37-5a15 15 0 0 0-19 19z"/>
  </g>
  <g class="sky__far">
    ${TOWERS.map(([x, w, h]) => html`<rect x="${x}" y="${300 - h}" width="${w}" height="${h}"/>`)}
    <path d="M408 300V96q0-34 22-46q22 12 22 46v204z"/>
  </g>
  <g class="sky__bridge">
    <path class="sky__arch" d="M40 300Q130 150 220 300"/>
    <path class="sky__cables" d="M130 225L80 300M130 225L105 300M130 225L155 300M130 225L180 300"/>
    <path class="sky__deck" d="M20 296H240"/>
  </g>
</svg>`;
