import {
  Component,
  ElementRef,
  ViewChild,
  output,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-calendar-viewer',
  standalone: true,
  imports: [],
  templateUrl: './calendar-viewer.component.html',
  styleUrls: ['./calendar-viewer.component.css'],
})
export class CalendarViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly close = output<void>();

  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;
  private image = new Image();
  private imageLoaded = false;

  // Transformations-Zustand
  private scale = 1.0;
  private minScale = 0.3;
  private maxScale = 8.0;
  private offsetX = 0;
  private offsetY = 0;

  // Rotations-Zustand (Radiant, Drehung um Bildmitte)
  private rotation = 0;
  private readonly rotationStep = Math.PI / 24; // 7.5° pro Klick

  // Drag-Zustand (Maus)
  private isDragging = false;
  private lastMousePos: Point = { x: 0, y: 0 };

  // Touch-Zustand
  private lastTouchDist = 0;
  private lastTouchCenter: Point = { x: 0, y: 0 };
  private isTouchDragging = false;

  private animFrameId: number | null = null;

  ngOnInit(): void {
    // Bild vorladen
    this.image.src = 'assets/images/hintergrund/kalenderscheibe.png';
    this.image.onload = () => {
      this.imageLoaded = true;
      this.resetView();
      this.draw();
    };
    this.image.onerror = () => {
      console.warn('Kalenderscheibe konnte nicht geladen werden.');
      this.imageLoaded = false;
      this.draw();
    };
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resizeCanvas();
    this.draw();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.resizeCanvas();
    this.draw();
  }

  // --- Öffentliche Aktionen (Buttons) ---

  zoomIn(): void {
    this.applyZoom(1.25, this.centerPoint());
  }

  zoomOut(): void {
    this.applyZoom(0.8, this.centerPoint());
  }

  /** Dreht die Scheibe um einen Schritt gegen den Uhrzeigersinn */
  rotateLeft(): void {
    this.rotation -= this.rotationStep;
    this.draw();
  }

  /** Dreht die Scheibe um einen Schritt im Uhrzeigersinn */
  rotateRight(): void {
    this.rotation += this.rotationStep;
    this.draw();
  }

  resetView(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const size = Math.min(canvas.width, canvas.height) * 0.9;
    this.scale = size / Math.max(this.image.naturalWidth || 1000, this.image.naturalHeight || 1000);
    this.offsetX = (canvas.width - (this.image.naturalWidth || 1000) * this.scale) / 2;
    this.offsetY = (canvas.height - (this.image.naturalHeight || 1000) * this.scale) / 2;
    this.rotation = 0;
    this.draw();
  }

  onClose(): void {
    this.close.emit();
  }

  // --- Maus-Events ---

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const dx = event.clientX - this.lastMousePos.x;
    const dy = event.clientY - this.lastMousePos.y;
    this.offsetX += dx;
    this.offsetY += dy;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    this.draw();
    event.preventDefault();
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const mousePos: Point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const factor = event.deltaY < 0 ? 1.1 : 0.9;
    this.applyZoom(factor, mousePos);
  }

  // --- Touch-Events ---

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      this.isTouchDragging = true;
      this.lastTouchCenter = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    } else if (event.touches.length === 2) {
      this.isTouchDragging = false;
      this.lastTouchDist = this.getTouchDistance(event.touches);
      this.lastTouchCenter = this.getTouchCenter(event.touches);
    }
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1 && this.isTouchDragging) {
      const dx = event.touches[0].clientX - this.lastTouchCenter.x;
      const dy = event.touches[0].clientY - this.lastTouchCenter.y;
      this.offsetX += dx;
      this.offsetY += dy;
      this.lastTouchCenter = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      this.draw();
    } else if (event.touches.length === 2) {
      const dist = this.getTouchDistance(event.touches);
      const center = this.getTouchCenter(event.touches);
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const canvasCenter: Point = {
        x: center.x - rect.left,
        y: center.y - rect.top,
      };

      if (this.lastTouchDist > 0) {
        const factor = dist / this.lastTouchDist;
        this.applyZoom(factor, canvasCenter);
      }

      // Pan während Pinch
      const dx = center.x - this.lastTouchCenter.x;
      const dy = center.y - this.lastTouchCenter.y;
      this.offsetX += dx;
      this.offsetY += dy;

      this.lastTouchDist = dist;
      this.lastTouchCenter = center;
      this.draw();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.lastTouchDist = 0;
    }
    if (event.touches.length === 0) {
      this.isTouchDragging = false;
    }
  }

  // --- Private Hilfsmethoden ---

  private applyZoom(factor: number, center: Point): void {
    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    const actualFactor = newScale / this.scale;
    this.offsetX = center.x - actualFactor * (center.x - this.offsetX);
    this.offsetY = center.y - actualFactor * (center.y - this.offsetY);
    this.scale = newScale;
    this.draw();
  }

  private draw(): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hintergrund
    ctx.fillStyle = '#071522';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (this.imageLoaded && this.image.naturalWidth > 0) {
      const imgW = this.image.naturalWidth * this.scale;
      const imgH = this.image.naturalHeight * this.scale;
      // Mittelpunkt des (verschobenen, skalierten) Bildes
      const cx = this.offsetX + imgW / 2;
      const cy = this.offsetY + imgH / 2;

      ctx.save();
      // Rotationszentrum = Bildmitte
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.image, -imgW / 2, -imgH / 2, imgW, imgH);
      ctx.restore();
    } else {
      // Fallback-Text
      ctx.fillStyle = '#ffcc33';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Kalenderscheibe wird geladen...',
        canvas.width / 2,
        canvas.height / 2,
      );
    }

    // Zoom-Anzeige
    ctx.fillStyle = 'rgba(255, 204, 51, 0.8)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(this.scale * 100)}%`, canvas.width - 10, canvas.height - 10);

    // Rotations-Anzeige
    const deg = Math.round((this.rotation * 180) / Math.PI) % 360;
    ctx.textAlign = 'left';
    ctx.fillText(`${deg >= 0 ? '+' : ''}${deg}°`, 10, canvas.height - 10);
  }

  private resizeCanvas(): void {
    if (!this.canvasRef || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  private centerPoint(): Point {
    if (!this.canvasRef) return { x: 0, y: 0 };
    const canvas = this.canvasRef.nativeElement;
    return { x: canvas.width / 2, y: canvas.height / 2 };
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touches: TouchList): Point {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }
}
