/**
 * The hero's opening sequence: commands type out, then their output appears.
 * Text is server-rendered; this only animates it. CSS keeps it hidden until
 * the script takes over (or shows it after a timeout if the script never runs).
 */
import { createTimeline, stagger } from "animejs";

const CHAR_MS = 42;

/**
 * Text shown after `count` characters have been typed. Pure.
 * @param {string} text @param {number} count
 */
export const typedText = (text, count) => text.slice(0, Math.max(0, Math.min(text.length, Math.round(count))));

/**
 * @param {HTMLElement} term
 */
export const bootTerminal = (term) => {
  const commands = /** @type {HTMLElement[]} */ ([...term.querySelectorAll("[data-type]")]);
  const outputs = /** @type {HTMLElement[]} */ ([...term.querySelectorAll("[data-boot-out]")]);
  const [greetCmd, lsCmd] = commands;
  const [greeting, intro, list, actions] = outputs;

  term.classList.add("is-booting");
  const full = commands.map((el) => el.textContent ?? "");
  for (const el of commands) el.textContent = "";

  /** @param {HTMLElement | undefined} el @param {number} index */
  const typeStep = (el, index) => {
    const text = full[index] ?? "";
    const progress = { n: 0 };
    return { el, text, progress, duration: text.length * CHAR_MS };
  };
  const first = typeStep(greetCmd, 0);
  const second = typeStep(lsCmd, 1);
  const reveal = { opacity: [0, 1], y: [8, 0], duration: 420, ease: "out(3)" };

  const timeline = createTimeline({ delay: 250, onComplete: () => term.classList.replace("is-booting", "is-booted") });
  if (first.el) {
    const el = first.el;
    timeline.add(first.progress, { n: first.text.length, duration: first.duration, ease: "linear", onUpdate: () => { el.textContent = typedText(first.text, first.progress.n); } });
  }
  if (greeting) timeline.add(greeting, reveal, "+=120");
  if (intro) timeline.add(intro, reveal, "-=200");
  if (second.el) {
    const el = second.el;
    timeline.add(second.progress, { n: second.text.length, duration: second.duration, ease: "linear", onUpdate: () => { el.textContent = typedText(second.text, second.progress.n); } }, "+=150");
  }
  if (list) timeline.add([...list.children], { ...reveal, delay: stagger(70) }, "+=100");
  if (actions) timeline.add(actions, reveal, "-=150");

  // If anything above failed to run, the CSS fallback still reveals the text.
  return timeline;
};

/** Shows everything immediately (reduced motion, or after an error). */
export const showTerminal = (/** @type {HTMLElement} */ term) => {
  term.classList.remove("is-booting");
  term.classList.add("is-booted");
};
