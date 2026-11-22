import type { Profile, SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { sectionHeader } from "./shared";

/** The portrait, or a monogram placeholder until one is added in content.ts. */
const portrait = (profile: Profile): Html =>
  profile.portrait
    ? html`<img class="portrait__img" src="${profile.portrait.src}" alt="${profile.portrait.alt}" width="${profile.portrait.width}" height="${profile.portrait.height}" loading="lazy" decoding="async">`
    : html`<div class="portrait__placeholder" role="img" aria-label="${profile.name}"><span aria-hidden="true">${profile.givenName[0]}${profile.familyName[0]}</span></div>`;

export const about = (content: SiteContent): Html => html`<section class="section" id="about" aria-labelledby="about-title">
  <div class="about">
    <figure class="portrait">${portrait(content.profile)}<figcaption>${content.profile.name}, ${content.profile.city}</figcaption></figure>
    <div class="about__text">
      ${sectionHeader("about", "about", "About Pedro")}
      <div class="prose">${content.about.map((paragraph) => html`<p>${paragraph}</p>`)}</div>
      <ul class="checks">${content.howIWork.map((item) => html`<li>${item}</li>`)}</ul>
    </div>
  </div>
</section>`;
