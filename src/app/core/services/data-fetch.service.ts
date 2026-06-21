import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TimeUtility } from '../../shared/utils/TimeUtility';

@Injectable({
  providedIn: 'root'
})
export class DataFetchService {

  constructor(private http: HttpClient) {}

  /**
   * Lädt alle notwendigen Kalender-JSON-Daten einmalig vom Server
   * und initialisiert die statischen Felder der TimeUtility.
   */
  async preloadData(): Promise<void> {
    // Nur laden, wenn die Daten in der TimeUtility noch nicht befüllt sind
    if (!TimeUtility.CalendarData || Object.keys(TimeUtility.CalendarData).length === 0) {
      try {
        const [cal, daily, eclipse] = await Promise.all([
          firstValueFrom(this.http.get('data/calendar.json')),
          firstValueFrom(this.http.get('data/daily-calendar.json')),
          firstValueFrom(this.http.get('data/eclipse.json'))
        ]);

        // Daten direkt in die statischen Felder der TimeUtility schreiben
        TimeUtility.CalendarData = cal;
        TimeUtility.DailyCalendarData = daily;
        TimeUtility.EclipseData = eclipse;

        console.log('Kalenderdaten erfolgreich geladen und initialisiert.');
      } catch (error) {
        console.error('Fehler beim Vorladen der Kalenderdaten:', error);
        // Optional: Hier kannst du eine globale Fehlerbehandlung anstoßen
      }
    }
  }

  // Diese Methoden fehlten deinem Service
  getCalendarData() {
    return TimeUtility.CalendarData;
  }

  getDailyData() {
    return TimeUtility.DailyCalendarData;
  }
}
