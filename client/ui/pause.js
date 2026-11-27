/** @param {boolean} paused */
export const toggleLabel = (paused) => (paused ? "Play animation" : "Pause animation");

/**
 * The visible pause control (WCAG 2.2.2). It pauses every running hero scene.
 * @param {HTMLButtonElement} button
 * @param {() => Array<{ setUserPaused: (paused: boolean) => void }>} scenes
 */
export const wireMotionControl = (button, scenes) => {
  let paused = false;
  const label = button.querySelector("[data-motion-label]");
  button.hidden = false;
  button.addEventListener("click", () => {
    paused = !paused;
    for (const scene of scenes()) scene.setUserPaused(paused);
    button.setAttribute("aria-pressed", String(paused));
    if (label) label.textContent = toggleLabel(paused);
  });
};
