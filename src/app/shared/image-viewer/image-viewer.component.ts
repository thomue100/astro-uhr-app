// src/app/shared/image-viewer/image-viewer.component.ts
import {
  Component, Input, ElementRef, ViewChild,
  AfterViewInit, OnDestroy, ChangeDetectionStrategy, inject,
} from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';

export interface ImageViewerConfig {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
}

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="iv-card">
      <div class="iv-caption">
        <span class="iv-caption-title">{{ config.title }}</span>
        @if (config.subtitle) {
          <span class="iv-caption-sub">{{ config.subtitle }}</span>
        }
      </div>

      <div
        #stage
        class="iv-stage"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp()"
        (mouseleave)="onMouseUp()"
        (wheel)="onWheel($event)"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd($event)"
      >
        <img
          #img
          class="iv-img"
          [src]="config.src"
          [alt]="config.alt"
          draggable="false"
          loading="lazy"
          (load)="onImageLoad()"
          (error)="onImageError()"
        />

        @if (loadError) {
          <div class="iv-error">
            ⚠️ {{ 'image_viewer.error' | translate }}<br>
            <code>{{ config.src }}</code>
          </div>
        }
      </div>

      <div class="iv-controls">
        <button class="iv-btn" (click)="zoom(-0.3)"
          [title]="'image_viewer.zoom_out' | translate">🔍−</button>
        <button class="iv-btn" (click)="zoom(+0.3)"
          [title]="'image_viewer.zoom_in' | translate">🔍+</button>
        <button class="iv-btn" (click)="reset()"
          [title]="'image_viewer.reset' | translate">
          {{ 'image_viewer.reset' | translate }}
        </button>
        <span class="iv-hint">{{ 'image_viewer.hint' | translate }}</span>
      </div>
    </div>
  `,
  styles: [`
    .iv-card {
      margin: 14px 0;
      border: 1px solid #1a4261;
      border-radius: 8px;
      overflow: hidden;
      background: #071522;
    }
    .iv-caption {
      padding: 8px 12px;
      background: #0e2030;
      border-bottom: 1px solid #1a4261;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .iv-caption-title { color: #ffcc33; font-size: 0.85em; font-weight: 700; }
    .iv-caption-sub   { color: #88aacc; font-size: 0.78em; line-height: 1.4; }
    .iv-stage {
      position: relative;
      width: 100%;
      height: 340px;
      overflow: hidden;
      cursor: grab;
      background: #040e17;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
      user-select: none;
    }
    .iv-stage:active { cursor: grabbing; }
    .iv-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transform-origin: center center;
      transform: translate(0px, 0px) scale(1);
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }
    .iv-error {
      color: #ff9966; font-size: 0.85em;
      padding: 20px; text-align: center; line-height: 1.8;
    }
    .iv-controls {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; background: #0e2030;
      border-top: 1px solid #1a4261; flex-wrap: wrap;
    }
    .iv-btn {
      background: #184a6b; color: #ffcc33; border: 1px solid #00aaff;
      border-radius: 5px; padding: 4px 10px; font-size: 0.78em;
      font-weight: 600; cursor: pointer; transition: background 0.2s;
      width: auto; min-width: 44px; white-space: nowrap;
    }
    .iv-btn:hover { background: #0066aa; }
    .iv-hint { color: #6688aa; font-size: 0.72em; margin-left: 4px; }
    @media (max-width: 600px) {
      .iv-stage { height: 260px; }
      .iv-hint  { display: none; }
    }
  `],
})
export class ImageViewerComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) config!: ImageViewerConfig;
  @ViewChild('img')   imgRef!:   ElementRef<HTMLImageElement>;
  @ViewChild('stage') stageRef!: ElementRef<HTMLDivElement>;

  loadError = false;

  private scale   = 1;
  private offsetX = 0;
  private offsetY = 0;
  private readonly minScale = 0.2;
  private readonly maxScale = 6;

  private dragging   = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragBaseX  = 0;
  private dragBaseY  = 0;

  private twoFinger      = false;
  private lastDist       = 0;
  private lastTouchX     = 0;
  private lastTouchY     = 0;
  private lastTwoCenterX = 0;
  private lastTwoCenterY = 0;

  ngAfterViewInit(): void { this.reset(); }
  ngOnDestroy(): void {}

  onImageLoad():  void { this.reset(); }
  onImageError(): void { this.loadError = true; }

  zoom(delta: number): void {
    this.scale = Math.min(this.maxScale, Math.max(this.minScale, this.scale + delta));
    this._clamp(); this._apply();
  }

  reset(): void { this.scale = 1; this.offsetX = 0; this.offsetY = 0; this._apply(); }

  onMouseDown(e: MouseEvent): void {
    this.dragging   = true;
    this.dragStartX = e.clientX; this.dragStartY = e.clientY;
    this.dragBaseX  = this.offsetX; this.dragBaseY = this.offsetY;
    e.preventDefault();
  }
  onMouseMove(e: MouseEvent): void {
    if (!this.dragging) return;
    this.offsetX = this.dragBaseX + (e.clientX - this.dragStartX);
    this.offsetY = this.dragBaseY + (e.clientY - this.dragStartY);
    this._clamp(); this._apply(); e.preventDefault();
  }
  onMouseUp(): void { this.dragging = false; }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    this.zoom(e.deltaY < 0 ? 0.25 : -0.25);
  }

  onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.twoFinger  = false;
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      this.twoFinger       = true;
      this.lastDist        = this._dist(e.touches);
      const c              = this._center(e.touches);
      this.lastTwoCenterX  = c.x; this.lastTwoCenterY = c.y;
    }
  }
  onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1 && !this.twoFinger) {
      this.offsetX   += e.touches[0].clientX - this.lastTouchX;
      this.offsetY   += e.touches[0].clientY - this.lastTouchY;
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
      this._clamp(); this._apply();
    } else if (e.touches.length === 2) {
      const dist = this._dist(e.touches);
      if (this.lastDist > 0)
        this.scale = Math.min(this.maxScale,
          Math.max(this.minScale, this.scale * (dist / this.lastDist)));
      const c      = this._center(e.touches);
      this.offsetX += c.x - this.lastTwoCenterX;
      this.offsetY += c.y - this.lastTwoCenterY;
      this.lastDist = dist;
      this.lastTwoCenterX = c.x; this.lastTwoCenterY = c.y;
      this._clamp(); this._apply();
    }
  }
  onTouchEnd(e: TouchEvent): void {
    if (e.touches.length < 2) { this.twoFinger = false; this.lastDist = 0; }
    if (e.touches.length === 1) {
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
    }
  }

  private _apply(): void {
    const img = this.imgRef?.nativeElement;
    if (!img) return;
    img.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
  }
  private _clamp(): void {
    const stage = this.stageRef?.nativeElement;
    const img   = this.imgRef?.nativeElement;
    if (!stage || !img) return;
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const iw = (img.naturalWidth  || sw) * this.scale;
    const ih = (img.naturalHeight || sh) * this.scale;
    const m  = Math.min(sw, sh) * 0.2;
    this.offsetX = Math.min(this.offsetX,  sw*0.5 + iw*0.5 - m);
    this.offsetX = Math.max(this.offsetX, -sw*0.5 - iw*0.5 + m);
    this.offsetY = Math.min(this.offsetY,  sh*0.5 + ih*0.5 - m);
    this.offsetY = Math.max(this.offsetY, -sh*0.5 - ih*0.5 + m);
  }
  private _dist(t: TouchList): number {
    const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }
  private _center(t: TouchList): { x: number; y: number } {
    return { x: (t[0].clientX+t[1].clientX)/2, y: (t[0].clientY+t[1].clientY)/2 };
  }
}
