import type { SiteContent } from "../content";

export type Theme = "dark" | "light";

/** Paths of the hashed client bundle, produced by scripts/build-client.mjs. */
export type Assets = { readonly js: string; readonly css: string; readonly font: string };

/** Everything a view may depend on. Views are pure functions of this context. */
export type PageContext = {
  readonly content: SiteContent;
  readonly assets: Assets;
  readonly theme: Theme;
  readonly year: number;
};

export type PageMeta = {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly ogType: "website" | "article";
  readonly jsonLd: readonly unknown[];
  readonly indexable: boolean;
};
