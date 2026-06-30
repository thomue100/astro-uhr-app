import { TestBed } from '@angular/core/testing';
import { ClockSimulationService } from './clock-simulation.service';
import {
  TimeUtility,
  configureTimeUtility,
} from '../../shared/utils/TimeUtility';
import { AstroConfig } from '../../shared/utils/config';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

describe('ClockSimulationService', () => {
  let service: ClockSimulationService;

  beforeEach(() => {
    // Statische Daten-Mocks vorbereiten
    TimeUtility.DailyCalendarData = {};
    TimeUtility.CalendarData = {};
    TimeUtility.EclipseData = {};

    // Mathematische Konfiguration initialisieren
    configureTimeUtility(AstroConfig, {});

    TestBed.configureTestingModule({
      providers: [ClockSimulationService],
    });

    service = TestBed.inject(ClockSimulationService);
  });

  afterEach(() => {
    service.stopAnimation();
  });

  it('sollte den Service erfolgreich erstellen', () => {
    expect(service).toBeTruthy();
  });

  it('sollte einen initialen AstroState mit Winkeln bereitstellen', () => {
    const state = service.astroState();

    expect(state).toBeDefined();
    expect(typeof state.angleSun).toBe('number');
    expect(typeof state.angleMoon).toBe('number');
    expect(typeof state.angleZodiac).toBe('number');
    expect(state.mondAlter).toBeGreaterThanOrEqual(0);
  });

  it('sollte das Datum manuell aktualisieren und Winkel neu berechnen', () => {
    const testDate = new Date('2026-03-21T12:00:00');

    service.setDate(testDate);

    expect(service.getCurrentDate().getTime()).toBe(
      testDate.getTime(),
    );

    const firstState = service.astroState();
    const sunAngleFirst = firstState.angleSun;

    expect(typeof sunAngleFirst).toBe('number');

    const newTestDate = new Date('2026-03-21T00:00:00');

    service.setDate(newTestDate);

    const secondState = service.astroState();

    expect(secondState.angleSun).not.toBe(
      sunAngleFirst,
    );
  });

  it('sollte Animation starten und stoppen', () => {
    expect(service.isAnimationRunning()).toBe(false);

    service.toggleAnimation();

    expect(service.isAnimationRunning()).toBe(true);

    service.toggleAnimation();

    expect(service.isAnimationRunning()).toBe(false);
  });

  it('sollte die Simulationszeit bei aktiver Animation kontinuierlich hochzählen', async () => {
    const startDate = new Date('2026-06-01T12:00:00');

    service.setDate(startDate);

    service.toggleAnimation();

    expect(service.isAnimationRunning()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const dateAfterAnimation = service.getCurrentDate();

    expect(dateAfterAnimation.getTime()).toBeGreaterThan(
      startDate.getTime(),
    );

    service.toggleAnimation();

    expect(service.isAnimationRunning()).toBe(false);
  });

  it('sollte den AstroState nach Datumsänderung aktualisieren', () => {
    service.setDate(new Date('2026-01-01'));

    const state1 = service.astroState();

    service.setDate(new Date('2026-06-01'));

    const state2 = service.astroState();

    expect(state2.angleSun).not.toBe(state1.angleSun);
  });
/*
  it('sollte den Stream über selectedDate$ bei Datumsänderung triggern', async () => {
    const targetDate = new Date('2026-12-24T18:00:00');

    const emittedDate = await new Promise<Date>((resolve) => {
      const subscription = service.selectedDate$.subscribe((date) => {
        if (date.getTime() === targetDate.getTime()) {
          subscription.unsubscribe();
          resolve(date);
        }
      });

      service.setDate(targetDate);
    });

    expect(emittedDate.getTime()).toBe(
      targetDate.getTime()
    );
  });
*/
});
