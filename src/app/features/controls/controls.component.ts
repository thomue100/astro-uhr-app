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
import { Model3dPanelComponent } from '../model3d/model3d-panel.component';
import { Model3dStateService } from '../../core/services/model3d-state.service';
import { AnsichtService } from '../../core/services/ansicht.service';

type ModalType = 'info' | 'history' | 'calendar' | null;

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
  readonly ansicht = inject(AnsichtService);

  readonly activeModal  = signal<ModalType>(null);
  readonly currentDate  = this.clockService.currentDate;

  get isSimulationOpen(): boolean { return this.ansicht.panel() === 'simulation'; }
  get isCalendarOpen():   boolean { return this.ansicht.panel() === 'calendar'; }

  openSimulation(): void { this.ansicht.schalteSimulation(); }
  openCalendar():   void { this.ansicht.schalteKalender(); }

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
  open3d():  void { this.ansicht.oeffne3d(); }
  close3d(): void { this.ansicht.schliesse3d(); }

  handleEscape(): void {
    if (this.activeModal()) this.closeModal();
    else if (this.m3d.active()) this.close3d();
  }
}
