// src/app/features/controls/controls.component.ts
import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { HistoryModalComponent } from '../history-modal/history-modal.component';
import { InfoModalComponent } from '../info-modal/info-modal.component';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal.component';
import { SimulationPanelComponent } from '../simulation-panel/simulation-panel.component';
import { CalendarPanelComponent } from '../calendar-panel/calendar-panel.component';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TimeUtility } from '../../shared/utils/TimeUtility';
import { Model3dPanelComponent } from '../model3d/model3d-panel.component';
import { Model3dStateService } from '../../core/services/model3d-state.service';

type ModalType = 'info' | 'history' | 'calendar' | null;
type ActivePanel = 'simulation' | 'calendar' | 'none';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    DatePipe,
    TranslatePipe,
    ModalComponent,
    HistoryModalComponent,
    InfoModalComponent,
    CalendarModalComponent,
    SimulationPanelComponent,
    CalendarPanelComponent,
    Model3dPanelComponent,
  ],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css'],
  host: {
    '(document:keydown.escape)': 'handleEscape()',
  },
})
export class ControlsComponent {
  private readonly clockService = inject(ClockSimulationService);
  readonly t = inject(TranslationService);
  readonly m3d = inject(Model3dStateService);

  readonly activeModal  = signal<ModalType>(null);
  readonly activePanel  = signal<ActivePanel>('simulation');
  readonly currentDate  = this.clockService.currentDate;

  get isSimulationOpen(): boolean { return this.activePanel() === 'simulation'; }
  get isCalendarOpen():   boolean { return this.activePanel() === 'calendar'; }

  openSimulation(): void {
    if (this.activePanel() === 'simulation') {
      this.activePanel.set('none');
      this.clockService.setShowCalendarDisk(false);
      this.clockService.triggerRedraw();
      return;
    }
    this.activePanel.set('simulation');
    this.clockService.setShowCalendarDisk(false);
    this.clockService.triggerRedraw();
  }

  openCalendar(): void {
    if (this.activePanel() === 'calendar') {
      this.activePanel.set('none');
      this.clockService.setShowCalendarDisk(false);
      this.clockService.triggerRedraw();
      return;
    }
    if (this.clockService.isAnimationRunning()) this.clockService.stopAnimation();
    this.activePanel.set('calendar');
    this.clockService.setCalendarZoom(1.5);
    this.clockService.setAngleCalendarDisk(
      TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate()),
    );
    this.clockService.setShowCalendarDisk(true);
    this.clockService.triggerRedraw();
  }

  openModal(type: Exclude<ModalType, null>): void {
    if (this.clockService.isAnimationRunning()) this.clockService.stopAnimation();
    this.activeModal.set(type);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.activeModal.set(null);
    document.body.style.overflow = '';
  }

  /** 3D-Modell im Rahmen der Uhr zeigen; das Bedienfeld ersetzt das Menü */
  open3d(): void {
    if (this.clockService.isAnimationRunning()) this.clockService.stopAnimation();
    this.clockService.setShowCalendarDisk(false);
    this.clockService.triggerRedraw();
    this.m3d.open(this.clockService.getCurrentDate());
  }

  /** Zurück zur Uhr – mit dem zuvor offenen Panel (ggf. wieder mit Kalenderscheibe) */
  close3d(): void {
    this.m3d.close();
    if (this.activePanel() === 'calendar') {
      this.clockService.setShowCalendarDisk(true);
      this.clockService.triggerRedraw();
    }
  }

  handleEscape(): void {
    if (this.activeModal()) this.closeModal();
    else if (this.m3d.active()) this.close3d();
  }
}
