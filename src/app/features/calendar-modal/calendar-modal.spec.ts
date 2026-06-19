import { CalendarLogicService } from '../calendar-logic.service';
import { of } from 'rxjs';

describe('CalendarLogicService', () => {

  let service: CalendarLogicService;
  let mockHttp: any;

  beforeEach(() => {

    // ✅ Mock-Daten
    const mockCalendar = {
      '2000': { dayLetter: 'D,E' },
      '2026': { dayLetter: 'D,E' }
    };

    const mockDaily = {
      '14. Feb': { letter: 'C' },
      '22. Mai': { letter: 'C' }
    };

    // ✅ HttpClient mock
    mockHttp = {
      get: (url: string) => {
        if (url.includes('calendar')) {
          return of(mockCalendar);
        }
        if (url.includes('daily')) {
          return of(mockDaily);
        }
        return of({});
      }
    };

    service = new CalendarLogicService(mockHttp);
  });

  it('should calculate weekday for 14.02.2000', async () => {
    const result = await service.calculate(new Date(2000, 1, 14));

    expect(result.dayOfWeek).toBe('Montag');
  });

  it('should calculate weekday for 22.05.2000', async () => {
    const result = await service.calculate(new Date(2000, 4, 22));

    expect(result.dayOfWeek).toBe('Montag');
  });

  it('should calculate weekday for 14.02.2026', async () => {
      const result = await service.calculate(new Date(2026, 1, 14));

      expect(result.dayOfWeek).toBe('Samstag');
  });

  it('should calculate weekday for 22.05.2026', async () => {
    const result = await service.calculate(new Date(2026, 4, 22));

    expect(result.dayOfWeek).toBe('Freitag');
  });

});
