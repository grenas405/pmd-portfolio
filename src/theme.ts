import type { Theme } from "./views/types";

/** Reads the visitor's saved theme from the Cookie header. Dark is the default. */
export const themeFromCookie = (cookieHeader: string | null): Theme => {
  const match = cookieHeader?.match(/(?:^|;\s*)theme=(light|dark)(?:;|$)/);
  return match?.[1] === "light" ? "light" : "dark";
};
