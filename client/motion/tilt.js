import { animate, createAnimatable, onScroll } from "animejs";

/**
 * Pointer position within a box mapped to a tilt in degrees (max ±range). Pure.
 * @param {number} x @param {number} y @param {{ left: number, top: number, width: number, height: number }} rect @param {number} range
 */
export const tiltFor = (x, y, rect, range) => {
  const nx = (x - rect.left) / Math.max(rect.width, 1) - 0.5;
  const ny = (y - rect.top) / Math.max(rect.height, 1) - 0.5;
  return { rotateY: Math.max(-range, Math.min(range, nx * range * 2)), rotateX: Math.max(-range, Math.min(range, -ny * range * 2)) };
};

/**
 * Mockups tilt toward the pointer and drift slightly as the page scrolls.
 * @param {Iterable<HTMLElement>} mockups
 * @param {boolean} finePointer
 */
export const wireMockups = (mockups, finePointer) => {
  for (const mockup of mockups) {
    animate(mockup, { y: ["2.5rem", "-2.5rem"], ease: "linear", autoplay: onScroll({ target: mockup, enter: "end start", leave: "start end", sync: 0.3 }) });
    if (!finePointer) continue;
    const area = mockup.parentElement ?? mockup;
    const tilt = createAnimatable(mockup, { rotateX: 500, rotateY: 500, ease: "out(3)" });
    area.addEventListener("pointermove", (event) => {
      const { rotateX, rotateY } = tiltFor(event.clientX, event.clientY, area.getBoundingClientRect(), 9);
      /** @type {any} */ (tilt).rotateX(rotateX);
      /** @type {any} */ (tilt).rotateY(rotateY);
    });
    area.addEventListener("pointerleave", () => {
      /** @type {any} */ (tilt).rotateX(0);
      /** @type {any} */ (tilt).rotateY(0);
    });
  }
};
