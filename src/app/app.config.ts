import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { DataFetchService } from './core/services/data-fetch.service';

// Factory-Funktion für den APP_INITIALIZER
export function initializeApp(dataFetchService: DataFetchService) {
  return () => dataFetchService.preloadData();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Deine vorhandenen Konfigurationen
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    // 2. Der neue Initializer für deine Kalender-Daten
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DataFetchService],
      multi: true
    }
  ]
};
