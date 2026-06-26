// src/app/core/services/clock-simulation.service.ts
import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AstroConfig } from '../../shared/utils/config';
import { TimeUtility, configureTimeUtility } from '../../shared/utils/TimeUtility';
import { createAstroStateSignal } from '../../shared/models/astro-signal.signal';

@Injectable({ providedIn: 'root' })
export class ClockSimulationService implements OnDestroy {

  // --- Signals ---
  private readonly _currentDate = signal<Date>(new Date());
  readonly currentDate = this._currentDate.asReadonly();

  // Subject statt toObservable — feuert immer, auch bei gleichem Datum
  readonly selectedDate$ = new Subject<Date>();

  private readonly _astroStore = createAstroStateSignal();
  readonly astroState = this._astroStore.state;

  readonly isAnimationRunning = signal(false);
  readonly animationSpeed = signal(0.5);

  // Merkt sich, ob der Winkel manuell gesetzt wurde (Rotate-Buttons)
  private _manualCalendarAngle: number | null = null;

  private animationFrameId: number | null = null;

  constructor() {
    configureTimeUtility(AstroConfig, {});
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

  /**
   * Löst ein Canvas-Redraw aus, ohne das Datum zu ändern.
   * Wird genutzt wenn nur Store-Werte (zoom, angle, showCalendarDisk) geändert wurden.
   */
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

  resetManualCalendarAngle(): void {
    this._manualCalendarAngle = null;
  }

  updateAstroStatePatch(patch: Parameters<typeof this._astroStore.update>[0]): void {
    this._astroStore.update(patch);
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
    const animate = () => {
      if (!this.isAnimationRunning()) return;
      const baseSpeed = AstroConfig.SPEED_FACTOR * this.animationSpeed();
      const simulatedMsPerFrame =
        (baseSpeed * 24 * 60 * 60 * 1000) / AstroConfig.TWO_PI;
      const newDate = new Date(this._currentDate().getTime() + simulatedMsPerFrame);
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
