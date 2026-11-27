/**
 * The hero's Main Street: storefronts that open for the day and receive
 * orders, bookings, and sales. Pure markup; animated by client/street/scene.js.
 * Decorative (aria-hidden); the caller provides a text description.
 */
import type { Shop, ShopKind, Street } from "../content";
import { html, type Html } from "../html";
import { skyline } from "./skyline";

const SHOP_WIDTH = 200;
const SHOP_GAP = 30;
const SHOP_X0 = 20;

/** What sits in each shop window. */
const WINDOW_ART: Readonly<Record<ShopKind, Html>> = {
  cafe: html`<path class="shop__art" d="M-38 0h22v10a11 11 0 0 1-22 0zM-16 3a5 5 0 0 1 0 10M10 0h22v10a11 11 0 0 1-22 0z"/>`,
  salon: html`<circle class="shop__art" cx="-18" cy="-2" r="16"/><path class="shop__art" d="M10 22v-14h20v14M12 8v-12M28 8v-12M6 22h28"/>`,
  boutique: html`<path class="shop__art" d="M-30 -8l-8 8l6 4v18h16v-18l6-4l-8-8a6 6 0 0 1-12 0zM14 -6h18l-3 26h-12z"/>`,
};

/** What each kind of shop counts on the owner's phone. */
export const COUNTER_LABEL: Readonly<Record<ShopKind, string>> = { cafe: "Orders", salon: "Bookings", boutique: "Sales" };

const storefront = (shop: Shop, i: number): Html => {
  const x = SHOP_X0 + i * (SHOP_WIDTH + SHOP_GAP);
  // The outer group positions the shop; the inner group is what animates (CSS transforms
  // would otherwise replace the SVG transform attribute).
  return html`<g transform="translate(${x} 0)"><g class="shop shop--${shop.kind}" data-shop="${i}">
    <rect class="shop__wall" x="0" y="70" width="${SHOP_WIDTH}" height="230" rx="3"/>
    <rect class="shop__cornice" x="-6" y="62" width="${SHOP_WIDTH + 12}" height="14" rx="2"/>
    <rect class="shop__signboard" x="24" y="88" width="${SHOP_WIDTH - 48}" height="30" rx="4"/>
    <text class="shop__name" x="${SHOP_WIDTH / 2}" y="108" text-anchor="middle">${shop.name}</text>
    <g class="shop__awning" data-awning>
      <path class="shop__awning-base" d="M-4 132H${SHOP_WIDTH + 4}l-10 34H6z"/>
      <path class="shop__awning-stripes" d="M22 132l-4 34M56 132l-2 34M90 132v34M124 132l2 34M158 132l4 34"/>
      <path class="shop__scallop" d="M6 166${Array.from({ length: 8 }, () => "a11.75 11.75 0 0 0 23.5 0").join("")}z"/>
    </g>
    <rect class="shop__window" x="16" y="184" width="88" height="84" rx="3"/>
    <rect class="shop__light" data-light x="16" y="184" width="88" height="84" rx="3"/>
    <g transform="translate(60 228)">${WINDOW_ART[shop.kind]}</g>
    <rect class="shop__door" x="122" y="184" width="58" height="116" rx="3"/>
    <rect class="shop__light shop__light--door" data-light x="128" y="190" width="46" height="50" rx="2"/>
    <circle class="shop__knob" cx="170" cy="246" r="3"/>
    <g class="shop__sign shop__sign--closed" data-sign-closed><rect x="130" y="200" width="42" height="18" rx="3"/><text x="151" y="213" text-anchor="middle">CLOSED</text></g>
    <g class="shop__sign shop__sign--open" data-sign-open><rect x="130" y="200" width="42" height="18" rx="3"/><text x="151" y="213" text-anchor="middle">OPEN</text></g>
    <rect class="shop__planter" x="8" y="284" width="30" height="16" rx="2"/>
    <path class="shop__plant" d="M12 284q3-16 11-18q8 2 11 18"/>
  </g></g>`;
};

const car = (): Html => html`<g transform="translate(0 304)"><g class="street__car" data-car>
  <path class="car__body" d="M0 26h88a6 6 0 0 0 6-6v-6l-14-4l-12-12H26L14 10L4 12a6 6 0 0 0-4 6z"/>
  <path class="car__glass" d="M30 2h34l10 10H24z"/>
  <circle class="car__wheel" cx="22" cy="28" r="8"/><circle class="car__wheel" cx="72" cy="28" r="8"/>
</g></g>`;

/** A scissor-tailed flycatcher, Oklahoma's state bird, in silhouette. */
const bird = (): Html => html`<g transform="translate(140 36)"><g class="street__bird" data-bird>
  <path d="M0 8q10-8 22-4q6-6 12-2l-6 4q2 4-6 6l-10 2l-28 14l22-16l-28 6z"/>
</g></g>`;

const counters = (shops: readonly Shop[]): Html => html`<ul class="phone__counts">
  ${shops.map(
    (shop, i) => html`<li class="phone__count phone__count--${shop.kind}"><span>${COUNTER_LABEL[shop.kind]}</span><b data-count="${i}">${[12, 8, 5][i % 3]}</b></li>`,
  )}
</ul>`;

export const mainStreet = (street: Street): Html => {
  const shops = street.shops.slice(0, 3);
  return html`<div class="street" data-street>
  <p class="visually-hidden">${street.description}</p>
  <div class="street__scene" data-street-scene aria-hidden="true">
    <div class="street__layer street__layer--sky" data-depth="0.35">${skyline("street__skyline")}</div>
    <div class="street__layer street__layer--block" data-depth="0.7">
      <svg class="street__block" viewBox="0 0 720 360" aria-hidden="true" focusable="false">
        ${bird()}
        <rect class="street__sidewalk" x="0" y="300" width="720" height="24"/>
        <rect class="street__road" x="0" y="324" width="720" height="36"/>
        <path class="street__lane" d="M0 342H720"/>
        ${shops.map(storefront)}
        <g class="street__lamps">${[0, 1, 2, 3].map((i) => html`<g transform="translate(${8 + i * 230} 0)"><path class="lamp__post" d="M6 300V214"/><circle class="lamp__light" cx="6" cy="210" r="7"/></g>`)}</g>
        ${car()}
      </svg>
    </div>
    <div class="street__notes">
      ${shops.map(
        (shop, i) => html`<p class="note note--${i}${i === 1 ? " is-static" : ""}" data-note="${i}" data-messages="${shop.notifications.join("\n")}"><span class="note__dot" aria-hidden="true"></span><span class="note__text" data-note-text>${shop.notifications[0] ?? ""}</span></p>`,
      )}
    </div>
    <div class="street__layer street__layer--phone" data-depth="1.2">
      <div class="phone">
        <p class="phone__title">Today</p>
        ${counters(shops)}
        <p class="phone__foot">Updated just now</p>
      </div>
    </div>
  </div>
  <button class="street__pause" type="button" data-motion-toggle aria-pressed="false" hidden>
    <span class="street__pause-icon" aria-hidden="true"></span><span data-motion-label>Pause animation</span>
  </button>
</div>`;
};
