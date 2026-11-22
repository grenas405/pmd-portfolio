import { animate, createAnimatable, stagger } from "animejs";
import { seededRandom } from "./random.js";

/**
 * @typedef {{ height: number, lean: number, opacity: number, sway: number }} BladeSpec
 * @typedef {{ cols: number, rows: number }} FieldSize
 */

const FIELD_SEED = 405; // Oklahoma City's area code.

/**
 * Describes every blade: height, resting lean, opacity (dimmer toward the horizon) and sway.
 * Pure: the same size always produces the same field.
 * @param {FieldSize} size
 * @param {number} [seed]
 * @returns {BladeSpec[]}
 */
export const bladeSpecs = ({ cols, rows }, seed = FIELD_SEED) => {
  const random = seededRandom(seed);
  return Array.from({ length: cols * rows }, (_, i) => {
    const depth = Math.floor(i / cols) / Math.max(rows - 1, 1); // 0 = horizon, 1 = front row
    return {
      height: 0.55 + random() * 0.65,
      lean: -10 + random() * 16,
      opacity: 0.3 + depth * 0.6 + random() * 0.1,
      sway: random(),
    };
  });
};

/**
 * Index of the blade at the front-centre of the field, where the intro starts.
 * @param {FieldSize} size
 */
export const frontCentre = ({ cols, rows }) => (rows - 1) * cols + Math.floor(cols / 2);

/**
 * Pointer position mapped to a gentle scene tilt in degrees. Pure.
 * @param {number} x @param {number} y @param {number} width @param {number} height
 * @returns {{ rotateX: number, rotateY: number }}
 */
export const tiltFor = (x, y, width, height) => ({
  rotateY: ((x / Math.max(width, 1)) - 0.5) * 8,
  rotateX: ((y / Math.max(height, 1)) - 0.5) * -3,
});

/**
 * Creates (but does not attach) the field's DOM. Uses createElement only, so it
 * is safe under the site's Trusted Types policy.
 * @param {Document} doc
 * @param {FieldSize} size
 * @param {BladeSpec[]} specs
 * @returns {{ scene: HTMLElement, blades: HTMLElement[] }}
 */
export const buildField = (doc, { cols, rows }, specs) => {
  const scene = doc.createElement("div");
  scene.className = "field__scene";
  const plane = doc.createElement("div");
  plane.className = "field__plane";
  plane.style.setProperty("--cols", String(cols));
  plane.style.setProperty("--rows", String(rows));

  const blades = specs.map((spec) => {
    const cell = doc.createElement("div");
    cell.className = "blade-cell";
    const blade = doc.createElement("div");
    blade.className = "blade";
    blade.style.setProperty("--h", spec.height.toFixed(3));
    blade.style.setProperty("--lean", `${spec.lean.toFixed(2)}deg`);
    blade.style.setProperty("--o", Math.min(spec.opacity, 1).toFixed(3));
    cell.append(blade);
    plane.append(cell);
    return blade;
  });

  scene.append(plane);
  return { scene, blades };
};

/**
 * The opening moment: blades rise from the front-centre outward, then the
 * wind starts. Returns nothing; animations register with the active anime scope.
 * @param {HTMLElement[]} blades
 * @param {BladeSpec[]} specs
 * @param {FieldSize} size
 */
export const animateField = (blades, specs, size) => {
  const grid = [size.cols, size.rows];
  /**
   * Per-blade value derived from that blade's spec.
   * @param {(spec: BladeSpec) => number} pick
   * @returns {import("animejs").FunctionValue<number>}
   */
  const perBlade = (pick) => (_target, index = 0) => {
    const spec = specs[index];
    return spec ? pick(spec) : 0;
  };

  // 1. Rise.
  animate(blades, {
    scaleY: { from: 0, to: 1 },
    duration: 1500,
    delay: stagger(38, { grid, from: frontCentre(size) }),
    ease: "out(4)",
  });

  // 2. Steady wind: every blade sways around its own resting lean, the wave rolling west to east.
  animate(blades, {
    rotate: {
      from: perBlade((spec) => spec.lean - 3 - spec.sway * 2),
      to: perBlade((spec) => spec.lean + 3 + spec.sway * 3),
    },
    // Blades catch a little more light as they bend, like wind moving over wheat.
    opacity: {
      from: perBlade((spec) => Math.min(spec.opacity, 1)),
      to: perBlade((spec) => Math.min(spec.opacity + 0.25, 1)),
    },
    duration: perBlade((spec) => 1900 + spec.sway * 900),
    delay: stagger(110, { grid, axis: "x", jitter: 160, seed: 7 }),
    ease: "inOutSine",
    loop: true,
    alternate: true,
  });

  // 3. Gusts: every few seconds a gust sweeps west to east and bends the blades over.
  // It drives skewX, a separate property from the sway's rotate, so the two combine
  // instead of one replacing the other — and a skew bends a blade the way grass bends.
  animate(blades, {
    skewX: [0, -12, 0],
    duration: 1800,
    delay: stagger(26, { grid, axis: "x", jitter: 90, seed: 11, start: 2200 }),
    loopDelay: 5200,
    ease: "inOutQuad",
    loop: true,
  });
};

/**
 * Tilts the scene toward the pointer. Returns a cleanup function.
 * @param {Window} win
 * @param {HTMLElement} scene
 * @returns {() => void}
 */
export const tiltWithPointer = (win, scene) => {
  const tilt = createAnimatable(scene, { rotateX: 900, rotateY: 900, ease: "out(3)" });
  /** @param {PointerEvent} event */
  const onMove = (event) => {
    const { rotateX, rotateY } = tiltFor(event.clientX, event.clientY, win.innerWidth, win.innerHeight);
    /** @type {any} */ (tilt).rotateX(rotateX);
    /** @type {any} */ (tilt).rotateY(rotateY);
  };
  win.addEventListener("pointermove", onMove, { passive: true });
  return () => win.removeEventListener("pointermove", onMove);
};
