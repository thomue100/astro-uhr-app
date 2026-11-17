// src/app/features/model3d/clock-math.ts
//
// Rechnung der Uhr nach den Zähnezahlen von Paul Behrens – ohne three.js,
// damit das Bedienfeld sie nutzen kann, ohne die 3D-Bibliothek zu laden.

export const TAU = Math.PI * 2;
export const DAY = 86_400_000;
export const HOUR = 3_600_000;

export const K_ZOD = (293 * 60) / (36 * 487);   // = 1465/1461 = 366¼ : 365¼
export const K_MOON = (298 * 45) / (40 * 347);  // = 6705/6940
export const SYNODIC = 1 / (1 - K_MOON);        // Tage
const T0 = Date.UTC(2025, 10, 5, 13, 19);        // Referenz-Vollmond aus der App
const SUN0 = (TAU * (14 + 19 / 60 - 12)) / 24;   // Sonnenzeiger um 14:19 MEZ, Uhrwinkel ab Mittag oben
const ZOD0 = SUN0 + (TAU * (309 - 153)) / 365;   // 5. Nov. gegen 2. Juni (Sonne mitten im Stier)
const MOON0 = SUN0 + Math.PI;                    // Vollmond: Mond steht der Sonne gegenüber

export type ViewKey = 'start' | 'front' | 'side' | 'back';

/** Schlüssel der 13 Sternbilder (i18n: model3d.signs.*) und ihre Breite auf der Scheibe in Grad */
const SIGNS: [string, number][] = [
  ['stier', 36.7], ['zwillinge', 27.9], ['krebs', 20.1], ['loewe', 35.7], ['jungfrau', 44.1],
  ['waage', 23.0], ['skorpion', 6.7], ['schlangentraeger', 18.6], ['schuetze', 33.4],
  ['steinbock', 27.9], ['wassermann', 24.2], ['fische', 37.2], ['widder', 24.7],
];
const SIGN_SUM = SIGNS.reduce((s, x) => s + x[1], 0);
SIGNS.forEach((s) => (s[1] *= 360 / SIGN_SUM));

export interface Angles { sun: number; zod: number; moon: number; }

export function angles(t: number): Angles {
  const d = (t - T0) / DAY;
  return { sun: SUN0 + TAU * d, zod: ZOD0 + TAU * d * K_ZOD, moon: MOON0 + TAU * d * K_MOON };
}

export const mod = (a: number, m: number) => ((a % m) + m) % m;

/** Schlüssel des Sternbilds, in dem der Sonnenzeiger gerade steht */
export function signOfSun(a: Angles): string {
  let u = mod(SIGNS[0][1] / 2 - ((a.sun - a.zod) * 360) / TAU, 360);
  for (const s of SIGNS) {
    if (u < s[1]) return s[0];
    u -= s[1];
  }
  return SIGNS[0][0];
}

const PHASES = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'];

/** Mondphase (i18n-Schlüssel unter model3d.phases.*) und Mondalter in Tagen */
export function moonPhase(a: Angles): { key: string; age: number } {
  const b = mod(a.sun - a.moon, TAU) / TAU;
  return { key: PHASES[Math.round(b * 8) % 8], age: b * SYNODIC };
}
