import type { SiteContent, Testimonial } from "../../content";
import { html, type Html } from "../../html";
import { icon } from "../icons";
import { sectionHeader } from "./shared";

const quote = (item: Testimonial): Html => html`<figure class="quote">
  <blockquote><p>${item.quote}</p></blockquote>
  <figcaption><b>${item.name}</b>, ${item.business}</figcaption>
</figure>`;

/** Real testimonials when there are any; otherwise the commitments every client gets. */
export const proof = (content: SiteContent): Html => {
  const hasQuotes = content.testimonials.length > 0;
  return html`<section class="section" id="promise" aria-labelledby="promise-title">
  ${sectionHeader("promise", "promise", hasQuotes ? "What owners say" : "What you can count on")}
  ${hasQuotes ? html`<div class="quotes">${content.testimonials.map(quote)}</div>` : html``}
  <ul class="promises">
    ${content.guarantees.map(
      (item) => html`<li class="promise">${icon(item.icon)}<h3 class="promise__title">${item.title}</h3><p>${item.detail}</p></li>`,
    )}
  </ul>
</section>`;
};
