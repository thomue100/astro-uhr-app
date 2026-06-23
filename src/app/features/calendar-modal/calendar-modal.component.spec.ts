import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { CalendarLogicService } from '../../core/services/calendar-logic.service';
import { of } from 'rxjs';

describe('CalendarLogicService', () => {
  let service: CalendarLogicService;
  let httpClientSpy: { get: any };

  // Wasserdichte Mock-Daten, die exakt zu den String-Keys deines Services passen
  const mockCalendar = {
    '2026': { dayLetter: 'D,E' },
    '2025': { dayLetter: 'A' }
  };

  const mockDaily = {
    '14. Feb': { letter: 'C' },
    '22. Mai': { letter: 'E' }
  };

  beforeEach(() => {
    // Flexibler Spion, um URL-Pfad-Probleme in der Testumgebung zu umgehen
    httpClientSpy = {
      get: (url: string) => {
        if (url.includes('daily')) {
          return of(mockDaily);
        }
        return of(mockCalendar);
      }
    };

    TestBed.configureTestingModule({
      providers: [
        CalendarLogicService,
        { provide: HttpClient, useValue: httpClientSpy }
      ]
    });

    service = TestBed.inject(CalendarLogicService);
  });

  // --- 1. HAPPY PATHS ---

  it('should apply Lübecker Regel BEFORE March (Jan/Feb)', async () => {
    const result = await service.calculate(new Date(2026, 1, 14)); // 14. Feb 2026

    expect(result.error).toBeUndefined();
    expect(result.usedSB).toBe('D');
    expect(result.ruleText).toContain('vor dem 1. März');
  });

  it('should apply Lübecker Regel FROM March onwards', async () => {
    const result = await service.calculate(new Date(2026, 4, 22)); // 22. Mai 2026

    expect(result.error).toBeUndefined();
    expect(result.usedSB).toBe('E');
    expect(result.ruleText).toContain('nach dem 28. Februar');
  });

  it('should use single Sunday letter for standard years', async () => {
    const result = await service.calculate(new Date(2025, 4, 22)); // 22. Mai 2025

    expect(result.error).toBeUndefined();
    expect(result.usedSB).toBe('A');
    expect(result.ruleText).toContain('gilt ein einheitlicher Sonntagsbuchstabe');
  });

  // --- 2. ERROR HANDLING PATHS ---

  it('should return error if year is missing in calendar.json', async () => {
    // Für diesen Test manipulieren wir den Spy, um ein leeres Jahr zu simulieren
    httpClientSpy.get = (url: string) => {
      if (url.includes('daily')) return of(mockDaily);
      return of({}); // Leerer Kalender -> Jahr 2099 fehlt
    };

    const result = await service.calculate(new Date(2099, 0, 1));
    expect(result.error).toBe('Keine Daten für Jahr 2099');
  });

  it('should return error if day-key is missing in daily-calendar.json', async () => {
    // Ein Datum wählen, das garantiert nicht im mockDaily existiert (31. Dezember)
    const result = await service.calculate(new Date(2026, 11, 31));
    expect(result.error).toContain('Keine Tagesdaten für');
  });

  // --- 3. LOGIC / HTML GENERATION ---

  it('should correctly build countHtml structure with css classes', async () => {
    const result = await service.calculate(new Date(2026, 1, 14));

    expect(result.countHtml).toContain('class="yellow"');
    expect(result.countHtml).toContain('class="cyan"');
    expect(result.countHtml).toContain('→');
  });
});
