import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Import der Konfiguration und Hilfsbibliotheken aus deiner Altanwendung
// Passe die relativen Pfade hier genau an deine Ordnerstruktur an!
import { AstroConfig } from '../../shared/utils/config';
import { TimeUtility, configureTimeUtility } from '../../shared/utils/TimeUtility';

@Injectable({
  providedIn: 'root'
})
export class ClockSimulationService {
  // Das reaktive Herzstück: Ein BehaviorSubject, das den aktuellen Daten-Stream verwaltet.
  // Das Canvas und die Steuerung abonnieren dieses Subject.
  private dateSource = new BehaviorSubject<Date>(new Date());
  selectedDate$ = this.dateSource.asObservable();

  // AstroState — Eins-zu-eins Strukturreplik aus deiner AstroState.js
  astroState: any = {
    angleSun: 0,
    angleMoon: 0,
    angleZodiac: 0,
    mondAlter: 1,
    mondAlterFractional: 0,
    bgInitialAngle: 0,
    useBackgroundImage: true,
    zodiacDayOffsetAngle: 0,
    showCalendarDisk: true,  // 👈 Auf true gesetzt, damit die Scheibe sofort gezeichnet wird
    showHeiland: true,       // 👈 Explizit hinzugefügt, da der Renderer dieses Flag erwartet
    calendarZoom: 1.5,
    angleCalendarDisk: 0
  };

  // Animations-Zustandswerte
  private animationFrameId: number | null = null;
  public isAnimationRunning = false;
  public animationSpeed = 0.5; // Standardgeschwindigkeit aus AstroState.js

  constructor() {
    // WICHTIG: Aus der index.html übernommen. Initialisiert die mathematischen
    // Konstanten in TimeUtility und kaskadiert diese an AstroCalc weiter.
    configureTimeUtility(AstroConfig, {});

    // 1. Zwinge den Service, sofort die korrekten Winkel für das jetzige Datum zu berechnen:
    this.updateClockCalculations(this.dateSource.value);

    // 2. Triggere danach einmalig den Stream, damit die Canvas-Komponente das statische Zeichnen anstößt:
    this.dateSource.next(this.dateSource.value);
  }

  /**
   * Liefert das aktuelle Simulationsdatum (synchroner Snapshot)
   */
  getCurrentDate(): Date {
    return this.dateSource.value;
  }

  /**
   * Setzt ein neues Simulationsdatum (z.B. durch manuellen Input oder "Aktuelle Zeit"-Button)
   */
  setDate(date: Date): void {
    // Erst berechnen, damit astroState aktuell ist, wenn das Subject feuert
    this.updateClockCalculations(date);
    this.dateSource.next(date);
  }

  /**
   * Berechnet alle astronomischen Winkel neu basierend auf dem übergebenen Datum.
   * Entspricht der mathematischen Logik aus ClockApp.js & InputController.js
   */
  public updateClockCalculations(date: Date): void {
    try {
      // 1. Sonnenwinkel berechnen
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

      // 4. Tierkreiszeichen-Offset berechnen
      this.astroState.angleZodiac = TimeUtility.calculateZodiacOffsetAngle(
        date,
        this.astroState.angleSun
      );

      // 5. Kalenderscheiben-Winkel berechnen
      this.astroState.angleCalendarDisk = TimeUtility.calculateCalendarDiskAngle(date);

    } catch (error) {
      console.warn('ClockSimulationService: Berechnungen temporär verzögert/fehlgeschlagen:', error);

      // Fallbacks im Fehlerfall, damit im Testumfeld niemals 'undefined' auftritt
      // und der Renderer nicht abstürzt:
      this.astroState.angleSun             = this.astroState.angleSun             || 0;
      this.astroState.mondAlter            = this.astroState.mondAlter            || 0;
      this.astroState.mondAlterFractional  = this.astroState.mondAlterFractional  || 0;
      this.astroState.angleMoon            = this.astroState.angleMoon            || 0;
      this.astroState.angleZodiac          = this.astroState.angleZodiac          || 0;
      this.astroState.angleCalendarDisk    = this.astroState.angleCalendarDisk    || 0;
    }
  }
  /**
   * Schaltet die Animation an oder aus (Play / Pause)
   */
  toggleAnimation(): void {
    if (this.isAnimationRunning) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  /**
   * Startet die requestAnimationFrame-Schleife für performantes Rendern
   */
  private startAnimation(): void {
    this.isAnimationRunning = true;

    const animate = () => {
      if (!this.isAnimationRunning) return;

      // Basis-Schrittberechnung bei ca. 60 FPS (16.67ms)
      const fpsIntervalMs = 1000 / 60;

      // Berechnung des Zeitfortschritts: Intervall * Reglergeschwindigkeit * Zeiteinheit
      // Ein Speed-Wert von 0.5 fügt pro Frame entsprechend viele Millisekunden hinzu
      const msToAdd = fpsIntervalMs * this.animationSpeed * 60;

      const newDate = new Date(this.getCurrentDate().getTime() + msToAdd);

      // Zustand im Service aktualisieren und Stream abfeuern
      this.setDate(newDate);

      // Schleife fortsetzen
      this.animationFrameId = requestAnimationFrame(animate);
    };

    // Ersten Animationsframe anfordern
    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stoppt die Animation und bereinigt den Frame-Handler (verhindert Memory Leaks)
   */
  stopAnimation(): void {
    this.isAnimationRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
