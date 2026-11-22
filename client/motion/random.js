/**
 * Seeded pseudo-random generator (mulberry32) so the field looks the same on
 * every visit and is reproducible in tests.
 * @param {number} seed
 * @returns {() => number} returns floats in [0, 1)
 */
export const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
