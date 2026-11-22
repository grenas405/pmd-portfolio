/**
 * Picks the section that fills most of the viewport. Pure.
 * @param {Map<string, number>} ratios section id → visible ratio
 * @returns {string | null}
 */
export const activeSection = (ratios) => {
  let best = null;
  let bestRatio = 0.12;
  for (const [id, ratio] of ratios) {
    if (ratio > bestRatio) {
      best = id;
      bestRatio = ratio;
    }
  }
  return best;
};

/**
 * Marks the header link for the section currently on screen.
 * @param {Document} doc
 * @param {Iterable<HTMLAnchorElement>} links
 */
export const wireScrollspy = (doc, links) => {
  const byId = new Map([...links].map((link) => [link.dataset.spy ?? "", link]));
  /** @type {Map<string, number>} */
  const ratios = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) ratios.set(entry.target.id, entry.intersectionRatio);
      const active = activeSection(ratios);
      for (const [id, link] of byId) {
        if (id === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    },
    { threshold: [0, 0.15, 0.3, 0.5, 0.75] },
  );
  for (const id of byId.keys()) {
    const section = doc.getElementById(id);
    if (section) observer.observe(section);
  }
};
