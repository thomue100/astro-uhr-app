// src/app/features/canvas/canvas.component.ts
import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { AstroConfig } from '../../shared/utils/config';
import { ImageManager } from '../../shared/utils/ImageManager';
import { ClockRenderer } from '../../shared/utils/ClockRenderer';

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

      // selectedDate$ ist jetzt ein Subject — feuert immer zuverlässig,
      // auch wenn das Datum sich nicht geändert hat (z.B. bei Zoom/Rotate/showCalendarDisk)
      this.clockSubscription = this.clockService.selectedDate$.subscribe(() => {
        // astroState() liest den aktuellen Signal-Wert (inkl. showCalendarDisk, zoom, angle)
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
}
