/**
 * Shows the mobile Call/Text bar once the hero's own buttons have scrolled out
 * of view, and hides it again when they (or the contact section) are visible.
 * @param {HTMLElement} bar
 * @param {Element[]} anchors elements whose visibility makes the bar unnecessary
 */
export const wireCallbar = (bar, anchors) => {
  /** @type {Map<Element, boolean>} */
  const visible = new Map(anchors.map((el) => [el, true]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
    bar.classList.toggle("is-visible", shouldShowCallbar([...visible.values()]));
  });
  for (const el of anchors) observer.observe(el);
};

/** The bar shows only when none of the anchors are on screen. Pure. */
export const shouldShowCallbar = (/** @type {boolean[]} */ anchorsVisible) => anchorsVisible.length > 0 && !anchorsVisible.some(Boolean);
