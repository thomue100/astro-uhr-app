// src/app/features/calendar-panel/calendar-panel.component.ts
import { Component, inject, computed, signal, output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TimeUtility } from '../../shared/utils/TimeUtility';

@Component({
  selector: 'app-calendar-panel',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './calendar-panel.component.html',
})
export class CalendarPanelComponent implements OnInit, OnDestroy {
  private readonly clockService = inject(ClockSimulationService);
  readonly t = inject(TranslationService);

  private dateSubscription?: Subscription;

  // Signal, um ein manuelles Re-Rendering auszulösen, falls sich externe Abhängigkeiten ändern
  private readonly refreshTrigger = signal(0);

  readonly openCalendarModal = output<void>();

  // Die Berechnung erfolgt nun in einem computed-Signal
  readonly calendarInfoHtml = computed(() => {
    // Abhängigkeit registrieren
    this.refreshTrigger();

    const date = this.clockService.getCurrentDate();
    const year = date.getFullYear();

    if (isNaN(date.getTime()) || year < 1911 || year > 2080) {
      return `<p class="cal-error">${this.t.translate('calendar.invalid_year')}</p>`;
    }

    const yearInfo = TimeUtility.getCalendarInfo(year);
    const dailyInfo = TimeUtility.getDailyCalendarInfo(date);
    const dateStr = date.toLocaleDateString('de-DE');
    const eclipses = TimeUtility.getEclipseInfo(year);

    const weekdayDE = TimeUtility.getDayOfWeekString(date);
    const weekday = this.t.translate(`weekdays.${weekdayDE}`);

    let html = '<div class="cal-block">';

    html += `<div class="cal-section-title">📅 ${dateStr}</div>`;
    html += this._row(this.t.translate('calendar.weekday'), weekday);

    if (yearInfo) {
      html += `<div class="cal-divider"></div>`;
      html += `<div class="cal-section-title">📆 ${year}</div>`;
      html += this._row(this.t.translate('calendar.easter'), yearInfo['easterDate'] ?? '--');
      html += this._row(this.t.translate('calendar.golden_number'), yearInfo['goldenNumber'] ?? '--');
      html += this._row(this.t.translate('calendar.sunday_letter'), yearInfo['dayLetter'] ?? '--');
    } else {
      html += `<div class="cal-divider"></div>`;
      html += `<p class="cal-error">${this.t.translate('calendar.no_year_data')} ${year}</p>`;
    }

    if (dailyInfo?.['letter'] !== 'N/A') {
      html += this._row(this.t.translate('calendar.day_letter'), dailyInfo?.['letter'] ?? '--');
      html += this._row(this.t.translate('calendar.saint'), dailyInfo?.['saint'] ?? '--');
    }

    html += `<div class="cal-divider"></div>`;
    html += `<div class="cal-section-title">🌑 ${this.t.translate('calendar.eclipses')} ${year}</div>`;

    if (eclipses.length > 0) {
      eclipses.forEach((e: Record<string, string>) => {
        html += `
          <div class="cal-eclipse">
            <span class="cal-eclipse-type">${this._translateEclipseType(e['type'])}</span>
            <span class="cal-eclipse-date">${this._formatEclipseDate(e['date'])}</span>
          </div>`;
      });
    } else {
      html += `<div class="cal-row">
        <span class="cal-value cal-muted">
          ${this.t.translate('calendar.no_eclipses')} ${year}
        </span>
      </div>`;
    }

    html += '</div>';
    return html;
  });

  ngOnInit(): void {
    // Bei Datumswechsel das Signal aktualisieren
    this.dateSubscription = this.clockService.selectedDate$.subscribe(() => {
      this.refreshTrigger.update(n => n + 1);
    });
  }

  ngOnDestroy(): void {
    this.dateSubscription?.unsubscribe();
  }

  // Hilfsmethode für die HTML-Struktur
  private _row(label: string, value: string): string {
    return `
      <div class="cal-row">
        <span class="cal-label">${label}</span>
        <span class="cal-value">${value}</span>
      </div>`;
  }

  /**
   * Übersetzt den Finsternis-Typ aus eclipse.json (immer Deutsch) über
   * i18n-Key "eclipse_types.<Rohwert>". Fällt auf den Rohwert zurück,
   * falls kein passender Key existiert.
   */
  private _translateEclipseType(type: string): string {
    const key = `eclipse_types.${type}`;
    const translated = this.t.translate(key);
    return translated === key ? type : translated;
  }

  /**
   * Formatiert Datum/Uhrzeit aus eclipse.json. Die Rohdaten kommen in
   * zwei Varianten vor: "21.01.00 Uhr 05:45" und "21.02.08 Uhr: 04:26".
   * "Uhr" wird gemäß aktueller Sprache übersetzt, Datum/Uhrzeit bleiben
   * unverändert.
   */
  private _formatEclipseDate(raw: string): string {
    const match = raw.match(/^(\d{2}\.\d{2}\.\d{2})\s*Uhr:?\s*(\d{2}:\d{2})$/);
    if (!match) return raw;
    const [, datePart, timePart] = match;
    return this.t.translate('calendar.eclipse_date_format', { date: datePart, time: timePart });
  }
}
