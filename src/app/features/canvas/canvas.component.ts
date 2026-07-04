// src/app/features/canvas/canvas.component.ts
import {
  Component, ElementRef, OnInit, AfterViewInit, OnDestroy,
  ViewChild, inject, signal, effect,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { AstroConfig } from '../../shared/utils/config';
import { ImageManager } from '../../shared/utils/ImageManager';
import { ClockRenderer } from '../../shared/utils/ClockRenderer';
import { TimeUtility } from '../../shared/utils/TimeUtility';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

type InteractionMode = 'rotate' | 'pan';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  standalone: true,
  imports: [TranslatePipe],
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly clockService = inject(ClockSimulationService);

  private clockSubscription!: Subscription;
  private imageManager!: ImageManager;
  private renderer!: ClockRenderer;
  private resizeObserver!: ResizeObserver;

  readonly showCalendarControls = signal(false);
  readonly interactionMode      = signal<InteractionMode>('rotate');

  private currentZoom    = 1.5;
  private readonly zoomStep = 0.25;
  private readonly minZoom  = 0.5;
  private readonly maxZoom  = 8.0;

  private rotationOffset    = 0;
  private readonly rotationStep = Math.PI / 24;

  private panOffsetX = 0;
  private panOffsetY = 0;

  private isDragging       = false;
  private dragStartAngle   = 0;
  private dragBaseRotation = 0;
  private dragStartX       = 0;
  private dragStartY       = 0;
  private dragBasePanX     = 0;
  private dragBasePanY     = 0;

  private isTouchActive      = false;
  private isTwoFingerGesture = false;
  private lastTouchAngle     = 0;
  private lastTouchX         = 0;
  private lastTouchY         = 0;
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

  setMode(mode: InteractionMode): void { this.interactionMode.set(mode); }

  zoomIn(): void {
    this.currentZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomStep);
    this._pushZoom();
  }
  zoomOut(): void {
    this.currentZoom = Math.max(this.minZoom, this.currentZoom - this.zoomStep);
    this._pushZoom();
  }
  rotateLeft(): void  { this.rotationOffset -= this.rotationStep; this._applyRotation(); }
  rotateRight(): void { this.rotationOffset += this.rotationStep; this._applyRotation(); }

  resetView(): void {
    this.rotationOffset = 0;
    this.currentZoom    = 1.5;
    this.panOffsetX     = 0;
    this.panOffsetY     = 0;
    this.clockService.setCalendarZoom(this.currentZoom);
    this.clockService.setCalendarOffset(0, 0);
    const base = TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate());
    this.clockService.setAngleCalendarDisk(base);
    this.clockService.triggerRedraw();
  }

  onCanvasMouseDown(e: MouseEvent): void {
    if (!this.showCalendarControls()) return;
    this.isDragging = true;
    if (this.interactionMode() === 'rotate') {
      const c = this._canvasCenter();
      this.dragStartAngle   = Math.atan2(e.clientY - c.y, e.clientX - c.x);
      this.dragBaseRotation = this.clockService.astroState().angleCalendarDisk;
    } else {
      this.dragStartX   = e.clientX; this.dragStartY   = e.clientY;
      this.dragBasePanX = this.panOffsetX; this.dragBasePanY = this.panOffsetY;
    }
    e.preventDefault();
  }

  onCanvasMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    if (this.interactionMode() === 'rotate') {
      const c = this._canvasCenter();
      const delta = Math.atan2(e.clientY - c.y, e.clientX - c.x) - this.dragStartAngle;
      this.clockService.setAngleCalendarDisk(this.dragBaseRotation + delta);
    } else {
      this.panOffsetX = this.dragBasePanX + (e.clientX - this.dragStartX);
      this.panOffsetY = this.dragBasePanY + (e.clientY - this.dragStartY);
      this.clockService.setCalendarOffset(this.panOffsetX, this.panOffsetY);
    }
    this.clockService.triggerRedraw();
    e.preventDefault();
  }

  onCanvasMouseUp(): void {
    if (this.isDragging && this.interactionMode() === 'rotate') this._syncRotationOffset();
    this.isDragging = false;
  }
  onCanvasMouseLeave(): void { this.onCanvasMouseUp(); }

  onCanvasWheel(e: WheelEvent): void {
    if (!this.showCalendarControls()) return;
    e.preventDefault();
    e.deltaY < 0 ? this.zoomIn() : this.zoomOut();
  }

  onCanvasTouchStart(e: TouchEvent): void {
    if (!this.showCalendarControls()) return;
    e.preventDefault();
    this.isTouchActive = true;
    if (e.touches.length === 1) {
      this.isTwoFingerGesture = false;
      const t = e.touches[0];
      if (this.interactionMode() === 'rotate') {
        const c = this._canvasCenter();
        this.lastTouchAngle = Math.atan2(t.clientY - c.y, t.clientX - c.x);
      } else {
        this.lastTouchX = t.clientX; this.lastTouchY = t.clientY;
      }
    } else if (e.touches.length === 2) {
      this.isTwoFingerGesture = true;
      this.lastPinchDist        = this._touchDist(e.touches);
      this.lastTwoFingerAngle   = this._touchAngle(e.touches);
      const ctr = this._touchCenter(e.touches);
      this.lastTwoFingerCenterX = ctr.x;
      this.lastTwoFingerCenterY = ctr.y;
    }
  }

  onCanvasTouchMove(e: TouchEvent): void {
    if (!this.showCalendarControls() || !this.isTouchActive) return;
    e.preventDefault();
    if (e.touches.length === 1 && !this.isTwoFingerGesture) {
      const t = e.touches[0];
      if (this.interactionMode() === 'rotate') {
        const c = this._canvasCenter();
        const curr  = Math.atan2(t.clientY - c.y, t.clientX - c.x);
        const delta = curr - this.lastTouchAngle;
        this.lastTouchAngle = curr;
        this.clockService.setAngleCalendarDisk(
          this.clockService.astroState().angleCalendarDisk + delta);
      } else {
        this.panOffsetX += t.clientX - this.lastTouchX;
        this.panOffsetY += t.clientY - this.lastTouchY;
        this.lastTouchX = t.clientX; this.lastTouchY = t.clientY;
        this.clockService.setCalendarOffset(this.panOffsetX, this.panOffsetY);
      }
      this.clockService.triggerRedraw();
    } else if (e.touches.length === 2) {
      const dist  = this._touchDist(e.touches);
      const angle = this._touchAngle(e.touches);
      const ctr   = this._touchCenter(e.touches);
      if (this.lastPinchDist > 0) {
        this.currentZoom = Math.min(this.maxZoom,
          Math.max(this.minZoom, this.currentZoom * (dist / this.lastPinchDist)));
        this.clockService.setCalendarZoom(this.currentZoom);
      }
      this.clockService.setAngleCalendarDisk(
        this.clockService.astroState().angleCalendarDisk + (angle - this.lastTwoFingerAngle));
      this.panOffsetX += ctr.x - this.lastTwoFingerCenterX;
      this.panOffsetY += ctr.y - this.lastTwoFingerCenterY;
      this.clockService.setCalendarOffset(this.panOffsetX, this.panOffsetY);
      this.lastPinchDist = dist; this.lastTwoFingerAngle = angle;
      this.lastTwoFingerCenterX = ctr.x; this.lastTwoFingerCenterY = ctr.y;
      this.clockService.triggerRedraw();
    }
  }

  onCanvasTouchEnd(e: TouchEvent): void {
    if (e.touches.length === 0) { this.isTouchActive = false; this._syncRotationOffset(); }
    if (e.touches.length < 2)   { this.isTwoFingerGesture = false; this.lastPinchDist = 0; }
    if (e.touches.length === 1) {
      this.isTouchActive = true;
      const t = e.touches[0];
      if (this.interactionMode() === 'rotate') {
        const c = this._canvasCenter();
        this.lastTouchAngle = Math.atan2(t.clientY - c.y, t.clientX - c.x);
      } else {
        this.lastTouchX = t.clientX; this.lastTouchY = t.clientY;
      }
    }
  }

  private _canvasCenter(): { x: number; y: number } {
    const r = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  private _touchDist(t: TouchList): number {
    const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  private _touchAngle(t: TouchList): number {
    return Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX);
  }
  private _touchCenter(t: TouchList): { x: number; y: number } {
    return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
  }
  private _applyRotation(): void {
    const base = TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate());
    this.clockService.setAngleCalendarDisk(base + this.rotationOffset);
    this.clockService.triggerRedraw();
  }
  private _pushZoom(): void {
    this.clockService.setCalendarZoom(this.currentZoom);
    this.clockService.triggerRedraw();
  }
  private _syncRotationOffset(): void {
    const base = TimeUtility.calculateCalendarDiskAngle(this.clockService.getCurrentDate());
    this.rotationOffset = this.clockService.astroState().angleCalendarDisk - base;
  }
}
