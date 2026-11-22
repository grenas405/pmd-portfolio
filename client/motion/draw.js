import { animate, createDrawable, onScroll, stagger } from "animejs";
import { onceInView } from "./reveal.js";

/**
 * Line icons draw themselves when they come into view.
 * @param {Iterable<SVGSVGElement>} icons
 */
export const drawIcons = (icons) => {
  for (const svg of icons) {
    const strokes = createDrawable(svg.querySelectorAll("path, rect, circle"));
    onceInView(svg, () => {
      animate(strokes, { draw: ["0 0", "0 1"], duration: 900, delay: stagger(120), ease: "inOut(3)" });
    }, "0px");
  }
};

/**
 * Draws a path in step with scrolling: empty when the container enters the
 * viewport, complete by the time its end reaches the middle.
 * @param {Element} container
 * @param {Iterable<SVGGeometryElement>} paths
 */
export const drawOnScroll = (container, paths) => {
  const strokes = createDrawable([...paths]);
  animate(strokes, {
    draw: ["0 0", "0 1"],
    ease: "linear",
    autoplay: onScroll({ target: container, enter: "end start", leave: "center end", sync: 0.4 }),
  });
};

/**
 * Process steps light up in order once the line reaches them.
 * @param {Element} container
 * @param {Iterable<HTMLElement>} steps
 */
export const lightSteps = (container, steps) => {
  const list = [...steps];
  list.forEach((step, i) => {
    animate(step, {
      opacity: [0.35, 1],
      duration: 400,
      ease: "out(2)",
      autoplay: onScroll({ target: container, enter: `end ${Math.round((i / list.length) * 100)}%`, leave: "center end", sync: true }),
    });
  });
};
