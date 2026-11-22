/**
 * @typedef {{ reduceMotion: boolean, saveData: boolean, finePointer: boolean, width: number }} MotionEnvironment
 * @typedef {{ cols: number, rows: number }} FieldSize
 */

/**
 * Reads the visitor's motion-related preferences. The only impure function here.
 * @param {Window} win
 * @returns {MotionEnvironment}
 */
export const readEnvironment = (win) => {
  const connection = /** @type {{ connection?: { saveData?: boolean } }} */ (win.navigator).connection;
  return {
    reduceMotion: win.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(connection?.saveData),
    finePointer: win.matchMedia("(pointer: fine)").matches,
    width: win.innerWidth,
  };
};

/**
 * How many blades to draw: fewer on small screens and data-saver connections.
 * @param {MotionEnvironment} env
 * @returns {FieldSize}
 */
export const fieldSize = (env) => {
  if (env.saveData) return { cols: 18, rows: 10 };
  if (env.width < 640) return { cols: 22, rows: 12 };
  if (env.width < 1200) return { cols: 34, rows: 16 };
  return { cols: 44, rows: 18 };
};
