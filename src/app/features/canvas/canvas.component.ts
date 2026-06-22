import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
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

  private clockSubscription!: Subscription;
  private imageManager!: ImageManager;
  private renderer!: ClockRenderer;
  private resizeObserver!: ResizeObserver;

  constructor(private clockService: ClockSimulationService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas 2D Kontext konnte nicht geladen werden.');
      return;
    }

    // ImageManager mit den Tierkreiszeichen-Namen aus der Config initialisieren
    const zodiacData = { names: AstroConfig.zodiacData?.names ?? [] };
    this.imageManager = new ImageManager(zodiacData, AstroConfig.MOON_CYCLE_DAYS);

    // Bilder vorab laden, dann Renderer aufbauen und Stream abonnieren —
    // entspricht der Promise.all()-Logik in ClockApp.init()
    this.imageManager.preloadImages().then(() => {
      console.log('Astro-Uhr: Alle Bilder geladen. Starte Rendering-Stream...');

      // FIX: ClockRenderer bekommt das images-Objekt (nicht den imageManager selbst)
      // plus AstroConfig, damit Zodiac-Winkel, Skalierungen und Konstanten stimmen
      this.renderer = new ClockRenderer(
        canvas,
        ctx,
        this.imageManager,   // ClockRenderer liest intern .images daraus
        AstroConfig
      );

      // Initiale Canvas-Größe setzen
      const container = canvas.parentElement;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        this.renderer.calculateResponsiveSize(width, height);
      }

      // Den reaktiven Stream abonnieren: jedes setDate() oder Animation-Tick
      // löst einen Redraw aus — entspricht requestAnimationFrame in ClockApp.animate()
      this.clockSubscription = this.clockService.selectedDate$.subscribe(() => {
        this.renderer.drawClock(this.clockService.astroState);
      });

      // Responsive Größenanpassung: bei Container-Größenänderung Canvas neu skalieren
      if (container) {
        this.resizeObserver = new ResizeObserver(entries => {
          requestAnimationFrame(() => {
            if (!entries?.length) return;
            const { width, height } = entries[0].contentRect;
            this.renderer.calculateResponsiveSize(width, height);
            // Nach Resize sofort neu zeichnen mit aktuellem State
            this.renderer.drawClock(this.clockService.astroState);
          });
        });
        this.resizeObserver.observe(container);
      }
    });
  }

  ngOnDestroy(): void {
    // Stream abmelden und Observer stoppen, damit keine Memory Leaks entstehen
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
