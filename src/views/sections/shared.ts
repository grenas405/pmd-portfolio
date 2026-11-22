/** Building blocks shared by the page sections. Pure. */
import type { CaseStudy } from "../../content";
import { html, type Html } from "../../html";

/** Splits text into word spans so titles can be revealed word by word. */
export const words = (text: string): Html[] => text.split(" ").map((word) => html`<span class="word">${word}</span> `);

/** Two-column section header: path + title on the left, lede on the right. */
export const sectionHeader = (id: string, path: string, title: string, lede?: Html | string): Html => html`<header class="section-head">
  <div class="section-head__title">
    <p class="path" aria-hidden="true">~/okc/${path}</p>
    <h2 id="${id}-title" class="section-title" data-reveal-title>${words(title)}</h2>
  </div>
  ${lede ? html`<div class="section-head__lede">${typeof lede === "string" ? html`<p>${lede}</p>` : lede}</div>` : html``}
</header>`;

export const exampleTag = (study: CaseStudy): Html =>
  study.kind === "example" ? html`<span class="tag">Example project</span>` : html``;
