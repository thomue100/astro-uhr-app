// src/app/features/canvas/canvas.component.ts
import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  inject,
  signal,
  effect,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { AstroConfig } from '../../shared/utils/config';
import { ImageManager } from '../../shared/utils/ImageManager';
import { ClockRenderer } from '../../shared/utils/ClockRenderer';
import { TimeUtility } from '../../shared/utils/TimeUtility';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  standalone: true,
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly clockService = inject(ClockSimulationService);

  private clockSubscription!: Subscription;
  private imageManager!: ImageManager;
  private renderer!: ClockRenderer;
  private resizeObserver!: ResizeObserver;

  // ── Integrierte Viewer-Logik ──────────────────────────────────────────────
  // Gibt an, ob die Kalender-Steuerleiste angezeigt werden soll.
  // Sie ist sichtbar, wenn die Kalenderscheibe aktiv ist.
  readonly showCalendarControls = signal(false);

  // Interner Rotations-Offset in Radiant, der per Buttons verändert wird.
  // Wird zusätzlich zum berechneten Winkel aus dem Service angewendet.
  private rotationOffset = 0;
  private readonly rotationStep = Math.PI / 24; // 7,5° pro Klick

  // Interner Zoom-Faktor (wird direkt an den Service weitergegeben).
  private currentZoom = 1.5;
  private readonly zoomStep = 0.25;
  private readonly minZoom = 0.5;
  private readonly maxZoom = 4.0;

  // ── Drag-Zustand für die Kalenderscheibe ─────────────────────────────────
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartAngle = 0;
  // Mittelpunkt des Canvas (wird beim Drag-Start berechnet)
  private canvasCenterX = 0;
  private canvasCenterY = 0;

  constructor() {
    // Reagiert auf Änderungen des astroState-Signals, um die Steuerleiste
    // ein- oder auszublenden, sobald showCalendarDisk wechselt.
    effect(() => {
      const state = this.clockService.astroState();
      const show = state.showCalendarDisk;
      this.showCalendarControls.set(show);
      if (!show) {
        // Beim Schließen der Kalenderscheibe alles zurücksetzen
        this.rotationOffset = 0;
        this.currentZoom = 1.5;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas 2D Kontext konnte nicht geladen werden.');
      return;
    }

    const zodiacData = { names: AstroConfig.zodiacData?.names ?? [] };
    this.imageManager = new ImageManager(zodiacData, AstroConfig.MOON_CYCLE_DAYS);

    this.imageManager.preloadImages().then(() => {
      this.renderer = new ClockRenderer(canvas, ctx, this.imageManager, AstroConfig);

      const container = canvas.parentElement;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        this.renderer.calculateResponsiveSize(width, height);
      }

      this.clockSubscription = this.clockService.selectedDate$.subscribe(() => {
        this.renderer.drawClock(this.clockService.astroState());
      });

      // Ersten Frame zeichnen
      this.renderer.drawClock(this.clockService.astroState());

      if (container) {
        this.resizeObserver = new ResizeObserver(entries => {
          requestAnimationFrame(() => {
            if (!entries?.length) return;
            const { width, height } = entries[0].contentRect;
            this.renderer.calculateResponsiveSize(width, height);
            this.renderer.drawClock(this.clockService.astroState());
          });
        });
        this.resizeObserver.observe(container);
      }
    });
  }

  ngOnDestroy(): void {
    this.clockSubscription?.unsubscribe();
    this.resizeObserver?.disconnect();
  }

  // ── Öffentliche Methoden für die Template-Buttons ────────────────────────

  zoomIn(): void {
    this.currentZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomStep);
    this.clockService.setCalendarZoom(this.currentZoom);
    this.clockService.triggerRedraw();
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.minZoom, this.currentZoom - this.zoomStep);
    this.clockService.setCalendarZoom(this.currentZoom);
    this.clockService.triggerRedraw();
  }

  rotateLeft(): void {
    this.rotationOffset -= this.rotationStep;
    this._applyRotation();
  }

  rotateRight(): void {
    this.rotationOffset += this.rotationStep;
    this._applyRotation();
  }

  resetView(): void {
    this.rotationOffset = 0;
    this.currentZoom = 1.5;
    this.clockService.setCalendarZoom(this.currentZoom);
    // Winkel auf den berechneten Ursprungswert zurücksetzen
    const baseAngle = TimeUtility.calculateCalendarDiskAngle(
      this.clockService.getCurrentDate()
    );
    this.clockService.setAngleCalendarDisk(baseAngle);
    this.clockService.triggerRedraw();
  }

  // ── Drag-to-Rotate auf dem Canvas ────────────────────────────────────────
  // Der Nutzer kann die Kalenderscheibe durch Ziehen auf dem Canvas drehen.

  onCanvasMouseDown(event: MouseEvent): void {
    if (!this.showCalendarControls()) return;
    this.isDragging = true;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.canvasCenterX = rect.left + rect.width / 2;
    this.canvasCenterY = rect.top + rect.height / 2;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartAngle = this.clockService.astroState().angleCalendarDisk;
    event.preventDefault();
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const angle = this._angleBetween(
      this.canvasCenterX, this.canvasCenterY,
      this.dragStartX, this.dragStartY,
      event.clientX, event.clientY
    );
    this.clockService.setAngleCalendarDisk(this.dragStartAngle + angle);
    this.clockService.triggerRedraw();
    event.preventDefault();
  }

  onCanvasMouseUp(): void {
    this.isDragging = false;
  }

  onCanvasMouseLeave(): void {
    this.isDragging = false;
  }

  onCanvasWheel(event: WheelEvent): void {
    if (!this.showCalendarControls()) return;
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  // ── Private Hilfsmethoden ────────────────────────────────────────────────

  /** Berechnet den Winkel (in Radiant), um den der Nutzer gezogen hat. */
  private _angleBetween(
    cx: number, cy: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): number {
    const a1 = Math.atan2(y1 - cy, x1 - cx);
    const a2 = Math.atan2(y2 - cy, x2 - cx);
    return a2 - a1;
  }

  /** Wendet den aktuellen rotationOffset auf den Service an. */
  private _applyRotation(): void {
    const baseAngle = TimeUtility.calculateCalendarDiskAngle(
      this.clockService.getCurrentDate()
    );
    this.clockService.setAngleCalendarDisk(baseAngle + this.rotationOffset);
    this.clockService.triggerRedraw();
  }
}
