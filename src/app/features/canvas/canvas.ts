import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { AstroConfig } from '../../shared/utils/config';

// Importiere die TypeScript-sicheren Klassen
import { ImageManager } from '../../shared/utils/ImageManager';
import { ClockRenderer } from '../../shared/utils/ClockRenderer';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.html', // Falls deine HTML-Datei auch nur canvas.html heißt
  styleUrls: ['./canvas.css'],   // Falls deine CSS-Datei auch nur canvas.css heißt
  standalone: true
})
export class Canvas implements OnInit, AfterViewInit, OnDestroy {
  // Greift auf das #canvasElement aus dem HTML zu
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  private clockSubscription!: Subscription;
  private imageManager!: ImageManager;
  private renderer!: ClockRenderer;
  private resizeObserver!: ResizeObserver;

  constructor(private clockService: ClockSimulationService) {}

  ngOnInit(): void {
    // Vorbereitende Initialisierungen, falls benötigt
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas 2D Kontext konnte nicht geladen werden.');
      return;
    }

    // 1. ImageManager mit Daten aus der AstroConfig initialisieren
    const zodiacNames = AstroConfig.zodiacData?.names || ['widder', 'stier', 'zwillinge', 'krebs', 'loewe', 'jungfrau', 'waage', 'skorpion', 'schuetze', 'steinbock', 'wassermann', 'fische'];
    const zodiacData = { names: zodiacNames };
    const moonCycleDays = AstroConfig.MOON_CYCLE_DAYS || 30;

    this.imageManager = new ImageManager(zodiacData, moonCycleDays);
    //this.renderer = new ClockRenderer(canvas, ctx, this.imageManager);
    this.renderer = new ClockRenderer(canvas, ctx, this.imageManager, AstroConfig);

    // 2. Bilder vorab laden (Preloading via Promise)
    this.imageManager.preloadImages().then(() => {
      console.log('Astro-Uhr: Alle Bilder erfolgreich geladen. Starte Rendering-Stream...');

      // 3. Den RxJS-Stream aus dem Service abonnieren
      this.clockSubscription = this.clockService.selectedDate$.subscribe(() => {
        // Bei jedem "Tick" (Animation oder manuelle Änderung) zeichnen wir neu
        const currentState = this.clockService.astroState;
        this.renderer.drawClock(currentState);
      });

      // 4. Responsive Größenanpassung aktivieren
      const container = canvas.parentElement;
      if (container) {
        this.resizeObserver = new ResizeObserver(entries => {
          // Wir packen die Größenänderung in ein requestAnimationFrame,
          // um die Resize-Schleife vom aktuellen Layout-Frame zu trennen.
          requestAnimationFrame(() => {
            if (!entries || entries.length === 0) return;

            const entry = entries[0];
            const { width, height } = entry.contentRect;

            // Nutze die im Renderer verbaute Methode für responsive Skalierung
            this.renderer.calculateResponsiveSize(width, height);

            // Nach dem Resizen sofort einmal neu zeichnen
            this.renderer.drawClock(this.clockService.astroState);
          });
        });
        this.resizeObserver.observe(container);
      }
    });
  }

  ngOnDestroy(): void {
    // WICHTIG: Streams abmelden und Observer stoppen, um Memory Leaks zu verhindern!
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
