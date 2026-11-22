const VISIBLE_MS = 2600;

/**
 * Returns a function that shows a short status message in the given live region.
 * @param {Window} win
 * @param {HTMLElement} region
 * @returns {(message: string) => void}
 */
export const createToast = (win, region) => {
  /** @type {number | undefined} */
  let timer;
  return (message) => {
    region.textContent = message;
    region.classList.add("is-visible");
    win.clearTimeout(timer);
    timer = win.setTimeout(() => region.classList.remove("is-visible"), VISIBLE_MS);
  };
};
