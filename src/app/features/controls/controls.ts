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

// Die zwei umschaltbaren Panels — nie beide gleichzeitig offen
type ActivePanel = 'simulation' | 'calendar';

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

  // Aktuelles Datum aus dem Service — Template-Binding für Liveanzeige
  selectedDate: Date = new Date();

  // Simulation startet geöffnet, Kalender geschlossen
  activePanel: ActivePanel = 'simulation';

  selectedDateTimeString = '';
  animationSpeed = 0.5;

  // HTML-Strings für die Kalenderinfo-Anzeige
  calendarInfoHtml = '';
  eclipseInfoHtml  = '';

  private dateSubscription!: Subscription;

  constructor(public clockService: ClockSimulationService) {}

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  ngOnInit(): void {
    this.selectedDate = this.clockService.getCurrentDate();
    this.updateDateTimeString();

    // Den reaktiven Stream des Service abonnieren: jedes setDate() oder
    // Animation-Tick aktualisiert selectedDate und liveDateTime im Template.
    // Den Input-String nur aktualisieren wenn keine Animation läuft,
    // damit der Input nicht bei jedem Frame flackert.
    this.dateSubscription = this.clockService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
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
  // Getter für Template-Bindings
  // -----------------------------------------------------------------------

  get isAnimationRunning(): boolean {
    return this.clockService.isAnimationRunning;
  }

  get isSimulationOpen(): boolean {
    return this.activePanel === 'simulation';
  }

  get isCalendarOpen(): boolean {
    return this.activePanel === 'calendar';
  }

  // -----------------------------------------------------------------------
  // Panel-Steuerung: Simulation ↔ Kalender (nie beide offen)
  // -----------------------------------------------------------------------

  /**
   * Öffnet das Simulations-Panel und schließt den Kalender.
   * Entspricht togglePanel('settings') in InputController.js.
   */
  openSimulation(): void {
    if (this.activePanel === 'simulation') return; // bereits offen
    this.activePanel = 'simulation';
    // Kalender-Scheibe ausblenden wenn Simulation geöffnet wird
    this.clockService.astroState.showCalendarDisk = false;
    this.triggerRedraw();
  }

  /**
   * Öffnet das Kalender-Panel und schließt die Simulation.
   * Entspricht togglePanel('calendar') in InputController.js.
   * Beim Öffnen: Animation stoppen, Kalenderinfos laden, Scheibe einblenden.
   */
  openCalendar(): void {
    if (this.activePanel === 'calendar') return; // bereits offen

    // Animation stoppen, da die Kalenderscheibe statisch ausgelesen wird
    if (this.clockService.isAnimationRunning) {
      this.clockService.stopAnimation();
    }

    this.activePanel = 'calendar';

    // Zoom und Winkel zurücksetzen — entspricht dem Reset beim Panel-Öffnen
    // in InputController.togglePanel('calendar')
    this.clockService.astroState.calendarZoom = 1.5;
    this.clockService.astroState.angleCalendarDisk =
      TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate());

    // Kalenderscheibe einblenden
    this.clockService.astroState.showCalendarDisk = true;

    this.refreshCalendarInfo();
    this.triggerRedraw();
  }

  // -----------------------------------------------------------------------
  // Modal-Steuerung
  // -----------------------------------------------------------------------

  openModal(type: Exclude<ModalType, null>): void {
    // Animation pausieren beim Öffnen eines Modals
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
  // Simulation steuern
  // -----------------------------------------------------------------------

  /**
   * Verarbeitet eine manuelle Datumseingabe. Validiert, stoppt die Animation
   * und übergibt das neue Datum an den Service.
   * Entspricht _updateSunAndRedraw() + updateSimDateFromInput() in InputController.js.
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

    if (this.clockService.isAnimationRunning) {
      this.clockService.stopAnimation();
    }

    this.clockService.setDate(d);
  }

  /**
   * Setzt die Simulation auf die aktuelle Systemzeit zurück.
   * Entspricht resetToCurrentTime() in InputController.js.
   */
  setToCurrentTime(): void {
    if (this.clockService.isAnimationRunning) {
      this.clockService.stopAnimation();
    }
    this.clockService.setDate(new Date());
    this.updateDateTimeString();
  }

  /**
   * Startet oder stoppt die Animation.
   * Entspricht toggleAnimation() in InputController.js.
   */
  toggleAnimation(): void {
    this.clockService.animationSpeed = this.animationSpeed;
    this.clockService.toggleAnimation();
  }

  /**
   * Gibt die neue Geschwindigkeit sofort an den Service weiter,
   * damit eine laufende Animation unmittelbar reagiert.
   */
  onSpeedChange(): void {
    this.clockService.animationSpeed = this.animationSpeed;
  }

  // -----------------------------------------------------------------------
  // Kalender-Anzeige
  // -----------------------------------------------------------------------

  /**
   * Liest Kalender- und Finsternisdaten aus TimeUtility und baut die
   * HTML-Strings für die Anzeige. Entspricht updateCalendarInfo() +
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

    // Finsternisse — entspricht _generateEclipseHtml() in InputController.js
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
  // Kalender-Scheibe Controls
  // Entsprechen den Event-Handlern in InputController.setup() für
  // btnZoomIn, btnZoomOut, btnRotateLeft, btnRotateRight, btnCalendarReset
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
    // Zoom und Winkel auf die korrekten Standardwerte für das aktuelle Datum
    // zurücksetzen — entspricht btnCalendarReset in InputController.setup()
    this.clockService.astroState.calendarZoom = 1.5;
    this.clockService.astroState.angleCalendarDisk =
      TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate());
    this.triggerRedraw();
  }

  // -----------------------------------------------------------------------
  // Hilfsmethoden
  // -----------------------------------------------------------------------

  /**
   * Erzeugt den datetime-local-String ohne Timezone-Versatz.
   * Entspricht _createDateString() in InputController.js.
   */
  private updateDateTimeString(): void {
    const date    = this.clockService.getCurrentDate();
    const tzOffset = date.getTimezoneOffset() * 60000;
    this.selectedDateTimeString = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
  }

  /**
   * Feuert den selectedDate$-Stream erneut ohne das Datum zu ändern,
   * damit der Canvas den aktualisierten astroState neu zeichnet.
   * Wird für Zoom/Rotate/Reset der Kalenderscheibe benötigt.
   */
  private triggerRedraw(): void {
    this.clockService.setDate(this.clockService.getCurrentDate());
  }
}
