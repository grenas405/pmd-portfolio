import type { SiteContent } from "../../content";
import { html, type Html } from "../../html";
import { sectionHeader } from "./shared";

export const process = (content: SiteContent): Html => html`<section class="section" id="process" aria-labelledby="process-title">
  ${sectionHeader("process", "process", "How a project goes", "Five steps, and you see working software long before the last one.")}
  <div class="steps" data-steps>
    <svg class="steps__line" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true"><path d="M0 5 H1000" data-draw/></svg>
    <ol class="steps__list">
      ${content.process.map(
        (step) => html`<li class="step"><span class="step__dot" aria-hidden="true"></span><h3 class="step__name">${step.name}</h3><p class="step__detail">${step.detail}</p></li>`,
      )}
    </ol>
  </div>
</section>`;
