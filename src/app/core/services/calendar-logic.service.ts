import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataFetchService } from './data-fetch.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarLogicService {

  private dailyLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  private weekDays = [
    'Sonntag', 'Montag', 'Dienstag',
    'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'
  ];

  // Korrekte Injektion beider Services
  constructor(
    private http: HttpClient,
    private dataService: DataFetchService
  ) {}

  async calculate(simDate: Date) {

    // 1. Sicherstellen, dass Daten geladen sind
    await this.dataService.preloadData();

    // 2. Daten abrufen
    const calendarData = this.dataService.getCalendarData();
    const dailyData = this.dataService.getDailyData();

    // 3. Variablen EINMALIG definieren (Fehler behoben)
    const year = simDate.getFullYear().toString();
    const dateStr = simDate.toLocaleDateString('de-DE');
    const dayOfWeek = simDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const monthStr = simDate.toLocaleDateString('de-DE', { month: 'long' });
    const day = simDate.getDate();

    // 4. Jahr prüfen
    const yearInfo = calendarData[year];
    if (!yearInfo) {
      return {
        error: `Keine Daten für Jahr ${year}`,
        dateStr
      };
    }

    const sundayLetterRaw: string = yearInfo.dayLetter;

    // 5. Tagesdaten bestimmen (Format "06. Jan")
    const dayFormatted = simDate.getDate().toString().padStart(2, '0');
    const monthShort = simDate.toLocaleDateString('de-DE', { month: 'short' });
    const key = `${dayFormatted}. ${monthShort}`;

    const dailyInfo = dailyData[key];

    if (!dailyInfo) {
      return {
        error: `Keine Tagesdaten für ${key}`,
        dateStr
      };
    }

    const dailyLetter: string = dailyInfo.letter;

    // 6. Sonntagsbuchstaben bestimmen
    const parts = sundayLetterRaw.split(',').map((s: string) => s.trim());

    let usedSB = '';
    let ruleText = '';

    if (parts.length === 2) {
      const a = parts[0];
      const b = parts[1];

      if (simDate.getMonth() < 2) {
        usedSB = a;
        ruleText = `
          <strong>Lübecker Regel angewendet:</strong><br>
          Das Jahr ${year} verwendet die Buchstaben ${a} (Jan/Feb) und ${b} (ab März).<br>
          Da der ${day}. ${monthStr} vor dem 1. März liegt, gilt der Buchstabe ${usedSB}.
        `;
      } else {
        usedSB = b;
        ruleText = `
          <strong>Lübecker Regel angewendet:</strong><br>
          Das Jahr ${year} verwendet die Buchstaben ${a} (Jan/Feb) und ${b} (ab März).<br>
          Da der ${day}. ${monthStr} nach dem 28. Februar liegt, gilt der Buchstabe ${usedSB}.
        `;
      }
    } else if (parts.length === 1) {
      usedSB = parts[0];
      ruleText = `
        Für das Jahr ${year} gilt ein einheitlicher Sonntagsbuchstabe: ${usedSB}.
      `;
    }

    // 7. Zählung berechnen
    const sunIndex = this.dailyLetters.indexOf(usedSB);
    const dayIndex = this.dailyLetters.indexOf(dailyLetter);

    const diff = (dayIndex - sunIndex + 7) % 7;

    let countHtml = '';
    let currentIndex = sunIndex;

    for (let i = 0; i <= diff; i++) {
      const letter = this.dailyLetters[currentIndex];
      const dayName = this.weekDays[i];

      const color =
        i === 0 ? 'yellow' :
        i === diff ? 'cyan' :
        'white';

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
      countHtml
    };
  }
}
