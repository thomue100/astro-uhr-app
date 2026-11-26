// src/app/core/services/ansicht.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { ClockSimulationService } from './clock-simulation.service';
import { Model3dStateService } from './model3d-state.service';
import { TimeUtility } from '../../shared/utils/TimeUtility';

export type Panel = 'simulation' | 'calendar' | 'none';
export type Ansicht = 'uhr' | 'kalender' | 'modell3d';

/**
 * Was im Rahmen der Uhr zu sehen ist – Zifferblatt, Kalenderscheibe oder
 * 3D-Modell – und welches Menü-Panel offen ist. Gemeinsamer Zustand für das
 * Menü (app-controls) und den sichtbaren Umschalter über dem Rahmen
 * (app-canvas), damit beide immer dasselbe anzeigen.
 *
 * Die Kalenderscheibe hängt am Kalender-Panel: Panel offen = Scheibe sichtbar.
 */
@Injectable({ providedIn: 'root' })
export class AnsichtService {
  private readonly clock = inject(ClockSimulationService);
  private readonly m3d = inject(Model3dStateService);

  readonly panel = signal<Panel>('simulation');

  readonly ansicht = computed<Ansicht>(() =>
    this.m3d.active() ? 'modell3d' : this.panel() === 'calendar' ? 'kalender' : 'uhr',
  );

  /** Umschalter über dem Rahmen */
  waehle(ziel: Ansicht): void {
    if (ziel === this.ansicht()) return;
    if (ziel === 'modell3d') { this.oeffne3d(); return; }
    this.m3d.close();
    if (ziel === 'kalender') this.zeigeKalender();
    else this.zeigeUhr('simulation');
  }

  /** Menüpunkt „Simulation“: auf- bzw. zuklappen, Zifferblatt zeigen */
  schalteSimulation(): void {
    this.zeigeUhr(this.panel() === 'simulation' ? 'none' : 'simulation');
  }

  /** Menüpunkt „Kalender“: aufklappen = Kalenderscheibe, zuklappen = Zifferblatt */
  schalteKalender(): void {
    if (this.panel() === 'calendar') this.zeigeUhr('none');
    else this.zeigeKalender();
  }

  oeffne3d(): void {
    if (this.clock.isAnimationRunning()) this.clock.stopAnimation();
    this.clock.setShowCalendarDisk(false);
    this.clock.triggerRedraw();
    this.m3d.open(this.clock.getCurrentDate());
  }

  /** „Zurück zur Uhr“ – mit dem zuvor offenen Panel (ggf. wieder mit Kalenderscheibe) */
  schliesse3d(): void {
    this.m3d.close();
    if (this.panel() === 'calendar') {
      this.clock.setShowCalendarDisk(true);
      this.clock.triggerRedraw();
    }
  }

  private zeigeUhr(panel: Exclude<Panel, 'calendar'>): void {
    this.panel.set(panel);
    this.clock.setShowCalendarDisk(false);
    this.clock.triggerRedraw();
  }

  private zeigeKalender(): void {
    if (this.clock.isAnimationRunning()) this.clock.stopAnimation();
    this.panel.set('calendar');
    this.clock.setCalendarZoom(1.5);
    this.clock.setAngleCalendarDisk(TimeUtility.calculateCalendarDiskAngle(this.clock.getCurrentDate()));
    this.clock.setShowCalendarDisk(true);
    this.clock.triggerRedraw();
  }
}
