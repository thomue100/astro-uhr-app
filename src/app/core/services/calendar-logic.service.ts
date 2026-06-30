// src/app/core/services/calendar-logic.service.ts
import { Injectable, inject } from '@angular/core';
import { DataFetchService } from './data-fetch.service';
import { TranslationService } from './translation.service';

export interface CalendarResult {
  title?: string;
  dateStr: string;
  year?: string;
  dayOfWeek?: string;
  usedSB?: string;
  dailyLetter?: string;
  sundayLetterRaw?: string;
  ruleText?: string;
  countHtml?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class CalendarLogicService {
  private readonly dataService = inject(DataFetchService);
  private readonly t           = inject(TranslationService);

  private readonly dailyLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  // Wochentage immer auf Deutsch intern — Übersetzung via weekdays.*
  private readonly weekDaysDE = [
    'Sonntag', 'Montag', 'Dienstag',
    'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag',
  ];

  async calculate(simDate: Date): Promise<CalendarResult> {
    await this.dataService.preloadData();

    const calendarData = this.dataService.getCalendarData();
    const dailyData    = this.dataService.getDailyData();

    const year    = simDate.getFullYear().toString();
    const dateStr = simDate.toLocaleDateString('de-DE');

    // Wochentag: deutsch intern, dann übersetzt ausgeben
    const weekDayDE = this.weekDaysDE[simDate.getDay()];
    const dayOfWeek = this.t.translate(`weekdays.${weekDayDE}`);

    const monthStr = simDate.toLocaleDateString('de-DE', { month: 'long' });
    const day      = simDate.getDate();

    const yearInfo = calendarData[year] as Record<string, string> | undefined;
    if (!yearInfo) {
      return { error: `${this.t.translate('calendar.no_year_data')} ${year}`, dateStr };
    }

    const sundayLetterRaw: string = yearInfo['dayLetter'] ?? '';
    const dayFormatted = day.toString().padStart(2, '0');
    const monthShort   = simDate.toLocaleDateString('de-DE', { month: 'short' });
    const key          = `${dayFormatted}. ${monthShort}`;

    const dailyInfo = dailyData[key] as Record<string, string> | undefined;
    if (!dailyInfo) {
      return {
        error: `${this.t.translate('calendar.no_day_data')} ${key}`,
        dateStr,
      };
    }

    const dailyLetter: string = dailyInfo['letter'] ?? '';
    const parts = sundayLetterRaw.split(',').map(s => s.trim());

    let usedSB   = '';
    let ruleText = '';

    if (parts.length === 2) {
      const [a, b] = parts;
      if (simDate.getMonth() < 2) {
        usedSB = a;
        ruleText =
          `<strong>${this.t.translate('luebeck_rule.applied')}</strong><br>` +
          this.t.translate('luebeck_rule.uses_letters', { year, a, b }) + '<br>' +
          this.t.translate('luebeck_rule.because_before', {
            day: String(day), month: monthStr, sb: usedSB,
          });
      } else {
        usedSB = b;
        ruleText =
          `<strong>${this.t.translate('luebeck_rule.applied')}</strong><br>` +
          this.t.translate('luebeck_rule.uses_letters', { year, a, b }) + '<br>' +
          this.t.translate('luebeck_rule.because_after', {
            day: String(day), month: monthStr, sb: usedSB,
          });
      }
    } else {
      usedSB   = parts[0] ?? '';
      ruleText = this.t.translate('luebeck_rule.uniform', { year, sb: usedSB });
    }

    const sunIndex = this.dailyLetters.indexOf(usedSB);
    const dayIndex = this.dailyLetters.indexOf(dailyLetter);
    const diff     = (dayIndex - sunIndex + 7) % 7;

    // countHtml: Buchstaben mit übersetzten Wochentagsnamen
    let countHtml  = '';
    let currentIdx = sunIndex;
    for (let i = 0; i <= diff; i++) {
      const letter  = this.dailyLetters[currentIdx];
      const dayName = this.t.translate(`weekdays.${this.weekDaysDE[i]}`);
      const color   = i === 0 ? 'yellow' : i === diff ? 'cyan' : 'white';
      countHtml    += `<span class="${color}">${letter}</span> (${dayName})`;
      if (i < diff) countHtml += ' → ';
      currentIdx    = (currentIdx + 1) % 7;
    }

    return {
      title: `${this.t.translate('modal_calendar.weekday_title')} ${dateStr} 🗓️`,
      dateStr,
      year,
      dayOfWeek,
      usedSB,
      dailyLetter,
      sundayLetterRaw,
      ruleText,
      countHtml,
    };
  }
}
