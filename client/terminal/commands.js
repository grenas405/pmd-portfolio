/**
 * The hero terminal's commands. Pure: input text and site facts in, output
 * lines and an optional action out. The DOM wiring lives in prompt.js.
 */

/**
 * @typedef {{ name: string, role: string, city: string, phone: string, email: string,
 *   services: Array<{ dir: string, id: string }> }} TerminalFacts
 * @typedef {{ kind: "scroll", target: string } | { kind: "open", href: string } | { kind: "clear" } | { kind: "theme" } | { kind: "none" }} Action
 * @typedef {{ lines: string[], action: Action, error: boolean }} CommandResult
 */

const SECTIONS = /** @type {const} */ ({ services: "#services", work: "#work", projects: "#work", process: "#process", about: "#about", faq: "#faq", contact: "#contact" });

const HELP = [
  "commands:",
  "  ls services     what I build",
  "  cd <section>    services · work · process · about · faq · contact",
  "  whoami          who you're talking to",
  "  call / text / email",
  "  theme           switch light/dark",
  "  clear",
];

/** @param {string[]} lines @param {Action} [action] @returns {CommandResult} */
const out = (lines, action = { kind: "none" }) => ({ lines, action, error: false });

/**
 * @param {string} raw
 * @param {TerminalFacts} facts
 * @returns {CommandResult}
 */
export const runCommand = (raw, facts) => {
  const input = raw.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 40);
  const [command = "", ...args] = input.split(" ");
  const arg = args.join(" ").replace(/\/$/, "");

  switch (command) {
    case "":
      return out([]);
    case "help":
    case "?":
      return out(HELP);
    case "whoami":
      return out([`${facts.name}, ${facts.role.toLowerCase()} in ${facts.city}.`]);
    case "ls":
      if (arg === "" || arg === "services" || arg === "~/okc/services")
        return out([facts.services.map((service) => `${service.dir}/`).join("  ")]);
      return { lines: [`ls: cannot access '${arg}': try ls services`], action: { kind: "none" }, error: true };
    case "cd":
    case "open": {
      const fromDir = facts.services.find((service) => service.dir === arg);
      if (fromDir) return out([`cd ${arg}`], { kind: "scroll", target: `#${fromDir.id}` });
      const target = SECTIONS[/** @type {keyof typeof SECTIONS} */ (arg)];
      if (target) return out([], { kind: "scroll", target });
      if (arg === "" || arg === "~") return out([], { kind: "scroll", target: "#main" });
      return { lines: [`cd: ${arg}: no such section. Try: ${Object.keys(SECTIONS).slice(0, 4).join(", ")}…`], action: { kind: "none" }, error: true };
    }
    case "call":
      return out([`dialing ${facts.phone}…`], { kind: "open", href: `tel:${facts.phone}` });
    case "text":
    case "sms":
      return out([`opening messages…`], { kind: "open", href: `sms:${facts.phone}` });
    case "email":
    case "mail":
      return out([`opening mail to ${facts.email}…`], { kind: "open", href: `mailto:${facts.email}` });
    case "theme":
      return out(["switching theme…"], { kind: "theme" });
    case "clear":
      return out([], { kind: "clear" });
    case "sudo":
      return { lines: ["Nice try, partner. This incident will be reported to the county sheriff."], action: { kind: "none" }, error: true };
    case "exit":
      return out(["There's no leaving the prairie. Try `call` instead."]);
    default:
      return { lines: [`bash: ${command}: command not found. Type help.`], action: { kind: "none" }, error: true };
  }
};

/**
 * Formats the status-bar clock in Oklahoma City time. Pure.
 * @param {Date} date
 */
export const okcClock = (date) =>
  `OKC ${new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date)}`;
