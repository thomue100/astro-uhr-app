// src/app/features/calendar-panel/calendar-panel.component.ts
import { Component, inject, computed, signal, output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { SymbolComponent } from '../../shared/symbol/symbol.component';
import { TimeUtility } from '../../shared/utils/TimeUtility';

@Component({
  selector: 'app-calendar-panel',
  standalone: true,
  imports: [TranslatePipe, SymbolComponent],
  templateUrl: './calendar-panel.component.html',
})
export class CalendarPanelComponent implements OnInit, OnDestroy {
  private readonly clockService = inject(ClockSimulationService);
  readonly t = inject(TranslationService);

  private dateSubscription?: Subscription;

  // Signal, um ein manuelles Re-Rendering auszulösen, falls sich externe Abhängigkeiten ändern
  private readonly refreshTrigger = signal(0);

  readonly openCalendarModal = output<void>();

  /**
   * Kalenderübersicht als Liste „Bezeichnung – Wert“. Die Begriffe stehen
   * sichtbar da: Tooltips (title) gibt es auf Touch-Geräten nicht, und gerade
   * dort – mit dem Handy vor der echten Uhr – wird das Panel genutzt.
   */
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
    const eclipses = TimeUtility.getEclipseInfo(year);

    const weekdayDE = TimeUtility.getDayOfWeekString(date);
    const weekdayFull = this.t.translate(`weekdays.${weekdayDE}`);
    const dateCompact = this._formatDateCompact(date);

    /** Eine Zeile „Bezeichnung – Wert“ der Liste. */
    const wert = (schluessel: string, inhalt: string) =>
      `<div class="cal-wert"><dt>${this.t.translate(schluessel)}</dt><dd>${inhalt}</dd></div>`;

    let html = '<div class="cal-compact">';

    // Datum mit ausgeschriebenem Wochentag
    html += `<div class="cal-line cal-date">${weekdayFull}, ${dateCompact}</div>`;

    // Jahres- und Tagesangaben
    if (yearInfo) {
      html += '<dl class="cal-werte">';
      html += wert('calendar.easter', yearInfo['easterDate'] ?? '–');
      html += wert('calendar.golden_number', yearInfo['goldenNumber'] ?? '–');
      html += wert('calendar.sunday_letter', yearInfo['dayLetter'] ?? '–');
      if (dailyInfo?.['letter'] && dailyInfo['letter'] !== 'N/A') {
        html += wert('calendar.day_letter', dailyInfo['letter']);
      }
      if (dailyInfo?.['letter'] !== 'N/A' && dailyInfo?.['saint']) {
        html += wert('calendar.saint', dailyInfo['saint']);
      }
      html += '</dl>';
    } else {
      html += `<p class="cal-error">${this.t.translate('calendar.no_year_data')} ${year}</p>`;
    }

    // Finsternisse mit sichtbarer Art (Sonne/Mond, partiell/total)
    html += '<div class="cal-divider"></div>';
    html += `<div class="cal-line cal-eclipse-title">${this.t.translate('calendar.eclipses')} ${year}</div>`;

    if (eclipses.length > 0) {
      html += '<ul class="cal-finsternisse">';
      eclipses.forEach((e: Record<string, string>) => {
        const icon = this._eclipseIcon(e['type']);
        const fullType = this._translateEclipseType(e['type']);
        const compactDate = this._formatEclipseCompact(e['date']);
        html += `<li class="cal-eclipse-compact"><span class="cal-finsternis-art"><span aria-hidden="true">${icon}</span> ${fullType}</span>`
          + `<span class="cal-finsternis-zeit">${compactDate}</span></li>`;
      });
      html += '</ul>';
    } else {
      html += `<div class="cal-line cal-muted">${this.t.translate('calendar.no_eclipses')} ${year}</div>`;
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

  /** dd.MM.yyyy, unabhängig von Locale-Eigenheiten der Browser. */
  private _formatDateCompact(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  /**
   * Symbol basierend auf dem (immer deutschen) Rohwert aus eclipse.json.
   * Analog zur Kalenderscheibe: Sonne = Sonnenfinsternis, Mond = Mondfinsternis.
   * Unterscheidet bewusst nicht zwischen partiell/total (siehe Tooltip dafür).
   */
  private _eclipseIcon(type: string): string {
    // Per CSS gezeichnet (styles.css, .fs-symbol): [innerHTML] entfernt SVG, Emoji sehen je System anders aus
    return type.includes('Sonnenfinsternis') ? '<span class="fs-symbol fs-sonne"></span>' : '<span class="fs-symbol fs-mond"></span>';
  }

  /**
   * Übersetzt den vollen Finsternis-Typ für den Tooltip
   * (z.B. "Partielle Sonnenfinsternis" / "Partial Solar Eclipse").
   */
  private _translateEclipseType(type: string): string {
    const key = `eclipse_types.${type}`;
    const translated = this.t.translate(key);
    return translated === key ? type : translated;
  }

  /**
   * Kompaktes Datum/Uhrzeit ohne Jahr (steht bereits in der Überschrift)
   * und ohne "Uhr"/"at" - reine Zahlen, durch Tooltip weiterhin erklärt.
   */
  private _formatEclipseCompact(raw: string): string {
    const match = raw.match(/^(\d{2})\.(\d{2})\.\d{2}\s*Uhr:?\s*(\d{2}:\d{2})$/);
    if (!match) return raw;
    const [, day, month, time] = match;
    return `${day}.${month}. ${time}`;
  }
}
