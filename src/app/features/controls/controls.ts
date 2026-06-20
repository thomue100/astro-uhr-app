import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal';
import { HistoryModalComponent } from '../history-modal/history-modal';
import { InfoModalComponent } from '../info-modal/info-modal';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal';

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
  easterDate: Date = new Date(); // Platzhalter für Kalender-Logik

  // Simulation
  isSimulationCollapsed = false;
  selectedDateTimeString: string = '';
  animationSpeed: number = 0.5;
  isAnimationRunning = false;
  private animationIntervalId: any = null;

  // Kalender
  isCalendarCollapsed: boolean = false;

  ngOnInit(): void {
    this.setToCurrentTime();
    this.calculateEaster();
  }

  ngOnDestroy(): void {
    this.stopAnimation();
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
    this.selectedDate = new Date();
    this.updateDateTimeString();
  }

  onDateTimeChange(): void {
    if (this.selectedDateTimeString) {
      this.selectedDate = new Date(this.selectedDateTimeString);
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
    if (this.isAnimationRunning) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  private startAnimation(): void {
    this.isAnimationRunning = true;
    this.animationIntervalId = setInterval(() => {
      const msToAdd = (50 * this.animationSpeed) * 60;
      this.selectedDate = new Date(this.selectedDate.getTime() + msToAdd);
      this.updateDateTimeString();
    }, 50);
  }

  private stopAnimation(): void {
    this.isAnimationRunning = false;
    if (this.animationIntervalId) {
      clearInterval(this.animationIntervalId);
      this.animationIntervalId = null;
    }
  }

  // --- KALENDER-LOGIK ---
  toggleCalendarCollapse(): void {
    this.isCalendarCollapsed = !this.isCalendarCollapsed;
  }

  zoomIn(): void { /* Hier Renderer-Aufruf einfügen, z.B. this.renderer.zoom(1.1) */ }
  zoomOut(): void { /* Hier Renderer-Aufruf einfügen */ }
  rotateLeft(): void { /* Hier Renderer-Aufruf einfügen */ }
  rotateRight(): void { /* Hier Renderer-Aufruf einfügen */ }
  resetCalendar(): void { /* Hier Renderer-Aufruf einfügen */ }

  private calculateEaster(): void {
    const year = this.selectedDate.getFullYear();
    // Vereinfachte Osterformel als Platzhalter
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
