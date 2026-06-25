import { Injectable, inject } from '@angular/core';
import { DataFetchService } from './data-fetch.service';

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

  private readonly dailyLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  private readonly weekDays = [
    'Sonntag', 'Montag', 'Dienstag',
    'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag',
  ];

  async calculate(simDate: Date): Promise<CalendarResult> {
    await this.dataService.preloadData();

    const calendarData = this.dataService.getCalendarData();
    const dailyData = this.dataService.getDailyData();

    const year = simDate.getFullYear().toString();
    const dateStr = simDate.toLocaleDateString('de-DE');
    const dayOfWeek = simDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const monthStr = simDate.toLocaleDateString('de-DE', { month: 'long' });
    const day = simDate.getDate();

    const yearInfo = calendarData[year] as Record<string, string> | undefined;
    if (!yearInfo) {
      return { error: `Keine Daten für Jahr ${year}`, dateStr };
    }

    const sundayLetterRaw: string = yearInfo['dayLetter'] ?? '';
    const dayFormatted = day.toString().padStart(2, '0');
    const monthShort = simDate.toLocaleDateString('de-DE', { month: 'short' });
    const key = `${dayFormatted}. ${monthShort}`;

    const dailyInfo = dailyData[key] as Record<string, string> | undefined;
    if (!dailyInfo) {
      return { error: `Keine Tagesdaten für ${key}`, dateStr };
    }

    const dailyLetter: string = dailyInfo['letter'] ?? '';
    const parts = sundayLetterRaw.split(',').map(s => s.trim());

    let usedSB = '';
    let ruleText = '';

    if (parts.length === 2) {
      const [a, b] = parts;
      if (simDate.getMonth() < 2) {
        usedSB = a;
        ruleText = `<strong>Lübecker Regel angewendet:</strong><br>
          Das Jahr ${year} verwendet die Buchstaben ${a} (Jan/Feb) und ${b} (ab März).<br>
          Da der ${day}. ${monthStr} vor dem 1. März liegt, gilt der Buchstabe ${usedSB}.`;
      } else {
        usedSB = b;
        ruleText = `<strong>Lübecker Regel angewendet:</strong><br>
          Das Jahr ${year} verwendet die Buchstaben ${a} (Jan/Feb) und ${b} (ab März).<br>
          Da der ${day}. ${monthStr} nach dem 28. Februar liegt, gilt der Buchstabe ${usedSB}.`;
      }
    } else {
      usedSB = parts[0] ?? '';
      ruleText = `Für das Jahr ${year} gilt ein einheitlicher Sonntagsbuchstabe: ${usedSB}.`;
    }

    const sunIndex = this.dailyLetters.indexOf(usedSB);
    const dayIndex = this.dailyLetters.indexOf(dailyLetter);
    const diff = (dayIndex - sunIndex + 7) % 7;

    let countHtml = '';
    let currentIndex = sunIndex;
    for (let i = 0; i <= diff; i++) {
      const letter = this.dailyLetters[currentIndex];
      const dayName = this.weekDays[i];
      const color = i === 0 ? 'yellow' : i === diff ? 'cyan' : 'white';
      countHtml += `<span class="${color}">${letter}</span> (${dayName})`;
      if (i < diff) countHtml += ' → ';
      currentIndex = (currentIndex + 1) % 7;
    }

    return {
      title: `Wochentags-Rechengang für den ${dateStr} 🗓️`,
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
