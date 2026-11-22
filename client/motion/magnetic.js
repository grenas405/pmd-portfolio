import { createAnimatable } from "animejs";

/**
 * How far a magnetic button follows the pointer: a fraction of the distance
 * from its centre, capped. Pure.
 * @param {number} x @param {number} y @param {{ left: number, top: number, width: number, height: number }} rect
 * @param {number} strength @param {number} max
 */
export const magneticOffset = (x, y, rect, strength, max) => {
  const dx = (x - (rect.left + rect.width / 2)) * strength;
  const dy = (y - (rect.top + rect.height / 2)) * strength;
  return { x: Math.max(-max, Math.min(max, dx)), y: Math.max(-max, Math.min(max, dy)) };
};

/**
 * Primary calls to action lean toward the pointer (fine pointers only).
 * @param {Iterable<HTMLElement>} buttons
 */
export const wireMagnetic = (buttons) => {
  for (const button of buttons) {
    const follow = createAnimatable(button, { x: 450, y: 450, ease: "out(3)" });
    button.addEventListener("pointermove", (event) => {
      const offset = magneticOffset(event.clientX, event.clientY, button.getBoundingClientRect(), 0.3, 10);
      /** @type {any} */ (follow).x(offset.x);
      /** @type {any} */ (follow).y(offset.y);
    });
    button.addEventListener("pointerleave", () => {
      /** @type {any} */ (follow).x(0);
      /** @type {any} */ (follow).y(0);
    });
  }
};
