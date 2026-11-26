// src/app/features/simulation-panel/simulation-panel.component.ts
import { Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ClockSimulationService, KALENDER_ANFANG, KALENDER_ENDE } from '../../core/services/clock-simulation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-simulation-panel',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, TranslatePipe],
  templateUrl: './simulation-panel.component.html',
})
export class SimulationPanelComponent {
  readonly clockService = inject(ClockSimulationService);

  readonly selectedDateTimeString = signal('');
  readonly animationSpeed         = signal(0.5);
  readonly currentDate            = this.clockService.currentDate;
  readonly isAnimationRunning     = this.clockService.isAnimationRunning;

  constructor() {
    this._syncDateTimeString(this.clockService.getCurrentDate());
    effect(() => {
      const date = this.currentDate();
      if (!this.isAnimationRunning()) {
        this._syncDateTimeString(date);
      }
    });
  }

  onDateTimeChange(): void {
    const raw = this.selectedDateTimeString();
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return;
    if (d < KALENDER_ANFANG || d > KALENDER_ENDE) return;
    if (this.clockService.isAnimationRunning()) this.clockService.stopAnimation();
    this.clockService.setDate(d);
  }

  setToCurrentTime(): void {
    if (this.clockService.isAnimationRunning()) this.clockService.stopAnimation();
    const now = new Date();
    this.clockService.setDate(now);
    this._syncDateTimeString(now);
  }

  toggleAnimation(): void {
    this.clockService.setAnimationSpeed(this.animationSpeed());
    this.clockService.toggleAnimation();
  }

  onSpeedChange(): void {
    this.clockService.setAnimationSpeed(this.animationSpeed());
  }

  private _syncDateTimeString(date: Date): void {
    const offset = date.getTimezoneOffset() * 60000;
    this.selectedDateTimeString.set(
      new Date(date.getTime() - offset).toISOString().slice(0, 16),
    );
  }
}
