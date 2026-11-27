/** The site mark: a shop awning over an open door. Also used for favicon.svg. Pure. */
import { html, type Html } from "../html";

export const logoMark = (className = "brand__mark"): Html => html`<svg class="${className}" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true" focusable="false">
  <rect class="logo__door" x="22" y="30" width="20" height="28" rx="2"/>
  <path class="logo__awning" d="M6 14h52l-4 14H10z"/>
  <path class="logo__scallop" d="M10 28a5.5 5.5 0 0 0 11 0a5.5 5.5 0 0 0 11 0a5.5 5.5 0 0 0 11 0a5.5 5.5 0 0 0 11 0z"/>
  <path class="logo__stripe" d="M20 14l-2 14M32 14v14M44 14l2 14"/>
</svg>`;
