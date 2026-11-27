import type { SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { icon } from "../icons";
import { mainStreet } from "../street";

const stars = (rating: number): string => "★".repeat(Math.round(rating)).padEnd(5, "☆");

export const hero = (content: SiteContent): Html => {
  const { profile } = content;
  return html`<section class="hero" aria-labelledby="hero-title">
  <div class="hero__copy">
    <p class="availability"><span class="availability__dot" aria-hidden="true"></span>${content.availability}</p>
    <h1 id="hero-title" class="hero__title">${content.headline.join(" ")}</h1>
    <p class="hero__intro">${content.intro}</p>
    <div class="hero__actions" data-hero-actions>
      <a class="button button--primary" href="tel:${profile.phone}" data-magnetic>Call ${profile.phoneDisplay}</a>
      <a class="button button--ghost" href="sms:${profile.phone}">Text me</a>
    </div>
    <ul class="trust">
      ${content.guarantees.map((item) => html`<li>${icon(item.icon)}<span>${item.title}</span></li>`)}
      ${profile.reviews
        ? html`<li class="trust__reviews"><a href="${profile.reviews.url}" rel="noopener"><span class="trust__stars" aria-hidden="true">${stars(profile.reviews.rating)}</span><span>${profile.reviews.rating.toFixed(1)} from ${profile.reviews.count} ${profile.reviews.source} reviews</span></a></li>`
        : html``}
    </ul>
  </div>
  <div class="hero__art">${mainStreet(content.street)}</div>
</section>`;
};
