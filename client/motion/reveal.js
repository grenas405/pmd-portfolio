import { animate, stagger } from "animejs";

/**
 * Calls `onEnter` once, the first time the element scrolls into view.
 * @param {Element} element @param {() => void} onEnter @param {string} [rootMargin]
 */
export const onceInView = (element, onEnter, rootMargin = "0px 0px -12% 0px") => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        onEnter();
      }
    },
    { rootMargin },
  );
  observer.observe(element);
};

/**
 * Section titles rise into place word by word as they scroll into view.
 * Titles start hidden only once this runs, so without JS they are simply visible.
 * @param {Iterable<HTMLElement>} titles
 */
export const revealTitles = (titles) => {
  for (const title of titles) {
    const words = title.querySelectorAll(".word");
    title.classList.add("is-pending");
    onceInView(title, () => {
      animate(words, {
        opacity: [0, 1],
        y: ["0.55em", 0],
        rotate: [4, 0],
        duration: 800,
        delay: stagger(70),
        ease: "out(4)",
        onBegin: () => title.classList.remove("is-pending"),
      });
    });
  }
};
