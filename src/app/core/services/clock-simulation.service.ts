// src/app/core/services/clock-simulation.service.ts
import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AstroConfig } from '../../shared/utils/config';
import { TimeUtility, configureTimeUtility } from '../../shared/utils/TimeUtility';
import { createAstroStateSignal } from '../../shared/models/astro-signal.signal';

/**
 * Zeitraum der Kalenderscheibe (Ortszeit): Simulation und Zeitraffer bleiben
 * innerhalb dieser Grenzen.
 */
export const KALENDER_ANFANG = new Date(1911, 0, 1, 0, 0);
export const KALENDER_ENDE = new Date(2080, 11, 31, 23, 59);

/**
 * Simulierte Millisekunden je echter Sekunde für eine Geschwindigkeitsstufe
 * (Regler 0,1–5). Entspricht dem bisherigen Tempo bei 60 Bildern pro Sekunde:
 * Stufe 0,5 ≈ 69 Min. pro Sek., Stufe 5 ≈ 11,5 Std. pro Sek.
 */
export function simulierteMsProSekunde(stufe: number): number {
  const proBild = (AstroConfig.SPEED_FACTOR * stufe * 24 * 60 * 60 * 1000) / AstroConfig.TWO_PI;
  return proBild * 60;
}

@Injectable({ providedIn: 'root' })
export class ClockSimulationService implements OnDestroy {

  private readonly _currentDate = signal<Date>(new Date());
  readonly currentDate = this._currentDate.asReadonly();

  readonly selectedDate$ = new Subject<Date>();

  private readonly _astroStore = createAstroStateSignal();
  readonly astroState = this._astroStore.state;

  readonly isAnimationRunning = signal(false);
  readonly animationSpeed = signal(0.5);

  private _manualCalendarAngle: number | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    configureTimeUtility(AstroConfig);
    this._recalculate(this._currentDate());
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    this.selectedDate$.complete();
  }

  getCurrentDate(): Date {
    return this._currentDate();
  }

  setDate(date: Date): void {
    this._recalculate(date);
    this._currentDate.set(date);
    this.selectedDate$.next(date);
  }

  triggerRedraw(): void {
    this.selectedDate$.next(this._currentDate());
  }

  setShowCalendarDisk(show: boolean): void {
    this._astroStore.update({ showCalendarDisk: show });
  }

  setCalendarZoom(zoom: number): void {
    this._astroStore.update({ calendarZoom: zoom });
  }

  setAngleCalendarDisk(angle: number): void {
    this._manualCalendarAngle = angle;
    this._astroStore.update({ angleCalendarDisk: angle });
  }

  // NEU: Offset der Kalenderscheibe setzen
  setCalendarOffset(dx: number, dy: number): void {
    this._astroStore.update({ calendarOffsetX: dx, calendarOffsetY: dy });
  }

  toggleAnimation(): void {
    this.isAnimationRunning() ? this.stopAnimation() : this._startAnimation();
  }

  setAnimationSpeed(speed: number): void {
    this.animationSpeed.set(speed);
  }

  stopAnimation(): void {
    this.isAnimationRunning.set(false);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private _startAnimation(): void {
    this.isAnimationRunning.set(true);
    let zuletzt = performance.now();
    const animate = (jetzt: number) => {
      if (!this.isAnimationRunning()) return;
      // Nach echter Zeit statt pro Bild: sonst liefe der Zeitraffer auf einem
      // 120-Hz-Bildschirm doppelt so schnell. Höchstens 0,1 s je Schritt, damit
      // nach einem Hintergrund-Tab nichts springt.
      const sekunden = Math.min(0.1, Math.max(0, (jetzt - zuletzt) / 1000));
      zuletzt = jetzt;
      const schritt = simulierteMsProSekunde(this.animationSpeed()) * sekunden;
      const newDate = new Date(this._currentDate().getTime() + schritt);
      // Die Kalenderscheibe reicht nur bis 2080: dort anhalten, statt in
      // Jahre ohne Kalenderdaten weiterzulaufen.
      if (newDate >= KALENDER_ENDE) {
        this.setDate(new Date(KALENDER_ENDE));
        this.stopAnimation();
        return;
      }
      this.setDate(newDate);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private _recalculate(date: Date): void {
    try {
      const angleSun = TimeUtility.calculateSunAngle(date);
      const moonAge = TimeUtility.calculateMoonAgeFromDate(date);
      const moonAgeFractional = typeof moonAge === 'number' ? moonAge : 0;
      const moonDiffRad = TimeUtility.calculateMoonRotationDifference(date);
      const angleMoon = TimeUtility.calculateMoonAngle(
        angleSun,
        typeof moonDiffRad === 'number' ? moonDiffRad : 0,
      );
      const angleZodiac = TimeUtility.calculateZodiacOffsetAngle(date, angleSun);

      const angleCalendarDisk =
        this._manualCalendarAngle !== null
          ? this._manualCalendarAngle
          : TimeUtility.calculateCalendarDiskAngle(date);

      this._astroStore.update({
        angleSun: typeof angleSun === 'number' ? angleSun : 0,
        mondAlterFractional: moonAgeFractional,
        mondAlter: Math.floor(moonAgeFractional) + 1,
        angleMoon,
        angleZodiac,
        angleCalendarDisk,
      });
    } catch (error) {
      console.warn('ClockSimulationService: Berechnung fehlgeschlagen:', error);
    }
  }
}
