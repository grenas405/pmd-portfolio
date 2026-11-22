import { animate, stagger } from "animejs";

/**
 * The first gust passes through the headline: each word leans and recovers,
 * left to right. The text is never hidden, so it stays readable and is the
 * page's largest contentful paint from the first frame.
 * @param {HTMLElement[]} words
 */
export const gustThroughHeadline = (words) => {
  animate(words, {
    skewX: [0, -9, 3, 0],
    x: [0, 10, -2, 0],
    duration: 1700,
    delay: stagger(70, { start: 900 }),
    ease: "inOutSine",
  });
};
