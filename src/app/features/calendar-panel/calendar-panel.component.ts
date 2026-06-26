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

  readonly calendarInfoHtml = signal('');
  readonly eclipseInfoHtml = signal('');

  ngOnInit(): void {
    this._refreshCalendarInfo();

    // Auf Datumsänderungen reagieren (z.B. wenn Datum manuell geändert wird)
    this.dateSubscription = this.clockService.selectedDate$.subscribe(() => {
      this._refreshCalendarInfo();
    });
  }

  ngOnDestroy(): void {
    this.dateSubscription?.unsubscribe();
  }

  zoomIn(): void {
    const current = this.clockService.astroState().calendarZoom;
    this.clockService.setCalendarZoom(Math.min(3.0, current + 0.1));
    this.clockService.triggerRedraw();
  }

  zoomOut(): void {
    const current = this.clockService.astroState().calendarZoom;
    this.clockService.setCalendarZoom(Math.max(0.5, current - 0.1));
    this.clockService.triggerRedraw();
  }

  rotateLeft(): void {
    const current = this.clockService.astroState().angleCalendarDisk;
    this.clockService.setAngleCalendarDisk(current - 0.05);
    this.clockService.triggerRedraw();
  }

  rotateRight(): void {
    const current = this.clockService.astroState().angleCalendarDisk;
    this.clockService.setAngleCalendarDisk(current + 0.05);
    this.clockService.triggerRedraw();
  }

  resetCalendar(): void {
    this.clockService.setCalendarZoom(1.5);
    this.clockService.resetManualCalendarAngle();
    this.clockService.setAngleCalendarDisk(
      TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate()),
    );
    this.clockService.triggerRedraw();
  }

  private _refreshCalendarInfo(): void {
    const date = this.clockService.getCurrentDate();
    const year = date.getFullYear();

    if (isNaN(date.getTime()) || year < 1911 || year > 2080) {
      this.calendarInfoHtml.set(
        '<strong style="color:#ff5555">Ungültiges Jahr.</strong> Bitte Datum zwischen 1911 und 2080 wählen.',
      );
      this.eclipseInfoHtml.set('');
      return;
    }

    const yearInfo = TimeUtility.getCalendarInfo(year);
    const dailyInfo = TimeUtility.getDailyCalendarInfo(date);
    const dayOfWeek = TimeUtility.getDayOfWeekString(date);
    const dateStr = date.toLocaleDateString('de-DE');

    let html = `
      <strong style="color:#ffcc33;font-weight:normal">Wochentag für ${dateStr}:</strong>
      <span style="color:white;font-weight:normal"> ${dayOfWeek}</span><br>
    `;

    if (yearInfo) {
      html += `
        <strong style="color:#ffcc33;font-weight:normal">Osterdatum ${year}:</strong>
        <span style="color:white;font-weight:normal"> ${yearInfo['easterDate'] ?? '--'}</span><br>
        <strong style="color:#ffcc33;font-weight:normal">Goldene Zahl:</strong>
        <span style="color:white;font-weight:normal"> ${yearInfo['goldenNumber'] ?? '--'}</span><br>
        <strong style="color:#ffcc33;font-weight:normal">Sonntagsbuchstabe:</strong>
        <span style="color:white;font-weight:normal"> ${yearInfo['dayLetter'] ?? '--'}</span><br>
      `;
    } else {
      html += `<strong style="color:#ff5555;font-weight:normal">Jahresdaten für ${year} nicht vorhanden.</strong><br>`;
    }

    if (dailyInfo?.['letter'] !== 'N/A') {
      html += `
        <strong style="color:#ffcc33;font-weight:normal">Tagesbuchstabe:</strong>
        <span style="color:white;font-weight:normal"> ${dailyInfo?.['letter']}</span><br>
        <strong style="color:#ffcc33;font-weight:normal">Tagesheilige(r):</strong>
        <span style="color:white;font-weight:normal"> ${dailyInfo?.['saint']}</span>
      `;
    } else if (yearInfo) {
      html += `<strong style="color:#ff5555;font-weight:normal">Tagesdaten nicht vorhanden.</strong>`;
    }

    this.calendarInfoHtml.set(html);

    const eclipses = TimeUtility.getEclipseInfo(year);
    let eclHtml = `<strong style="color:#ffcc33;font-weight:normal">Finsternisse ${year}:</strong><br>`;
    if (eclipses.length > 0) {
      eclipses.forEach((e: Record<string, string>) => {
        eclHtml += `
          <span style="color:#ffcc33;font-weight:normal">• Datum:</span>
          <span style="color:white"> ${e['date']}</span><br>
          <span style="color:#ffcc33;font-weight:normal">&nbsp;&nbsp;Typ:</span>
          <span style="color:white"> ${e['type']}</span><br>
        `;
      });
    } else {
      eclHtml += `<span style="color:white;font-weight:normal">Keine Finsternisse in ${year} vorhanden.</span>`;
    }
    this.eclipseInfoHtml.set(eclHtml);
  }
}
