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

/**
 * Interaktionsmodi für die Kalenderscheibe.
 *
 *  rotate – Mausrad / Ein-Finger-Wischen dreht die Scheibe
 *  pan    – Linke Maustaste / Ein-Finger-Wischen verschiebt die Scheibe
 *
 * Zwei Finger (Touch) können immer gleichzeitig zoomen UND verschieben.
 */
type InteractionMode = 'rotate' | 'pan';

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

  // ── UI-Zustand ────────────────────────────────────────────────────────────
  readonly showCalendarControls = signal(false);
  // Aktiver Modus: 'rotate' oder 'pan'
  readonly interactionMode = signal<InteractionMode>('rotate');

  // ── Zoom ──────────────────────────────────────────────────────────────────
  private currentZoom    = 1.5;
  private readonly zoomStep = 0.25;
  private readonly minZoom  = 0.5;
  private readonly maxZoom  = 4.0;

  // ── Rotation ──────────────────────────────────────────────────────────────
  private rotationOffset    = 0;
  private readonly rotationStep = Math.PI / 24; // 7.5° per click

  // ── Pan-Offset (Verschiebung der Scheibenmitte) ───────────────────────────
  private panOffsetX = 0;
  private panOffsetY = 0;

  // ── Maus-Drag ─────────────────────────────────────────────────────────────
  private isDragging     = false;
  // Für Rotate-Drag
  private dragStartAngle    = 0;
  private dragBaseRotation  = 0;
  // Für Pan-Drag
  private dragStartX = 0;
  private dragStartY = 0;
  private dragBasePanX = 0;
  private dragBasePanY = 0;

  // ── Touch-Gesten ──────────────────────────────────────────────────────────
  private isTouchActive      = false;
  private isTwoFingerGesture = false;

  // Ein-Finger
  private lastTouchAngle = 0;  // für Rotate-Modus
  private lastTouchX     = 0;  // für Pan-Modus
  private lastTouchY     = 0;

  // Zwei-Finger
  private lastPinchDist       = 0;
  private lastTwoFingerAngle  = 0;
  private lastTwoFingerCenterX = 0;
  private lastTwoFingerCenterY = 0;

  constructor() {
    effect(() => {
      const state = this.clockService.astroState();
      const show  = state.showCalendarDisk;
      this.showCalendarControls.set(show);
      if (!show) {
        // Alles zurücksetzen wenn Kalender-Panel geschlossen
        this.rotationOffset = 0;
        this.currentZoom    = 1.5;
        this.panOffsetX     = 0;
        this.panOffsetY     = 0;
        this.interactionMode.set('rotate');
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx    = canvas.getContext('2d');
    if (!ctx) { console.error('Canvas 2D Kontext nicht verfügbar.'); return; }

    const zodiacData  = { names: AstroConfig.zodiacData?.names ?? [] };
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

  // ── Modus-Umschalter (Template-Button) ───────────────────────────────────

  setMode(mode: InteractionMode): void {
    this.interactionMode.set(mode);
  }

  // ── Zoom-Buttons ──────────────────────────────────────────────────────────

  zoomIn(): void {
    this.currentZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomStep);
    this._pushZoom();
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.minZoom, this.currentZoom - this.zoomStep);
    this._pushZoom();
  }

  // ── Rotations-Buttons ─────────────────────────────────────────────────────

  rotateLeft(): void {
    this.rotationOffset -= this.rotationStep;
    this._applyRotation();
  }

  rotateRight(): void {
    this.rotationOffset += this.rotationStep;
    this._applyRotation();
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  resetView(): void {
    this.rotationOffset = 0;
    this.currentZoom    = 1.5;
    this.panOffsetX     = 0;
    this.panOffsetY     = 0;
    this.clockService.setCalendarZoom(this.currentZoom);
    this.clockService.setCalendarOffset(0, 0);
    const baseAngle = TimeUtility.calculateCalendarDiskAngle(
      this.clockService.getCurrentDate()
    );
    this.clockService.setAngleCalendarDisk(baseAngle);
    this.clockService.triggerRedraw();
  }

  // ── Maus-Events ───────────────────────────────────────────────────────────

  onCanvasMouseDown(event: MouseEvent): void {
    if (!this.showCalendarControls()) return;
    this.isDragging = true;

    if (this.interactionMode() === 'rotate') {
      const c = this._canvasCenter();
      this.dragStartAngle   = Math.atan2(event.clientY - c.y, event.clientX - c.x);
      this.dragBaseRotation = this.clockService.astroState().angleCalendarDisk;
    } else {
      this.dragStartX   = event.clientX;
      this.dragStartY   = event.clientY;
      this.dragBasePanX = this.panOffsetX;
      this.dragBasePanY = this.panOffsetY;
    }
    event.preventDefault();
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    if (this.interactionMode() === 'rotate') {
      const c            = this._canvasCenter();
      const currentAngle = Math.atan2(event.clientY - c.y, event.clientX - c.x);
      const delta        = currentAngle - this.dragStartAngle;
      this.clockService.setAngleCalendarDisk(this.dragBaseRotation + delta);
    } else {
      this.panOffsetX = this.dragBasePanX + (event.clientX - this.dragStartX);
      this.panOffsetY = this.dragBasePanY + (event.clientY - this.dragStartY);
      this.clockService.setCalendarOffset(this.panOffsetX, this.panOffsetY);
    }
    this.clockService.triggerRedraw();
    event.preventDefault();
  }

  onCanvasMouseUp(): void {
    if (this.isDragging && this.interactionMode() === 'rotate') {
      // Offset für Buttons synchron halten
      this._syncRotationOffset();
    }
    this.isDragging = false;
  }

  onCanvasMouseLeave(): void {
    this.onCanvasMouseUp();
  }

  onCanvasWheel(event: WheelEvent): void {
    if (!this.showCalendarControls()) return;
    event.preventDefault();
    event.deltaY < 0 ? this.zoomIn() : this.zoomOut();
  }

  // ── Touch-Events ──────────────────────────────────────────────────────────

  onCanvasTouchStart(event: TouchEvent): void {
    if (!this.showCalendarControls()) return;
    event.preventDefault();
    this.isTouchActive = true;

    if (event.touches.length === 1) {
      this.isTwoFingerGesture = false;
      const t = event.touches[0];

      if (this.interactionMode() === 'rotate') {
        const c = this._canvasCenter();
        this.lastTouchAngle = Math.atan2(t.clientY - c.y, t.clientX - c.x);
      } else {
        this.lastTouchX = t.clientX;
        this.lastTouchY = t.clientY;
      }
    } else if (event.touches.length === 2) {
      this.isTwoFingerGesture = true;
      this.lastPinchDist        = this._touchDist(event.touches);
      this.lastTwoFingerAngle   = this._touchAngle(event.touches);
      const ctr                 = this._touchCenter(event.touches);
      this.lastTwoFingerCenterX = ctr.x;
      this.lastTwoFingerCenterY = ctr.y;
    }
  }

  onCanvasTouchMove(event: TouchEvent): void {
    if (!this.showCalendarControls() || !this.isTouchActive) return;
    event.preventDefault();

    if (event.touches.length === 1 && !this.isTwoFingerGesture) {
      // ── Ein-Finger ──────────────────────────────────────────────────────
      const t = event.touches[0];

      if (this.interactionMode() === 'rotate') {
        const c            = this._canvasCenter();
        const currentAngle = Math.atan2(t.clientY - c.y, t.clientX - c.x);
        const delta        = currentAngle - this.lastTouchAngle;
        const newAngle     = this.clockService.astroState().angleCalendarDisk + delta;
        this.lastTouchAngle = currentAngle;
        this.clockService.setAngleCalendarDisk(newAngle);
      } else {
        const dx        = t.clientX - this.lastTouchX;
        const dy        = t.clientY - this.lastTouchY;
        this.panOffsetX += dx;
        this.panOffsetY += dy;
        this.lastTouchX  = t.clientX;
        this.lastTouchY  = t.clientY;
        this.clockService.setCalendarOffset(this.panOffsetX, this.panOffsetY);
      }
      this.clockService.triggerRedraw();

    } else if (event.touches.length === 2) {
      // ── Zwei Finger: Pinch-Zoom + Rotation + Pan ────────────────────────
      const dist   = this._touchDist(event.touches);
      const angle  = this._touchAngle(event.touches);
      const center = this._touchCenter(event.touches);

      // Zoom (Pinch)
      if (this.lastPinchDist > 0) {
        const factor  = dist / this.lastPinchDist;
        this.currentZoom = Math.min(
          this.maxZoom,
          Math.max(this.minZoom, this.currentZoom * factor)
        );
        this.clockService.setCalendarZoom(this.currentZoom);
      }

      // Rotation (Zwei-Finger-Drehen)
      const angleDelta = angle - this.lastTwoFingerAngle;
      const newAngle   = this.clockService.astroState().angleCalendarDisk + angleDelta;
      this.clockService.setAngleCalendarDisk(newAngle);

      // Pan (Zwei-Finger-Verschieben — Mittelpunkt der Geste)
      const panDx     = center.x - this.lastTwoFingerCenterX;
      const panDy     = center.y - this.lastTwoFingerCenterY;
      this.panOffsetX += panDx;
      this.panOffsetY += panDy;
      this.clockService.setCalendarOffset(this.panOffsetX, this.panOffsetY);

      this.lastPinchDist        = dist;
      this.lastTwoFingerAngle   = angle;
      this.lastTwoFingerCenterX = center.x;
      this.lastTwoFingerCenterY = center.y;

      this.clockService.triggerRedraw();
    }
  }

  onCanvasTouchEnd(event: TouchEvent): void {
    if (event.touches.length === 0) {
      this.isTouchActive = false;
      this._syncRotationOffset();
    }
    if (event.touches.length < 2) {
      this.isTwoFingerGesture = false;
      this.lastPinchDist      = 0;
    }
    // Nahtloser Übergang Zwei → Ein Finger
    if (event.touches.length === 1) {
      this.isTouchActive = true;
      const t = event.touches[0];
      if (this.interactionMode() === 'rotate') {
        const c = this._canvasCenter();
        this.lastTouchAngle = Math.atan2(t.clientY - c.y, t.clientX - c.x);
      } else {
        this.lastTouchX = t.clientX;
        this.lastTouchY = t.clientY;
      }
    }
  }

  // ── Private Hilfsmethoden ─────────────────────────────────────────────────

  private _canvasCenter(): { x: number; y: number } {
    const r = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  private _touchDist(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private _touchAngle(touches: TouchList): number {
    return Math.atan2(
      touches[1].clientY - touches[0].clientY,
      touches[1].clientX - touches[0].clientX
    );
  }

  private _touchCenter(touches: TouchList): { x: number; y: number } {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }

  private _applyRotation(): void {
    const base = TimeUtility.calculateCalendarDiskAngle(
      this.clockService.getCurrentDate()
    );
    this.clockService.setAngleCalendarDisk(base + this.rotationOffset);
    this.clockService.triggerRedraw();
  }

  private _pushZoom(): void {
    this.clockService.setCalendarZoom(this.currentZoom);
    this.clockService.triggerRedraw();
  }

  private _syncRotationOffset(): void {
    const base = TimeUtility.calculateCalendarDiskAngle(
      this.clockService.getCurrentDate()
    );
    this.rotationOffset =
      this.clockService.astroState().angleCalendarDisk - base;
  }
}
