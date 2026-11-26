// src/app/features/model3d/clock-math.spec.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { TAU, HOUR, angles, mod, ortszeitVersatz, ausOrtszeit, alsOrtszeitText } from './clock-math';
import { calculateSunAngle, configureAstroCalc } from '../../shared/utils/AstroCalc';
import { AstroConfig } from '../../shared/utils/config';

/** Uhrzeit (Dezimalstunden), auf die der Sonnenzeiger des 3D-Modells zeigt (0 = Mittag oben). */
const stunde3d = (t: number) => mod(12 + (angles(t).sun / TAU) * 24, 24);
/** Dasselbe für die 2D-Uhr (Canvas-Winkel, −π/2 = oben). */
const stunde2d = (t: number) => mod(((calculateSunAngle(new Date(t)) + (3 * Math.PI) / 2) / TAU) * 24, 24);
/** Abstand auf dem 24-Stunden-Ring in Minuten. */
const minutenAbstand = (a: number, b: number) => Math.abs(mod(a - b + 12, 24) - 12) * 60;

describe('clock-math: Lübecker Ortszeit im 3D-Modell', () => {
  beforeAll(() => configureAstroCalc(AstroConfig));

  it('kennt MEZ und MESZ', () => {
    expect(ortszeitVersatz(Date.UTC(2026, 0, 15, 12))).toBe(HOUR);     // Winter
    expect(ortszeitVersatz(Date.UTC(2026, 6, 15, 12))).toBe(2 * HOUR); // Sommer
    // Umstellungen 2026: 29.03. 01:00 UTC und 25.10. 01:00 UTC
    expect(ortszeitVersatz(Date.UTC(2026, 2, 29, 0, 59))).toBe(HOUR);
    expect(ortszeitVersatz(Date.UTC(2026, 2, 29, 1, 0))).toBe(2 * HOUR);
    expect(ortszeitVersatz(Date.UTC(2026, 9, 25, 0, 59))).toBe(2 * HOUR);
    expect(ortszeitVersatz(Date.UTC(2026, 9, 25, 1, 0))).toBe(HOUR);
  });

  it('Sonnenzeiger steht mittags oben – im Winter wie im Sommer', () => {
    expect(minutenAbstand(stunde3d(ausOrtszeit(2026, 1, 15, 12, 0)), 12)).toBeLessThan(0.01);
    expect(minutenAbstand(stunde3d(ausOrtszeit(2026, 7, 15, 12, 0)), 12)).toBeLessThan(0.01);
  });

  it('Referenzwert unverändert: 05.11.2025 14:19 MEZ', () => {
    expect(minutenAbstand(stunde3d(Date.UTC(2025, 10, 5, 13, 19)), 14 + 19 / 60)).toBeLessThan(0.01);
  });

  it('3D-Modell und 2D-Uhr zeigen das ganze Jahr dieselbe Uhrzeit', () => {
    const start = Date.UTC(2026, 0, 1);
    let groessteAbweichung = 0;
    for (let t = start; t < start + 366 * 24 * HOUR; t += 5 * HOUR + 17 * 60_000) {
      groessteAbweichung = Math.max(groessteAbweichung, minutenAbstand(stunde3d(t), stunde2d(t)));
    }
    expect(groessteAbweichung).toBeLessThan(1); // 2D rechnet minutengenau
  });

  it('Feldtext „Uhr stellen“ ist Lübecker Ortszeit, hin und zurück', () => {
    expect(alsOrtszeitText(Date.UTC(2026, 0, 15, 11, 30))).toBe('2026-01-15T12:30');
    expect(alsOrtszeitText(Date.UTC(2026, 6, 15, 10, 30))).toBe('2026-07-15T12:30');
    for (const [j, mo, t, h, mi] of [[2026, 1, 15, 12, 30], [2026, 7, 15, 12, 30], [2026, 3, 29, 3, 0], [2026, 10, 25, 4, 0], [1965, 5, 22, 8, 15]]) {
      const text = `${j}-${String(mo).padStart(2, '0')}-${String(t).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
      expect(alsOrtszeitText(ausOrtszeit(j, mo, t, h, mi))).toBe(text);
    }
  });
});
