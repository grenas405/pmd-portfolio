/**
 * Pure helpers for the Main Street animation: which shop pings next, what it
 * says, and how far each depth layer moves with the pointer.
 */

/**
 * The notification shown on the given tick: shops take turns, and each shop
 * cycles through its own messages. Pure.
 * @param {number} tick 0, 1, 2, …
 * @param {ReadonlyArray<ReadonlyArray<string>>} messages one list per shop
 * @returns {{ shop: number, text: string } | null}
 */
export const nextNotification = (tick, messages) => {
  const shops = messages.length;
  if (shops === 0) return null;
  const shop = tick % shops;
  const list = messages[shop] ?? [];
  if (list.length === 0) return null;
  const text = list[Math.floor(tick / shops) % list.length] ?? "";
  return { shop, text };
};

/**
 * Pointer position mapped to a layer offset in pixels; deeper layers move
 * more. Pure and bounded.
 * @param {number} x @param {number} y pointer position
 * @param {{ left: number, top: number, width: number, height: number }} rect the scene's box
 * @param {number} depth 0 (far) … ~1.5 (near)
 * @param {number} [range] maximum offset in px at depth 1
 */
export const parallaxFor = (x, y, rect, depth, range = 14) => {
  const nx = Math.max(-0.5, Math.min(0.5, (x - rect.left) / Math.max(rect.width, 1) - 0.5));
  const ny = Math.max(-0.5, Math.min(0.5, (y - rect.top) / Math.max(rect.height, 1) - 0.5));
  return { x: nx * 2 * range * depth, y: ny * 2 * range * depth * 0.6 };
};

/**
 * The street's 3D tilt toward the pointer, in degrees. Pure.
 * @param {number} x @param {number} y
 * @param {{ left: number, top: number, width: number, height: number }} rect
 */
export const tiltFor = (x, y, rect) => {
  const { x: dx, y: dy } = parallaxFor(x, y, rect, 1, 1);
  return { rotateY: dx * 5, rotateX: -dy * 4 };
};

/** Increments a displayed counter value. Pure. @param {string | null} text */
export const increment = (text) => String((Number.parseInt(text ?? "0", 10) || 0) + 1);
