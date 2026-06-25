import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TimeUtility } from '../../shared/utils/TimeUtility';

@Injectable({ providedIn: 'root' })
export class DataFetchService {
  private readonly http = inject(HttpClient);
  private readonly loaded = signal(false);

  async preloadData(): Promise<void> {
    if (this.loaded()) return;
    try {
      const [cal, daily, eclipse] = await Promise.all([
        firstValueFrom(this.http.get<Record<string, unknown>>('data/calendar.json')),
        firstValueFrom(this.http.get<Record<string, unknown>>('data/daily-calendar.json')),
        firstValueFrom(this.http.get<Record<string, unknown>>('data/eclipse.json')),
      ]);
      TimeUtility.CalendarData = cal;
      TimeUtility.DailyCalendarData = daily;
      TimeUtility.EclipseData = eclipse;
      this.loaded.set(true);
    } catch (error) {
      console.error('DataFetchService: Fehler beim Laden:', error);
    }
  }

  getCalendarData(): Record<string, unknown> {
    return TimeUtility.CalendarData as Record<string, unknown>;
  }

  getDailyData(): Record<string, unknown> {
    return TimeUtility.DailyCalendarData as Record<string, unknown>;
  }
}
