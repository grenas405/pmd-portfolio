import type { Service, SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { icon } from "../icons";
import { mockup } from "../mockups";
import { sectionHeader } from "./shared";

const tile = (item: Service, featured: boolean): Html => html`<li class="tile${featured ? " tile--feature" : ""}" id="${item.id}">
  <div class="tile__text">
    <span class="tile__icon">${icon(item.icon)}</span>
    <h3 class="tile__name">${item.name}</h3>
    <p class="tile__summary">${item.summary}</p>
    <p class="tile__label">Good for</p>
    <ul class="tile__uses">${item.goodFor.map((use) => html`<li>${use}</li>`)}</ul>
  </div>
  ${featured ? html`<div class="tile__art">${mockup("booking")}</div>` : html``}
</li>`;

export const services = (content: SiteContent): Html => html`<section class="section" id="services" aria-labelledby="services-title">
  ${sectionHeader("services", "What I build", "Software shaped around how your business already works, from a fast website to a full custom app.")}
  <ul class="bento">${content.services.map((item, i) => tile(item, i === 0))}</ul>
</section>`;
