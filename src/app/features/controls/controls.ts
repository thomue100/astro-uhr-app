import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal';
import { HistoryModalComponent } from '../history-modal/history-modal';
import { InfoModalComponent } from '../info-modal/info-modal';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';

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
    CalendarModalComponent
  ],
  templateUrl: './controls.html',
  styleUrls: ['./controls.css']
})
export class ControlsComponent implements OnInit, OnDestroy {
  activeModal: ModalType = null;
  selectedDate = new Date();
  easterDate: Date = new Date();

  // Simulation
  isSimulationCollapsed = false;
  selectedDateTimeString: string = '';
  animationSpeed: number = 0.5;
  isAnimationRunning = false;

  // Kalender
  isCalendarCollapsed: boolean = false;

  constructor(private clockService: ClockSimulationService) {}

  ngOnInit(): void {
    // Abonniere Änderungen vom Service, damit Canvas und Controls synchron sind
    this.clockService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
      this.isAnimationRunning = this.clockService.isAnimationRunning;
      this.updateDateTimeString();
    });

    this.setToCurrentTime();
    this.calculateEaster();
  }

  ngOnDestroy(): void {
    // Unsubscribe ist hier meist nicht nötig, da der Service als Singleton
    // und die Komponente beim Destroy-Lifecycle aufräumt, aber halte es im Blick.
  }

  // --- MODAL-STEUERUNG ---
  openModal(type: Exclude<ModalType, null>) {
    this.activeModal = type;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.activeModal = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.activeModal) {
      this.closeModal();
    }
  }

  // --- SIMULATION-LOGIK ---
  toggleSimulationCollapse(): void {
    this.isSimulationCollapsed = !this.isSimulationCollapsed;
  }

  setToCurrentTime(): void {
    this.clockService.setDate(new Date());
  }

  onDateTimeChange(): void {
    if (this.selectedDateTimeString) {
      this.clockService.setDate(new Date(this.selectedDateTimeString));
    }
  }

  private updateDateTimeString(): void {
    const tzOffset = this.selectedDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(this.selectedDate.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    this.selectedDateTimeString = localISOTime;
  }

  toggleAnimation(): void {
    this.clockService.animationSpeed = this.animationSpeed;
    this.clockService.toggleAnimation();
    this.isAnimationRunning = this.clockService.isAnimationRunning;
  }

  // --- KALENDER-LOGIK ---
  toggleCalendarCollapse(): void {
    this.isCalendarCollapsed = !this.isCalendarCollapsed;
  }

  zoomIn(): void { /* Service-Aufruf */ }
  zoomOut(): void { /* Service-Aufruf */ }
  rotateLeft(): void { /* Service-Aufruf */ }
  rotateRight(): void { /* Service-Aufruf */ }
  resetCalendar(): void { /* Service-Aufruf */ }

  private calculateEaster(): void {
    const year = this.selectedDate.getFullYear();
    const f = Math.floor,
          c = year / 100,
          n = year - 19 * f(year / 19),
          k = f((c - 17) / 25),
          i = c - f(c / 4) - f((c - k) / 3) + 19 * n + 15,
          l = i - 30 * f(i / 30);
    const p = l - f(l / 28) * (1 - f(l / 28) * f(29 / (l + 1)) * f((21 - n) / 11));
    this.easterDate = new Date(year, 3, p + 28 - f((year + f(year / 4) + p + 2) % 7));
  }
}
