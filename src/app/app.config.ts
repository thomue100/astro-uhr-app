import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';

import { routes } from './app.routes';
import { TimeUtility } from './shared/utils/TimeUtility';

/**
 * Lädt die drei statischen JSON-Dateien und schreibt sie in die
 * statischen Felder von TimeUtility — entspricht loadCalendarData()
 * in DataFetcher.js und dem .then()-Block in ClockApp.init().
 *
 * APP_INITIALIZER blockiert den App-Start, bis alle Daten bereit sind.
 * Damit sind DailyCalendarData, CalendarData und EclipseData garantiert
 * befüllt, bevor die erste Komponente rendert.
 */
function initCalendarData(): () => Promise<void> {
  const http = inject(HttpClient);

  return async () => {
    try {
      const [daily, calendar, eclipse] = await firstValueFrom(
        forkJoin([
          http.get<any>('data/daily-calendar.json'),
          http.get<any>('data/calendar.json'),
          http.get<any>('data/eclipse.json'),
        ])
      );

      TimeUtility.DailyCalendarData = daily;
      TimeUtility.CalendarData      = calendar;
      TimeUtility.EclipseData       = eclipse;

      console.log('Astro-Uhr: Kalenderdaten erfolgreich geladen.');
    } catch (e) {
      // Nicht fatal: App startet trotzdem, Kalender zeigt Fehlermeldungen
      console.error('Astro-Uhr: Fehler beim Laden der Kalenderdaten:', e);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initCalendarData,
      multi: true,
      // HttpClient muss vor dem Initializer verfügbar sein —
      // provideHttpClient() oben stellt das sicher
      deps: [],
    },
  ],
};
