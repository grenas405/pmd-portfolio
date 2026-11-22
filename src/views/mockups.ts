/**
 * Coded UI mockups that illustrate each project. Pure HTML styled by
 * client/styles/mockups.css; decorative (aria-hidden) and paired with a
 * visible caption by the caller.
 */
import type { MockupKind } from "../content";
import { html, type Html } from "../html";

const phone = (screen: Html, variant: "ios" | "android"): Html => html`<div class="device device--phone device--${variant}">
  <div class="device__screen">${screen}</div>
</div>`;

const browser = (address: string, screen: Html): Html => html`<div class="device device--browser">
  <div class="device__chrome"><span class="device__dots"><i></i><i></i><i></i></span><span class="device__address">${address}</span></div>
  <div class="device__screen">${screen}</div>
</div>`;

const ordering = (): Html =>
  phone(
    html`<div class="ui ui--ordering">
  <div class="ui__bar"><b>La Pradera</b><span>Pickup · 15 min</span></div>
  <div class="ui__chips"><span class="is-on">Tacos</span><span>Plates</span><span>Drinks</span></div>
  <p class="ui__heading">Most ordered</p>
  ${[
    ["Street tacos (3)", "$9.50"],
    ["Brisket plate", "$14.00"],
    ["Queso & chips", "$6.25"],
    ["Horchata", "$3.50"],
    ["Elote cup", "$4.75"],
  ].map(([name, price]) => html`<div class="ui__item"><span class="ui__thumb"></span><span>${name}</span><b>${price}</b></div>`)}
  <div class="ui__summary"><span>3 items</span><b>$29.75</b></div>
  <div class="ui__cta">Pay & pick up at 6:15</div>
</div>`,
    "ios",
  );

const fieldService = (): Html =>
  phone(
    html`<div class="ui ui--jobs">
  <div class="ui__bar"><b>Today</b><span>4 jobs</span></div>
  ${[
    ["8:00", "AC tune-up", "Edmond", "done"],
    ["10:30", "Water heater", "Moore", "now"],
    ["1:00", "Leak check", "Norman", "next"],
    ["3:30", "Install quote", "Yukon", "next"],
  ].map(
    ([time, job, city, state]) =>
      html`<div class="ui__job ui__job--${state}"><span class="ui__time">${time}</span><span><b>${job}</b><small>${city}</small></span><span class="ui__state"></span></div>`,
  )}
  <div class="ui__cta">Capture photos & signature</div>
</div>`,
    "android",
  );

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS: ReadonlyArray<readonly [number, number, string]> = [
  [0, 1, "Cut · Ana"],
  [1, 3, "Color · Mia"],
  [2, 0, "Trim · Ana"],
  [3, 2, "Cut · Leo"],
  [4, 1, "Style · Mia"],
  [2, 4, "Open"],
];

const booking = (): Html =>
  browser(
    "book.salon-okc.com",
    html`<div class="ui ui--booking">
  <div class="ui__bar"><b>Book an appointment</b><span>Week of Mar 9</span></div>
  <div class="ui__calendar">
    ${DAYS.map((day) => html`<span class="ui__day">${day}</span>`)}
    ${SLOTS.map(
      ([col, row, label]) =>
        html`<span class="ui__slot ui__slot--c${col} ui__slot--r${row}${label === "Open" ? " is-open" : ""}">${label}</span>`,
    )}
  </div>
  <div class="ui__cta">Reminder text sent · Confirm or reschedule</div>
</div>`,
  );

const MOCKUPS: Readonly<Record<MockupKind, () => Html>> = {
  ordering,
  "field-service": fieldService,
  booking,
};

export const mockup = (kind: MockupKind): Html => html`<div class="mockup mockup--${kind}" data-tilt aria-hidden="true">${MOCKUPS[kind]()}</div>`;
