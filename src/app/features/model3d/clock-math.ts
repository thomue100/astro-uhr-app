// src/app/features/model3d/clock-math.ts
//
// Rechnung der Uhr nach den Zähnezahlen von Paul Behrens – ohne three.js,
// damit das Bedienfeld sie nutzen kann, ohne die 3D-Bibliothek zu laden.

export const TAU = Math.PI * 2;
export const DAY = 86_400_000;
export const HOUR = 3_600_000;

export const K_ZOD = (293 * 60) / (36 * 487);   // = 1465/1461 = 366¼ : 365¼
export const K_MOON = (298 * 45) / (40 * 347);  // = 6705/6940
const T0 = Date.UTC(2025, 10, 5, 13, 19);        // Referenz-Vollmond aus der App
const SUN0 = (TAU * (14 + 19 / 60 - 12)) / 24;   // Sonnenzeiger um 14:19 MEZ, Uhrwinkel ab Mittag oben
const ZOD0 = SUN0 + (TAU * (309 - 153)) / 365;   // 5. Nov. gegen 2. Juni (Sonne mitten im Stier)
const MOON0 = SUN0 + Math.PI;                    // Vollmond: Mond steht der Sonne gegenüber

export type ViewKey = 'start' | 'front' | 'side' | 'back';

export interface Angles { sun: number; zod: number; moon: number; }

export function angles(t: number): Angles {
  const d = (t - T0) / DAY;
  return { sun: SUN0 + TAU * d, zod: ZOD0 + TAU * d * K_ZOD, moon: MOON0 + TAU * d * K_MOON };
}

export const mod = (a: number, m: number) => ((a % m) + m) % m;
