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

// ── Lübecker Ortszeit ───────────────────────────────────────────────────
// Die echte Uhr in St. Marien wird zur Sommerzeit eine Stunde vorgestellt.
// Dabei dreht sich das ganze Räderwerk mit – Sonne, Tierkreis und Mond.
const ZONE = 'Europe/Berlin';
const zeitTeile = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONE, hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
});

interface Wanduhr { j: number; mo: number; t: number; h: number; mi: number; }

function wanduhr(t: number): Wanduhr {
  const p: Record<string, string> = {};
  for (const x of zeitTeile.formatToParts(new Date(t))) p[x.type] = x.value;
  return { j: +p['year'], mo: +p['month'], t: +p['day'], h: +p['hour'], mi: +p['minute'] };
}

// Pro Stunde einmal rechnen genügt (Umstellung immer zur vollen Stunde);
// die Animation fragt bis zu 60-mal pro Sekunde.
let cacheStunde = NaN;
let cacheVersatz = HOUR;

/** Abstand der Lübecker Ortszeit zu UTC in ms: 1 h (MEZ) bzw. 2 h (MESZ). */
export function ortszeitVersatz(t: number): number {
  const stunde = Math.floor(t / HOUR);
  if (stunde !== cacheStunde) {
    const w = wanduhr(stunde * HOUR);
    cacheVersatz = Date.UTC(w.j, w.mo - 1, w.t, w.h, w.mi) - stunde * HOUR;
    cacheStunde = stunde;
  }
  return cacheVersatz;
}

/** Wanduhrzeit in Lübeck → Zeitpunkt (ms, UTC). */
export function ausOrtszeit(j: number, mo: number, t: number, h: number, mi: number): number {
  const soll = Date.UTC(j, mo - 1, t, h, mi);
  let ts = soll - HOUR;
  for (let i = 0; i < 3; i++) {
    const w = wanduhr(ts);
    ts += soll - Date.UTC(w.j, w.mo - 1, w.t, w.h, w.mi);
  }
  return ts;
}

/** Zeitpunkt → "JJJJ-MM-TTTHH:MM" in Lübecker Ortszeit (Format von datetime-local). */
export function alsOrtszeitText(t: number): string {
  const w = wanduhr(t), p = (n: number) => String(n).padStart(2, '0');
  return `${w.j}-${p(w.mo)}-${p(w.t)}T${p(w.h)}:${p(w.mi)}`;
}

/**
 * Stellung von Sonne, Tierkreis und Mond zum Zeitpunkt t (ms, UTC), so wie
 * die nach Lübecker Ortszeit gestellte Uhr sie zeigt. Die Referenzwerte
 * oben gelten für MEZ; in der Sommerzeit steht das Werk eine Stunde weiter.
 */
export function angles(t: number): Angles {
  const d = (t + ortszeitVersatz(t) - HOUR - T0) / DAY;
  return { sun: SUN0 + TAU * d, zod: ZOD0 + TAU * d * K_ZOD, moon: MOON0 + TAU * d * K_MOON };
}

export const mod = (a: number, m: number) => ((a % m) + m) % m;
