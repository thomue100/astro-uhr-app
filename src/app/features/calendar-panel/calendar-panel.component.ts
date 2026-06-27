import { Component, inject, signal, output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { TimeUtility } from '../../shared/utils/TimeUtility';

@Component({
  selector: 'app-calendar-panel',
  standalone: true,
  imports: [],
  templateUrl: './calendar-panel.component.html',
})
export class CalendarPanelComponent implements OnInit, OnDestroy {
  private readonly clockService = inject(ClockSimulationService);
  private dateSubscription?: Subscription;

  readonly openCalendarModal = output<void>();

  // Ein einziger HTML-Block für alle Kalender-Infos
  readonly calendarInfoHtml = signal('');

  ngOnInit(): void {
    this._refreshCalendarInfo();
    this.dateSubscription = this.clockService.selectedDate$.subscribe(() => {
      this._refreshCalendarInfo();
    });
  }

  ngOnDestroy(): void {
    this.dateSubscription?.unsubscribe();
  }

  private _row(label: string, value: string): string {
    return `
      <div class="cal-row">
        <span class="cal-label">${label}</span>
        <span class="cal-value">${value}</span>
      </div>`;
  }

  private _refreshCalendarInfo(): void {
    const date = this.clockService.getCurrentDate();
    const year = date.getFullYear();

    if (isNaN(date.getTime()) || year < 1911 || year > 2080) {
      this.calendarInfoHtml.set(
        '<p class="cal-error">Ungültiges Jahr. Bitte Datum zwischen 1911 und 2080 wählen.</p>',
      );
      return;
    }

    const yearInfo   = TimeUtility.getCalendarInfo(year);
    const dailyInfo  = TimeUtility.getDailyCalendarInfo(date);
    const dayOfWeek  = TimeUtility.getDayOfWeekString(date);
    const dateStr    = date.toLocaleDateString('de-DE');
    const eclipses   = TimeUtility.getEclipseInfo(year);

    let html = '<div class="cal-block">';

    // ── Abschnitt: Datum & Wochentag ────────────────────────────────────────
    html += `<div class="cal-section-title">📅 ${dateStr}</div>`;
    html += this._row('Wochentag', dayOfWeek);

    // ── Abschnitt: Jahresdaten ──────────────────────────────────────────────
    if (yearInfo) {
      html += `<div class="cal-divider"></div>`;
      html += `<div class="cal-section-title">📆 Jahr ${year}</div>`;
      html += this._row('Osterdatum',         yearInfo['easterDate']  ?? '--');
      html += this._row('Goldene Zahl',       yearInfo['goldenNumber'] ?? '--');
      html += this._row('Sonntagsbuchstabe',  yearInfo['dayLetter']   ?? '--');
    } else {
      html += `<div class="cal-divider"></div>`;
      html += `<p class="cal-error">Jahresdaten für ${year} nicht vorhanden.</p>`;
    }

    // ── Abschnitt: Tagesdaten ───────────────────────────────────────────────
    if (dailyInfo && dailyInfo['letter'] !== 'N/A') {
      html += this._row('Tagesbuchstabe',  dailyInfo['letter']);
      html += this._row('Tagesheilige(r)', dailyInfo['saint']);
    }

    // ── Abschnitt: Finsternisse ─────────────────────────────────────────────
    html += `<div class="cal-divider"></div>`;
    html += `<div class="cal-section-title">🌑 Finsternisse ${year}</div>`;

    if (eclipses.length > 0) {
      eclipses.forEach((e: Record<string, string>) => {
        html += `
          <div class="cal-eclipse">
            <span class="cal-eclipse-type">${e['type']}</span>
            <span class="cal-eclipse-date">${e['date']}</span>
          </div>`;
      });
    } else {
      html += `<div class="cal-row"><span class="cal-value cal-muted">Keine Finsternisse in ${year}</span></div>`;
    }

    html += '</div>'; // .cal-block
    this.calendarInfoHtml.set(html);
  }
}
