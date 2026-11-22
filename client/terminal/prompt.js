/** Wires the interactive prompt and the status-bar clock. Output uses textContent only. */
import { okcClock, runCommand } from "./commands.js";

const MAX_LINES = 8;

/**
 * Reads the facts the commands need from the server-rendered page.
 * @param {Document} doc
 * @param {HTMLFormElement} form
 * @returns {import("./commands.js").TerminalFacts}
 */
export const readFacts = (doc, form) => {
  const tel = doc.querySelector('a[href^="tel:"]')?.getAttribute("href")?.slice(4) ?? "";
  const mail = doc.querySelector('a[href^="mailto:"]')?.getAttribute("href")?.slice(7) ?? "";
  const services = [...doc.querySelectorAll(".term__ls a")].map((link) => ({
    dir: (link.textContent ?? "").replace(/\/$/, ""),
    id: (link.getAttribute("href") ?? "").replace("/#", ""),
  }));
  return {
    name: form.dataset.name ?? "",
    role: form.dataset.role ?? "",
    city: form.dataset.city ?? "",
    phone: tel,
    email: mail,
    services,
  };
};

/**
 * @param {Window} win
 * @param {HTMLFormElement} form
 * @param {HTMLElement} log
 * @param {() => void} toggleTheme
 */
export const wirePrompt = (win, form, log, toggleTheme) => {
  const doc = win.document;
  const input = form.querySelector("input");
  if (!input) return;
  const facts = readFacts(doc, form);
  const promptText = form.querySelector(".term__prompt")?.textContent ?? "$";

  /** @param {string} text @param {string} className */
  const print = (text, className) => {
    const line = doc.createElement("p");
    line.className = className;
    line.textContent = text;
    log.append(line);
    while (log.childElementCount > MAX_LINES) log.firstElementChild?.remove();
  };

  form.classList.add("is-ready");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = input.value;
    input.value = "";
    const result = runCommand(raw, facts);
    print(`${promptText} ${raw}`, "term__line");
    for (const text of result.lines) print(text, result.error ? "term__out term__out--error" : "term__out");
    const { action } = result;
    if (action.kind === "clear") log.replaceChildren();
    if (action.kind === "theme") toggleTheme();
    if (action.kind === "open") win.location.href = action.href;
    if (action.kind === "scroll") doc.querySelector(action.target)?.scrollIntoView({ behavior: win.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
};

/**
 * Keeps the status-bar clock on Oklahoma City time.
 * @param {Window} win
 * @param {HTMLElement} clock
 */
export const wireClock = (win, clock) => {
  const tick = () => {
    clock.textContent = okcClock(new Date());
  };
  tick();
  win.setInterval(tick, 30_000);
};
