/** @typedef {"dark" | "light"} Theme */

const THEME_COLOR = /** @type {const} */ ({ dark: "#10202e", light: "#e8f0f3" });
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * @param {string | undefined} value
 * @returns {Theme}
 */
export const parseTheme = (value) => (value === "light" ? "light" : "dark");

/** @param {Theme} theme @returns {Theme} */
export const otherTheme = (theme) => (theme === "dark" ? "light" : "dark");

/**
 * Cookie the Worker reads to render the chosen theme on the next page load (no flash).
 * @param {Theme} theme
 * @param {boolean} secure
 */
export const themeCookie = (theme, secure) =>
  `theme=${theme}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure ? "; Secure" : ""}`;

/**
 * @param {Document} doc
 * @param {HTMLElement} button
 * @param {Theme} theme
 */
const applyTheme = (doc, button, theme) => {
  doc.documentElement.dataset.theme = theme;
  doc.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
  doc.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  const next = otherTheme(theme);
  button.dataset.nextTheme = next;
  button.setAttribute("aria-label", `Switch to ${next} theme`);
};

/**
 * Wires the light/dark toggle in the header.
 * @param {Window} win
 * @param {HTMLElement} button
 */
export const wireThemeToggle = (win, button) => {
  const doc = win.document;
  button.addEventListener("click", () => {
    const theme = parseTheme(button.dataset.nextTheme);
    doc.cookie = themeCookie(theme, win.location.protocol === "https:");
    const reduce = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduce) {
      doc.startViewTransition(() => applyTheme(doc, button, theme));
    } else {
      applyTheme(doc, button, theme);
    }
  });
};
