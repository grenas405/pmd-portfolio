/**
 * Auto-escaping HTML templates. Every interpolated value is escaped unless it is
 * already an `Html` value produced by `html` or explicitly marked with `raw`.
 */
declare const htmlBrand: unique symbol;

export type Html = { readonly [htmlBrand]: true; readonly value: string };

export type HtmlValue = Html | string | number | boolean | null | undefined | readonly HtmlValue[];

const ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);

/** Mark a string as trusted markup. Only use with literals or already-escaped output. */
export const raw = (value: string): Html => ({ value }) as Html;

const isHtml = (value: unknown): value is Html =>
  typeof value === "object" && value !== null && !Array.isArray(value) && "value" in value;

export const toMarkup = (value: HtmlValue): string => {
  if (value === null || value === undefined || value === false || value === true) return "";
  if (Array.isArray(value)) return value.map(toMarkup).join("");
  if (isHtml(value)) return value.value;
  return escapeHtml(String(value));
};

export const html = (strings: TemplateStringsArray, ...values: readonly HtmlValue[]): Html =>
  raw(strings.reduce((out, chunk, i) => out + chunk + (i < values.length ? toMarkup(values[i]) : ""), ""));

/** Serialize JSON for a `<script type="application/ld+json">` block without allowing tag breakout. */
export const jsonScript = (data: unknown): Html =>
  raw(JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026"));
