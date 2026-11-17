// src/app/features/model3d/model3d.component.ts
import {
  AfterViewInit, Component, ElementRef, OnDestroy, computed, effect, inject, output, signal, viewChild,
} from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';
import { ClockModel3D, K_MOON, K_ZOD, TRAIN_COLORS, TrainKey, ViewKey, moonPhase, signOfSun } from './clock-model-3d';

const HOUR = 3_600_000;

interface TrainRow { k: TrainKey; teeth: string; rate: number; digits: number; }

/**
 * Vollbild-Ansicht mit dem 3D-Funktionsmodell des Räderwerks.
 * Wird über @defer nachgeladen, damit three.js nicht im Start-Bundle landet.
 */
@Component({
  selector: 'app-model3d',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './model3d.component.html',
  styleUrls: ['./model3d.component.css'],
})
export class Model3dComponent implements AfterViewInit, OnDestroy {
  readonly close = output<void>();

  readonly t = inject(TranslationService);
  private readonly clock = inject(ClockSimulationService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('gl');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly tagLayer = viewChild.required<ElementRef<HTMLElement>>('tagLayer');
  private readonly when = viewChild.required<ElementRef<HTMLInputElement>>('when');

  private model?: ClockModel3D;
  private raf = 0;
  private last = 0;
  private lastUi = 0;
  private simT = this.clock.getCurrentDate().getTime();

  readonly colors = TRAIN_COLORS;
  readonly webglError = signal(false);
  readonly playing = signal(true);
  readonly speed = signal(
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 600,
  );
  readonly glass = signal(false);
  readonly heil = signal(true);
  readonly tags = signal(true);

  readonly clockText = signal('–');
  private readonly cetTime = signal(0);
  readonly signKey = signal('stier');
  readonly phaseKey = signal('full');
  private readonly moonAge = signal(0);

  readonly speeds = [1, 60, 600, 3600, 21600, 86400];
  readonly jumps: [string, number][] = [
    ['hour', HOUR], ['day', 24 * HOUR], ['month', 2_551_465_532], ['year', 31_557_600_000],
  ];
  readonly views: ViewKey[] = ['start', 'front', 'side', 'back'];
  readonly trains: TrainRow[] = [
    { k: 'drv', teeth: '15', rate: 24, digits: 0 },
    { k: 'sun', teeth: '360 · 293 · 298', rate: 1, digits: 0 },
    { k: 'csa', teeth: '36 + 60', rate: 293 / 36, digits: 4 },
    { k: 'zod', teeth: '487', rate: K_ZOD, digits: 6 },
    { k: 'csb', teeth: '40 + 45', rate: 298 / 40, digits: 4 },
    { k: 'moon', teeth: '347', rate: K_MOON, digits: 6 },
  ];

  private readonly locale = computed(() => (this.t.currentLang() === 'de' ? 'de-DE' : 'en-GB'));
  readonly dateText = computed(() =>
    new Intl.DateTimeFormat(this.locale(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(this.cetTime()),
  );
  readonly moonAgeText = computed(() =>
    this.moonAge().toLocaleString(this.locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  );

  constructor() {
    // Beschriftungen im 3D-Bild bei Sprachwechsel neu setzen
    effect(() => {
      this.t.currentLang();
      this.model?.updateLabels();
    });
  }

  rate(r: TrainRow): string {
    return r.rate.toLocaleString(this.locale(), { minimumFractionDigits: r.digits, maximumFractionDigits: r.digits });
  }

  ngAfterViewInit(): void {
    // Direkt an <body> hängen: .container hat backdrop-filter und würde sonst
    // als Bezugsrahmen für position:fixed die Vollbild-Ansicht einsperren.
    // (Erst hier – im Konstruktor ist das Element noch nicht eingehängt.)
    document.body.appendChild(this.host.nativeElement);
    try {
      this.model = new ClockModel3D(this.canvas().nativeElement, this.tagLayer().nativeElement, (k) => this.t.translate(k));
    } catch (e) {
      console.error('WebGL nicht verfügbar:', e);
      this.webglError.set(true);
      return;
    }
    this.syncInput();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.model?.dispose();
    this.host.nativeElement.remove();
  }

  private readonly frame = (now: number): void => {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (this.playing()) this.simT += dt * this.speed() * 1000;
    const st = this.stage().nativeElement;
    const a = this.model!.render(this.simT, st.clientWidth, st.clientHeight);

    if (now - this.lastUi > 120) {
      this.lastUi = now;
      const d = new Date(this.simT + HOUR); // MEZ = UTC+1, wie an der Uhr
      const pad = (n: number) => String(n).padStart(2, '0');
      this.clockText.set(`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`);
      this.cetTime.set(d.getTime());
      this.signKey.set(signOfSun(a));
      const ph = moonPhase(a);
      this.phaseKey.set(ph.key);
      this.moonAge.set(ph.age);
      if (this.playing() && document.activeElement !== this.when().nativeElement) this.syncInput();
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  /* ---------- Bedienung ---------- */
  togglePlay(): void { this.playing.update((p) => !p); }

  setSpeed(v: string): void { this.speed.set(+v); }

  jump(ms: number): void { this.simT += ms; this.syncInput(); }

  now(): void { this.simT = Date.now(); this.syncInput(); }

  setWhen(value: string): void {
    const m = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+)/.exec(value);
    if (!m) return;
    const d = new Date(0);
    d.setUTCFullYear(+m[1], +m[2] - 1, +m[3]);
    d.setUTCHours(+m[4], +m[5]);
    this.simT = d.getTime() - HOUR;
  }

  private syncInput(): void {
    const d = new Date(this.simT + HOUR), pad = (n: number) => String(n).padStart(2, '0');
    this.when().nativeElement.value =
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }

  setView(v: ViewKey): void { this.model?.setView(v); }

  toggleGlass(): void { this.glass.update((g) => !g); this.model?.setGlass(this.glass()); }

  toggleHeil(): void { this.heil.update((h) => !h); this.model?.setHeil(this.heil()); }

  toggleTags(): void { this.tags.update((s) => !s); this.model?.setTags(this.tags()); }

  highlight(k: TrainKey | null): void { this.model?.highlight(k); }
}
