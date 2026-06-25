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

function initCalendarData(): () => Promise<void> {
  const http = inject(HttpClient);
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
      TimeUtility.CalendarData = calendar;
      TimeUtility.EclipseData = eclipse;
      console.log('Astro-Uhr: Kalenderdaten erfolgreich geladen.');
    } catch (e) {
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
      deps: [],
    },
  ],
};
