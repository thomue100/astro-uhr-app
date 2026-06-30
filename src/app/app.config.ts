// src/app/app.config.ts
import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { firstValueFrom, forkJoin } from 'rxjs';

import { routes } from './app.routes';
import { TimeUtility } from './shared/utils/TimeUtility';
import { TranslationService } from './core/services/translation.service';

/** Lädt Kalender-JSONs und beide Sprach-Dateien parallel beim App-Start */
function initApp(): () => Promise<void> {
  const http = inject(HttpClient);
  const t    = inject(TranslationService);
  return async () => {
    try {
      const [daily, calendar, eclipse] = await firstValueFrom(
        forkJoin([
          http.get<Record<string, unknown>>('data/daily-calendar.json'),
          http.get<Record<string, unknown>>('data/calendar.json'),
          http.get<Record<string, unknown>>('data/eclipse.json'),
        ]),
      );
      TimeUtility.DailyCalendarData = daily;
      TimeUtility.CalendarData      = calendar;
      TimeUtility.EclipseData       = eclipse;
    } catch (e) {
      console.error('Fehler beim Laden der Kalenderdaten:', e);
    }
    // Übersetzungsdateien laden (parallel zu den Kalender-Daten)
    await t.loadAll();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [],
    },
  ],
};
