/** Abstract SVG map of the OKC metro: city dots with lines drawn out from Oklahoma City. Pure. */
import { html, type Html } from "../html";

type Placement = { readonly x: number; readonly y: number; readonly label: "left" | "right" | "above" | "below" };

/** Approximate positions on a 400×300 canvas (north up), with label placement chosen to avoid overlaps. */
export const CITY_POSITIONS: Readonly<Record<string, Placement>> = {
  "Oklahoma City": { x: 200, y: 150, label: "below" },
  Edmond: { x: 214, y: 58, label: "right" },
  Norman: { x: 226, y: 268, label: "right" },
  Moore: { x: 212, y: 218, label: "right" },
  Yukon: { x: 88, y: 150, label: "left" },
  Mustang: { x: 96, y: 206, label: "left" },
  "Midwest City": { x: 282, y: 140, label: "right" },
  "Del City": { x: 258, y: 182, label: "right" },
  Bethany: { x: 146, y: 128, label: "above" },
  Piedmont: { x: 92, y: 70, label: "left" },
};

const LABEL_OFFSET: Readonly<Record<Placement["label"], { dx: number; dy: number; anchor: string }>> = {
  right: { dx: 11, dy: 4, anchor: "start" },
  left: { dx: -11, dy: 4, anchor: "end" },
  above: { dx: 0, dy: -12, anchor: "middle" },
  below: { dx: 0, dy: 24, anchor: "middle" },
};

const HUB = "Oklahoma City";

export const metroMap = (cities: readonly string[]): Html => {
  const hub = CITY_POSITIONS[HUB] ?? { x: 200, y: 150, label: "below" };
  const placed = cities.flatMap((name) => {
    const position = CITY_POSITIONS[name];
    return position ? [{ name, ...position }] : [];
  });
  return html`<svg class="metro-map" viewBox="0 20 400 280" role="img" aria-labelledby="metro-map-title">
  <title id="metro-map-title">Map of the Oklahoma City metro showing the cities I serve</title>
  <g class="metro-map__roads" aria-hidden="true">
    ${placed
      .filter((city) => city.name !== HUB)
      .map((city) => html`<path class="metro-map__road" d="M${hub.x} ${hub.y} L${city.x} ${city.y}"/>`)}
  </g>
  <g class="metro-map__cities">
    ${placed.map(
      (city) => {
        const offset = LABEL_OFFSET[city.label];
        return html`<g class="metro-map__city${city.name === HUB ? " is-hub" : ""}">
      <circle cx="${city.x}" cy="${city.y}" r="${city.name === HUB ? 7 : 4}"/>
      <text x="${city.x + offset.dx}" y="${city.y + offset.dy}" text-anchor="${offset.anchor}">${city.name}</text>
    </g>`;
      },
    )}
  </g>
</svg>`;
};
