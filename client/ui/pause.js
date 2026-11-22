/**
 * @typedef {{ userPaused: boolean, inView: boolean }} MotionState
 */

/** Motion runs only when the visitor hasn't paused it and the field is on screen. Pure. */
export const shouldRun = (/** @type {MotionState} */ state) => !state.userPaused && state.inView;

/** @param {boolean} userPaused */
export const toggleLabel = (userPaused) => (userPaused ? "Play animation" : "Pause animation");

/**
 * Wires the visible pause control (WCAG 2.2.2) and pauses motion while the field is scrolled away.
 * @param {Window} win
 * @param {HTMLButtonElement} button
 * @param {HTMLElement} field
 * @param {{ pause: () => void, resume: () => void }} engine
 */
export const wireMotionControl = (win, button, field, engine) => {
  /** @type {MotionState} */
  let state = { userPaused: false, inView: true };

  /** @param {Partial<MotionState>} change */
  const update = (change) => {
    state = { ...state, ...change };
    if (shouldRun(state)) engine.resume();
    else engine.pause();
    button.textContent = toggleLabel(state.userPaused);
  };

  button.addEventListener("click", () => update({ userPaused: !state.userPaused }));

  if ("IntersectionObserver" in win) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) update({ inView: entry.isIntersecting });
    });
    observer.observe(field);
  }
};
