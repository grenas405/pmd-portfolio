import type { SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { metroMap } from "../map";
import { sectionHeader } from "./shared";

export const local = (content: SiteContent): Html => html`<section class="section section--raised" id="local" aria-labelledby="local-title">
  ${sectionHeader("local", "Right here in the metro", content.localPitch)}
  <div class="local">
    <div class="local__map" data-map>${metroMap(content.serviceArea)}</div>
    <ul class="cities" aria-label="Areas I serve">${content.serviceArea.map((city) => html`<li>${city}</li>`)}</ul>
  </div>
</section>`;
