import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ModalComponent } from '../../shared/modal/modal';
import { HistoryModalComponent } from '../history-modal/history-modal';
import { InfoModalComponent } from '../info-modal/info-modal';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { TimeUtility } from '../../shared/utils/TimeUtility';

type ModalType = 'info' | 'history' | 'calendar' | null;

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    HistoryModalComponent,
    InfoModalComponent,
    CalendarModalComponent,
  ],
  templateUrl: './controls.html',
  styleUrls: ['./controls.css'],
})
export class ControlsComponent implements OnInit, OnDestroy {

  activeModal: ModalType = null;

  // Spiegelt das aktuelle Datum aus dem Service wider — wird vom Template genutzt
  selectedDate: Date = new Date();

  // Simulation
  isSimulationCollapsed = false;
  // Kalender startet eingeklappt, wie in InputController.js für Desktop
  isCalendarCollapsed = true;

  selectedDateTimeString = '';
  animationSpeed = 0.5;

  // Kalenderanzeige-Werte aus TimeUtility
  calendarInfoHtml = '';
  eclipseInfoHtml  = '';

  private dateSubscription!: Subscription;

  constructor(public clockService: ClockSimulationService) {}

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  ngOnInit(): void {
    // Initialen Datetime-String aus dem Service-Datum befüllen
    this.selectedDate = this.clockService.getCurrentDate();
    this.updateDateTimeString();

    // Den reaktiven Stream des Service abonnieren: jedes setDate() oder
    // Animation-Tick aktualisiert selectedDate und liveDateTime im Template
    this.dateSubscription = this.clockService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
      // Wenn die Animation läuft, den Input nicht bei jedem Frame überschreiben
      // (würde flackern); nur aktualisieren wenn Animation gestoppt ist
      if (!this.clockService.isAnimationRunning) {
        this.updateDateTimeString();
      }
    });
  }

  ngOnDestroy(): void {
    this.clockService.stopAnimation();
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
  }

  // -----------------------------------------------------------------------
  // Getter für das Template
  // -----------------------------------------------------------------------

  get isAnimationRunning(): boolean {
    return this.clockService.isAnimationRunning;
  }

  // -----------------------------------------------------------------------
  // Modal-Steuerung
  // -----------------------------------------------------------------------

  openModal(type: Exclude<ModalType, null>): void {
    // Animation pausieren beim Öffnen eines Modals, analog zu InputController.js
    if (this.clockService.isAnimationRunning) {
      this.clockService.stopAnimation();
    }
    this.activeModal = type;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.activeModal = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.activeModal) {
      this.closeModal();
    }
  }

  // -----------------------------------------------------------------------
  // Panel-Steuerung
  // -----------------------------------------------------------------------

  toggleSimulationCollapse(): void {
    this.isSimulationCollapsed = !this.isSimulationCollapsed;
  }

  toggleCalendarCollapse(): void {
    this.isCalendarCollapsed = !this.isCalendarCollapsed;
    // Kalenderinfos aktualisieren, wenn das Panel geöffnet wird — entspricht
    // dem Aufruf von updateCalendarInfo() in InputController.togglePanel()
    if (!this.isCalendarCollapsed) {
      this.refreshCalendarInfo();
    }
  }

  // -----------------------------------------------------------------------
  // Simulation steuern
  // -----------------------------------------------------------------------

  /**
   * Wird aufgerufen wenn der Nutzer den datetime-local Input ändert.
   * Validiert das Datum und übergibt es an den Service (entspricht
   * _updateSunAndRedraw() + updateSimDateFromInput() in InputController.js).
   */
  onDateTimeChange(): void {
    if (!this.selectedDateTimeString) return;

    const d = new Date(this.selectedDateTimeString);

    if (isNaN(d.getTime())) {
      console.warn('Ungültiges Datum/Uhrzeit-Format. Eingabe wird ignoriert.');
      return;
    }

    const minDate = new Date('1911-01-01T00:00');
    const maxDate = new Date('2080-12-31T23:59');
    if (d < minDate || d > maxDate) {
      console.error('Datum liegt außerhalb des erlaubten Bereichs (1911–2080).');
      return;
    }

    // Animation stoppen wenn Nutzer manuell ein neues Datum eingibt
    if (this.clockService.isAnimationRunning) {
      this.clockService.stopAnimation();
    }

    this.clockService.setDate(d);

    // Kalenderinfos aktualisieren, falls das Panel gerade offen ist
    if (!this.isCalendarCollapsed) {
      this.refreshCalendarInfo();
    }
  }

  /**
   * Setzt die Simulation auf die aktuelle Systemzeit zurück
   * (entspricht resetToCurrentTime() in InputController.js)
   */
  setToCurrentTime(): void {
    if (this.clockService.isAnimationRunning) {
      this.clockService.stopAnimation();
    }
    const now = new Date();
    this.clockService.setDate(now);
    this.updateDateTimeString();

    if (!this.isCalendarCollapsed) {
      this.refreshCalendarInfo();
    }
  }

  /**
   * Startet oder stoppt die Animation und passt den Button-Text an.
   * Entspricht toggleAnimation() in InputController.js.
   */
  toggleAnimation(): void {
    // Geschwindigkeit vor dem Start/Fortsetzen aus dem Slider übernehmen
    this.clockService.animationSpeed = this.animationSpeed;
    this.clockService.toggleAnimation();
  }

  /**
   * Wird aufgerufen wenn der Geschwindigkeits-Slider bewegt wird.
   * Die neue Geschwindigkeit wird sofort an den Service weitergegeben,
   * damit laufende Animationen unmittelbar reagieren.
   */
  onSpeedChange(): void {
    this.clockService.animationSpeed = this.animationSpeed;
  }

  // -----------------------------------------------------------------------
  // Kalender-Anzeige
  // -----------------------------------------------------------------------

  /**
   * Liest Kalender- und Finsternisdaten aus TimeUtility und
   * baut den HTML-String, entspricht updateCalendarInfo() +
   * _generateCalendarHtml() + _generateEclipseHtml() in InputController.js.
   */
  refreshCalendarInfo(): void {
    const date = this.clockService.getCurrentDate();
    const year = date.getFullYear();

    if (isNaN(date.getTime()) || year < 1911 || year > 2080) {
      this.calendarInfoHtml = '<strong style="color:#ff5555">Ungültiges Jahr.</strong> Bitte Datum zwischen 1911 und 2080 wählen.';
      this.eclipseInfoHtml  = '';
      return;
    }

    const yearInfo  = TimeUtility.getCalendarInfo(year);
    const dailyInfo = TimeUtility.getDailyCalendarInfo(date);
    const dayOfWeek = TimeUtility.getDayOfWeekString(date);
    const dateStr   = date.toLocaleDateString('de-DE');

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

    if (dailyInfo && dailyInfo['letter'] !== 'N/A') {
      html += `
        <strong style="color:#ffcc33;font-weight:normal">Tagesbuchstabe:</strong>
        <span style="color:white;font-weight:normal"> ${dailyInfo['letter']}</span><br>
        <strong style="color:#ffcc33;font-weight:normal">Tagesheilige(r):</strong>
        <span style="color:white;font-weight:normal"> ${dailyInfo['saint']}</span>
      `;
    } else if (yearInfo) {
      html += `<strong style="color:#ff5555;font-weight:normal">Tagesdaten nicht vorhanden.</strong>`;
    }

    this.calendarInfoHtml = html;

    // Finsternisse
    const eclipses = TimeUtility.getEclipseInfo(year);
    let eclHtml = `<strong style="color:#ffcc33;font-weight:normal">Finsternisse ${year}:</strong><br>`;
    if (eclipses.length > 0) {
      eclipses.forEach((e: any) => {
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
    this.eclipseInfoHtml = eclHtml;
  }

  // -----------------------------------------------------------------------
  // Kalender-Scheibe Steuerung
  // -----------------------------------------------------------------------

  zoomIn(): void {
    this.clockService.astroState.calendarZoom =
      Math.min(3.0, (this.clockService.astroState.calendarZoom || 1.5) + 0.1);
    this.triggerRedraw();
  }

  zoomOut(): void {
    this.clockService.astroState.calendarZoom =
      Math.max(0.5, (this.clockService.astroState.calendarZoom || 1.5) - 0.1);
    this.triggerRedraw();
  }

  rotateLeft(): void {
    this.clockService.astroState.angleCalendarDisk -= 0.05;
    this.triggerRedraw();
  }

  rotateRight(): void {
    this.clockService.astroState.angleCalendarDisk += 0.05;
    this.triggerRedraw();
  }

  resetCalendar(): void {
    // Zoom und Winkel auf Standardwerte zurücksetzen —
    // entspricht dem Reset in InputController.togglePanel('calendar')
    this.clockService.astroState.calendarZoom = 1.5;
    this.clockService.astroState.angleCalendarDisk =
      TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate());
    this.triggerRedraw();
  }

  // -----------------------------------------------------------------------
  // Hilfsmethoden
  // -----------------------------------------------------------------------

  /**
   * Erzeugt einen datetime-local-String aus dem aktuellen Service-Datum.
   * Entspricht _createDateString() in InputController.js.
   */
  private updateDateTimeString(): void {
    const date = this.clockService.getCurrentDate();
    const tzOffset = date.getTimezoneOffset() * 60000;
    this.selectedDateTimeString = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
  }

  /**
   * Löst einen Redraw aus, ohne das Datum zu ändern —
   * wird für Zoom/Rotate der Kalenderscheibe benötigt.
   */
  private triggerRedraw(): void {
    // setDate mit unverändertem Datum feuert den Stream erneut
    // und der Canvas zeichnet mit dem aktualisierten astroState
    this.clockService.setDate(this.clockService.getCurrentDate());
  }
}
