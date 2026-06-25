import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { HistoryModalComponent } from '../history-modal/history-modal.component';
import { InfoModalComponent } from '../info-modal/info-modal.component';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { SimulationPanelComponent } from '../simulation-panel/simulation-panel.component';
import { CalendarPanelComponent } from '../calendar-panel/calendar-panel.component';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { TimeUtility } from '../../shared/utils/TimeUtility';

type ModalType = 'info' | 'history' | 'calendar' | null;
type ActivePanel = 'simulation' | 'calendar';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    DatePipe,
    ModalComponent,
    HistoryModalComponent,
    InfoModalComponent,
    CalendarModalComponent,
    SimulationPanelComponent,
    CalendarPanelComponent,
  ],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css'],
  host: {
    '(document:keydown.escape)': 'handleEscape()',
  },
})
export class ControlsComponent {
  private readonly clockService = inject(ClockSimulationService);

  readonly activeModal = signal<ModalType>(null);
  readonly activePanel = signal<ActivePanel>('simulation');

  // Für den CalendarModal-Input
  readonly currentDate = this.clockService.currentDate;

  get isSimulationOpen(): boolean {
    return this.activePanel() === 'simulation';
  }

  get isCalendarOpen(): boolean {
    return this.activePanel() === 'calendar';
  }

  openSimulation(): void {
    if (this.activePanel() === 'simulation') return;
    this.activePanel.set('simulation');
    this.clockService.setShowCalendarDisk(false);
    this._triggerRedraw();
  }

  openCalendar(): void {
    if (this.activePanel() === 'calendar') return;
    if (this.clockService.isAnimationRunning()) {
      this.clockService.stopAnimation();
    }
    this.activePanel.set('calendar');
    this.clockService.setCalendarZoom(1.5);
    this.clockService.setAngleCalendarDisk(
      TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate()),
    );
    this.clockService.setShowCalendarDisk(true);
    this._triggerRedraw();
  }

  openModal(type: Exclude<ModalType, null>): void {
    if (this.clockService.isAnimationRunning()) {
      this.clockService.stopAnimation();
    }
    this.activeModal.set(type);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.activeModal.set(null);
    document.body.style.overflow = '';
  }

  handleEscape(): void {
    if (this.activeModal()) {
      this.closeModal();
    }
  }

  private _triggerRedraw(): void {
    this.clockService.setDate(this.clockService.getCurrentDate());
  }
}
