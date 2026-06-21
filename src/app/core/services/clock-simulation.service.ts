import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AstroConfig } from '../../shared/utils/config';
import { TimeUtility, configureTimeUtility } from '../../shared/utils/TimeUtility';

@Injectable({
  providedIn: 'root'
})
export class ClockSimulationService implements OnDestroy {

  // Reaktiver Stream: Canvas und Controls abonnieren diesen
  private dateSource = new BehaviorSubject<Date>(new Date());
  selectedDate$ = this.dateSource.asObservable();

  // AstroState — spiegelt AstroState.js wider
  astroState: any = {
    angleSun: 0,
    angleMoon: 0,
    angleZodiac: 0,
    mondAlter: 1,
    mondAlterFractional: 0,
    bgInitialAngle: 0,
    useBackgroundImage: true,
    zodiacDayOffsetAngle: 0,
    showCalendarDisk: false,
    showHeiland: true,
    calendarZoom: 1.5,
    angleCalendarDisk: 0
  };

  // Animationszustand
  private animationFrameId: number | null = null;
  public isAnimationRunning = false;
  public animationSpeed = 0.5;

  constructor() {
    // Konfiguriert TimeUtility und kaskadiert an AstroCalc — entspricht dem
    // Aufruf in der alten index.html vor dem Starten der ClockApp
    configureTimeUtility(AstroConfig, {});

    // Initialen Zustand für das aktuelle Datum berechnen und einmalig publishen,
    // damit der Canvas beim ersten Rendern korrekte Winkel vorfindet
    this.updateClockCalculations(this.dateSource.value);
    this.dateSource.next(this.dateSource.value);
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  /**
   * Liefert das aktuelle Simulationsdatum (synchroner Snapshot)
   */
  getCurrentDate(): Date {
    return this.dateSource.value;
  }

  /**
   * Setzt ein neues Simulationsdatum und triggert den Redraw-Stream.
   * Wird sowohl vom manuellen Input als auch von der Animationsschleife gerufen.
   */
  setDate(date: Date): void {
    // Erst Winkel berechnen, dann publishen — so hat der Canvas beim Subscribe
    // bereits den aktuellen astroState und muss nicht ein Frame warten
    this.updateClockCalculations(date);
    this.dateSource.next(date);
  }

  /**
   * Berechnet alle astronomischen Winkel für das übergebene Datum und
   * schreibt sie in astroState. Entspricht _updateAstroStateAngles()
   * aus InputController.js sowie der Logik in ClockApp.animate().
   */
  public updateClockCalculations(date: Date): void {
    try {
      // 1. Sonnenwinkel (bestimmt die angezeigte Uhrzeit)
      const angleSun = TimeUtility.calculateSunAngle(date);
      this.astroState.angleSun = typeof angleSun === 'number' ? angleSun : 0;

      // 2. Mondalter berechnen — WICHTIG: calculateMoonAgeFromDate gibt eine
      // einfache number zurück (nicht {age, fractional} wie der alte Service
      // fälschlicherweise annahm). Der ganzzahlige Anteil bestimmt das
      // Mondphasenbild (Index 0..29), der Bruchteil wird für Animationen genutzt.
      const moonAge = TimeUtility.calculateMoonAgeFromDate(date);
      const moonAgeFractional = typeof moonAge === 'number' ? moonAge : 0;
      this.astroState.mondAlterFractional = moonAgeFractional;
      this.astroState.mondAlter = Math.floor(moonAgeFractional) + 1;

      // 3. Rotationsdifferenz des Mondes und finalen Mondwinkel berechnen
      const moonDiffRad = TimeUtility.calculateMoonRotationDifference(date);
      this.astroState.angleMoon = TimeUtility.calculateMoonAngle(
        this.astroState.angleSun,
        typeof moonDiffRad === 'number' ? moonDiffRad : 0
      );

      // 4. Tierkreiszeichen-Offset: kombiniert Tagesposition im Jahr mit
      // aktuellem Sonnenwinkel, damit die Scheibe zur richtigen Jahreszeit
      // auf das richtige Sternbild zeigt
      this.astroState.angleZodiac = TimeUtility.calculateZodiacOffsetAngle(
        date,
        this.astroState.angleSun
      );

      // 5. Kalenderscheiben-Winkel (Bruchteil des Jahres → Winkel 0..2π)
      this.astroState.angleCalendarDisk = TimeUtility.calculateCalendarDiskAngle(date);

    } catch (error) {
      console.warn('ClockSimulationService: Berechnungen temporär verzögert/fehlgeschlagen:', error);

      // Fallbacks im Fehlerfall, damit im Testumfeld niemals 'undefined' auftritt
      // und der Renderer nicht abstürzt
      this.astroState.angleSun             = this.astroState.angleSun             || 0;
      this.astroState.mondAlter            = this.astroState.mondAlter            || 0;
      this.astroState.mondAlterFractional  = this.astroState.mondAlterFractional  || 0;
      this.astroState.angleMoon            = this.astroState.angleMoon            || 0;
      this.astroState.angleZodiac          = this.astroState.angleZodiac          || 0;
      this.astroState.angleCalendarDisk    = this.astroState.angleCalendarDisk    || 0;
    }
  }

  /**
   * Startet oder stoppt die Animation (entspricht toggleAnimation()
   * in InputController.js und der animate()-Schleife in ClockApp.js)
   */
  toggleAnimation(): void {
    if (this.isAnimationRunning) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  /**
   * Animationsschleife mit requestAnimationFrame — entspricht ClockApp.animate().
   * Der Zeitfortschritt pro Frame wird aus SPEED_FACTOR, animationSpeed und
   * TWO_PI skaliert, damit die Verhältnisse zur alten App identisch bleiben.
   */
  private startAnimation(): void {
    this.isAnimationRunning = true;

    const animate = () => {
      if (!this.isAnimationRunning) return;

      const baseSpeed = AstroConfig.SPEED_FACTOR * this.animationSpeed;

      // Simulierten Zeitfortschritt in Millisekunden pro Frame berechnen —
      // exakt wie in ClockApp.animate(): ein voller Umlauf (2π) entspricht 24h
      const simulatedMsPerFrame = baseSpeed * 24 * 60 * 60 * 1000 / AstroConfig.TWO_PI;

      const newDate = new Date(this.getCurrentDate().getTime() + simulatedMsPerFrame);

      // setDate() berechnet die Winkel und feuert den Stream
      this.setDate(newDate);

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stoppt die Animation und bereinigt den Frame-Handler (verhindert Memory Leaks)
   */
  stopAnimation(): void {
    this.isAnimationRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
