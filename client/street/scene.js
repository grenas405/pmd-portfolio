/**
 * Wires the Main Street hero: the opening sequence, the "business day" loop of
 * notifications, ambient motion, pointer depth, and the pause control.
 * Every animation targets a handful of elements (transform/opacity only).
 */
import { animate, createAnimatable, createTimeline, createTimer, stagger, utils } from "animejs";
import { increment, nextNotification, parallaxFor, tiltFor } from "./schedule.js";

const NOTE_EVERY_MS = 2800;

/**
 * @typedef {{ setUserPaused: (paused: boolean) => void }} SceneControl
 * @typedef {{ pause: () => unknown, play: () => unknown }} Playable
 */

/** Whether the street should be moving. Pure. */
export const shouldAnimate = (/** @type {{ userPaused: boolean, inView: boolean }} */ state) => !state.userPaused && state.inView;

/**
 * @template {Element} T
 * @param {ParentNode} root @param {string} selector @returns {T[]}
 */
const all = (root, selector) => /** @type {T[]} */ ([...root.querySelectorAll(selector)]);

/**
 * Each shop's notifications, from the `data-messages` attribute the server
 * renders on its card (one message per line).
 * @param {HTMLElement} street
 * @returns {string[][]}
 */
export const readMessages = (street) =>
  all(street, "[data-note]").map((card) => (/** @type {HTMLElement} */ (card).dataset.messages ?? "").split("\n").filter(Boolean));

/**
 * The opening: the street wakes up and the shops open for the day.
 * @param {HTMLElement} street
 */
const opening = (street) => {
  const shops = all(street, ".shop");
  const awnings = all(street, "[data-awning]");
  const lights = all(street, "[data-light]");
  const closed = all(street, "[data-sign-closed]");
  const open = all(street, "[data-sign-open]");
  const sky = street.querySelector(".street__layer--sky");
  const phone = street.querySelector(".street__layer--phone");

  // Start state: closed for the night.
  utils.set(open, { opacity: 0 });
  utils.set(closed, { opacity: 1 });

  const timeline = createTimeline({ defaults: { ease: "out(3)" } });
  if (sky) timeline.add(sky, { opacity: [0, 1], y: [24, 0], duration: 900 }, 0);
  timeline
    .add(shops, { y: [60, 0], opacity: [0, 1], duration: 900, delay: stagger(140) }, 150)
    .add(awnings, { scaleY: [0, 1], duration: 650, delay: stagger(140), ease: "out(4)" }, 650)
    .add(lights, { opacity: [0, 1], duration: 500, delay: stagger(80) }, 1000)
    // The OPEN signs flip around: the CLOSED side turns away, the OPEN side turns in.
    .add(closed, { scaleX: [1, 0], duration: 220, delay: stagger(260), ease: "in(2)" }, 1500)
    .add(open, { scaleX: [0, 1], opacity: [1, 1], duration: 260, delay: stagger(260), ease: "out(2)" }, 1720);
  if (phone) timeline.add(phone, { y: [40, 0], opacity: [0, 1], rotate: [-6, 0], duration: 800 }, 1700);
  return timeline;
};

/**
 * Shows one notification card above a shop and ticks the owner's phone.
 * @param {HTMLElement} street @param {{ shop: number, text: string }} note
 */
const ping = (street, note) => {
  const card = street.querySelector(`[data-note="${note.shop}"]`);
  const text = card?.querySelector("[data-note-text]");
  const count = street.querySelector(`[data-count="${note.shop}"]`);
  const light = all(street, `[data-shop="${note.shop}"] [data-light]`);
  if (!(card instanceof HTMLElement) || !text) return;
  text.textContent = note.text;
  animate(card, { opacity: [0, 1, 1, 0], y: [16, 0, -6, -26], scale: [0.85, 1, 1, 0.96], duration: 2500, ease: "out(3)" });
  animate(light, { opacity: [1, 0.55, 1], duration: 500, ease: "inOut(2)" });
  if (count) {
    count.textContent = increment(count.textContent);
    animate(count, { scale: [1.35, 1], duration: 450, ease: "out(3)" });
  }
};

/**
 * @param {Window} win
 * @param {HTMLElement} street
 * @returns {SceneControl}
 */
export const startStreet = (win, street) => {
  const messages = readMessages(street);
  for (const card of all(street, ".note.is-static")) card.classList.remove("is-static");
  street.classList.add("is-live");
  const timeline = opening(street);

  let tick = 1; // the static card showed shop 1's first message
  const pingNext = () => {
    const note = nextNotification(tick, messages);
    tick += 1;
    if (note) ping(street, note);
  };
  // First ping right after the shops open, then one every few seconds.
  const loop = createTimer({ duration: NOTE_EVERY_MS, loop: true, delay: 2300, onBegin: pingNext, onLoop: pingNext });

  const car = street.querySelector("[data-car]");
  const bird = street.querySelector("[data-bird]");
  /** @type {Playable[]} */
  const ambient = [
    ...(car ? [animate(car, { x: [-140, 820], duration: 9000, ease: "linear", loop: true, loopDelay: 3500 })] : []),
    ...(bird ? [animate(bird, { x: [-80, 760], y: [60, 20, 50], duration: 7000, ease: "inOut(2)", loop: true, loopDelay: 9000, delay: 4000 })] : []),
  ];

  // Pointer depth: three layers move at different rates and the scene tilts a little.
  const scene = street.querySelector("[data-street-scene]");
  if (scene instanceof HTMLElement && win.matchMedia("(pointer: fine)").matches) {
    const layers = all(street, "[data-depth]").map((el) => ({
      depth: Number(/** @type {HTMLElement} */ (el).dataset.depth ?? "1"),
      move: createAnimatable(el, { x: 700, y: 700, ease: "out(3)" }),
    }));
    const tilt = createAnimatable(scene, { rotateX: 800, rotateY: 800, ease: "out(3)" });
    win.addEventListener(
      "pointermove",
      (event) => {
        const rect = scene.getBoundingClientRect();
        if (event.clientY > rect.bottom + 200) return;
        for (const layer of layers) {
          const offset = parallaxFor(event.clientX, event.clientY, rect, layer.depth);
          /** @type {any} */ (layer.move).x(offset.x);
          /** @type {any} */ (layer.move).y(offset.y);
        }
        const angle = tiltFor(event.clientX, event.clientY, rect);
        /** @type {any} */ (tilt).rotateX(angle.rotateX);
        /** @type {any} */ (tilt).rotateY(angle.rotateY);
      },
      { passive: true },
    );
  }

  /** @type {Playable[]} */
  const loops = [loop, ...ambient];
  let state = { userPaused: false, inView: true };
  const apply = () => {
    for (const item of loops) shouldAnimate(state) ? item.play() : item.pause();
    if (!state.userPaused) timeline.play();
    else timeline.pause();
  };

  new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (entry) {
      state = { ...state, inView: entry.isIntersecting };
      apply();
    }
  }).observe(street);

  return {
    setUserPaused: (paused) => {
      state = { ...state, userPaused: paused };
      apply();
    },
  };
};

/** The still version: open for business, one notification showing. */
export const showStillStreet = (/** @type {HTMLElement} */ street) => {
  street.classList.add("is-live");
};
