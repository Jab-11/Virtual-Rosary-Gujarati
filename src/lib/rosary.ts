import data from "@/data/rosary.json";

import joyful from "@/assets/joyful.jpg";
import sorrowful from "@/assets/sorrowful.jpg";
import glorious from "@/assets/glorious.jpg";
import luminous from "@/assets/luminous.jpg";

export const artwork: Record<string, string> = { joyful, sorrowful, glorious, luminous };

export type Theme = (typeof data.sets)[number]["theme"];
export type MysterySet = (typeof data.sets)[number];
export type Mystery = (typeof data.mysteries)[keyof typeof data.mysteries][number];
export type Mysteries = Record<string, Mystery[]>;

export const rosaryData = data;

export function getSet(id: string): MysterySet {
  return data.sets.find((s) => s.id === id) ?? data.sets[0]!;
}

export function mysteriesFor(id: string): Mystery[] {
  return (data.mysteries as Mysteries)[id] ?? [];
}

/* ---------------------------------------------------------------- geometry */

export type Point = { x: number; y: number };

const A = 300;
const B = 258;

function curve(theta: number): Point {
  const f = 1 + 0.075 * Math.sin(3 * theta + 0.6) + 0.05 * Math.cos(2 * theta - 0.35);
  return { x: A * f * Math.cos(theta), y: B * f * Math.sin(theta) };
}

/** Dense closed path for the loop chain. */
export const loopPath = (() => {
  const pts: string[] = [];
  const n = 480;
  for (let i = 0; i <= n; i++) {
    const p = curve((i / n) * Math.PI * 2 + Math.PI / 2);
    pts.push(`${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
})();

export type BeadKind = "cross" | "medal" | "ourFather" | "hailMary";
export type Bead = { id: string; kind: BeadKind; x: number; y: number; angle: number };

const SLOTS = 56; // 55 loop beads + the medal slot

export const medalPoint: Point = curve(Math.PI / 2);

/** 5 decades of (1 Our Father + 10 Hail Mary) laid along the loop. */
export const loopBeads: Bead[] = (() => {
  const beads: Bead[] = [];
  let slot = 1;
  for (let d = 0; d < 5; d++) {
    for (let i = 0; i < 11; i++) {
      const theta = Math.PI / 2 + (slot / SLOTS) * Math.PI * 2;
      const p = curve(theta);
      const next = curve(theta + 0.02);
      beads.push({
        id: i === 0 ? `d${d}-of` : `d${d}-hm${i}`,
        kind: i === 0 ? "ourFather" : "hailMary",
        x: p.x,
        y: p.y,
        angle: (Math.atan2(next.y - p.y, next.x - p.x) * 180) / Math.PI,
      });
      slot++;
    }
  }
  return beads;
})();

/** Pendant hanging from the medal: Our Father, 3 Hail Mary, Our Father, Cross. */
const pendantSpec: { id: string; kind: BeadKind; dy: number }[] = [
  { id: "p-of1", kind: "ourFather", dy: 56 },
  { id: "p-hm1", kind: "hailMary", dy: 104 },
  { id: "p-hm2", kind: "hailMary", dy: 146 },
  { id: "p-hm3", kind: "hailMary", dy: 188 },
  { id: "p-of2", kind: "ourFather", dy: 240 },
  { id: "cross", kind: "cross", dy: 320 },
];

export const pendantBeads: Bead[] = pendantSpec.map((s) => ({
  id: s.id,
  kind: s.kind,
  x: medalPoint.x + Math.sin(s.dy / 150) * 16,
  y: medalPoint.y + s.dy,
  angle: 0,
}));

export const pendantPath = (() => {
  const pts = [medalPoint, ...pendantBeads.map((b) => ({ x: b.x, y: b.y }))];
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
})();

/* ----------------------------------------------------------------- sequence */

export type Step =
  | { type: "bead"; beadId: string; decade: number | null }
  | { type: "mystery"; decade: number };

export function buildSequence(): Step[] {
  const steps: Step[] = [];
  for (const b of [...pendantBeads].reverse()) {
    steps.push({ type: "bead", beadId: b.id, decade: null });
  }
  steps.push({ type: "bead", beadId: "medal", decade: null });
  for (let d = 0; d < 5; d++) {
    steps.push({ type: "mystery", decade: d });
    steps.push({ type: "bead", beadId: `d${d}-of`, decade: d });
    for (let i = 1; i <= 10; i++) {
      steps.push({ type: "bead", beadId: `d${d}-hm${i}`, decade: d });
    }
  }
  return steps;
}

export const sequence = buildSequence();

/** Order of every bead as it is prayed — used to derive done / active / idle. */
export const beadOrder: string[] = sequence
  .filter((s): s is Extract<Step, { type: "bead" }> => s.type === "bead")
  .map((s) => s.beadId);

export type DecadeProgress = { index: number; total: number };

/** Position of a Hail Mary bead within its decade, e.g. bead 7 of 10. Null for any other bead. */
export function decadeProgress(beadId: string | null): DecadeProgress | null {
  if (!beadId) return null;
  const match = beadId.match(/^d\d+-hm(\d+)$/);
  if (!match) return null;
  return { index: Number(match[1]), total: data.rosary.beadsPerDecade };
}
 