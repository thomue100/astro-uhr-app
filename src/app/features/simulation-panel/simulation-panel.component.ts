// src/app/features/simulation-panel/simulation-panel.component.ts
import { Component, inject, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClockSimulationService, KALENDER_ANFANG, KALENDER_ENDE, simulierteMsProSekunde,
} from '../../core/services/clock-simulation.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Zeitangaben in Lübecker Ortszeit – wie Sonnenzeiger und echte Uhr, unabhängig vom Gerät. */
const ZONE = 'Europe/Berlin';
const zahlen = new Intl.DateTimeFormat('de-DE', {
  timeZone: ZONE, hourCycle: 'h23',
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const wochentage = {
  de: new Intl.DateTimeFormat('de-DE', { timeZone: ZONE, weekday: 'long' }),
  en: new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, weekday: 'long' }),
};

@Component({
  selector: 'app-simulation-panel',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './simulation-panel.component.html',
})
export class SimulationPanelComponent {
  readonly clockService = inject(ClockSimulationService);
  private readonly t = inject(TranslationService);

  /**
   * Laufende Anzeige unter dem Datumsfeld. Das Feld selbst steht während des
   * Zeitraffers still (man soll nicht gegen ein sich änderndes Feld tippen) –
   * hier läuft die simulierte Zeit mit, ergänzt um Wochentag und Zeitzone.
   */
  /**
   * Geschwindigkeit als simulierte Zeit pro echter Sekunde – im selben Stil
   * wie im 3D-Modell („10 Min. pro Sek.“) statt einer Zahl wie „0.5x“.
   */
  readonly geschwindigkeit = computed(() => {
    const ms = simulierteMsProSekunde(this.animationSpeed());
    const zahl = (n: number, stellen: number) =>
      n.toLocaleString(this.t.currentLang() === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: stellen });
    const [schluessel, wert] =
      ms < 3_600_000 ? ['rate_min', zahl(ms / 60_000, 0)]
      : ms < 86_400_000 ? ['rate_h', zahl(ms / 3_600_000, 1)]
      : ['rate_d', zahl(ms / 86_400_000, 1)];
    return this.t.translate(`simulation.${schluessel}`).replace('{n}', wert);
  });

  readonly anzeige = computed(() => {
    const d = this.clockService.currentDate();
    const p = Object.fromEntries(zahlen.formatToParts(d).map((x) => [x.type, x.value]));
    return {
      wochentag: wochentage[this.t.currentLang()].format(d),
      zeitpunkt: `${p['day']}.${p['month']}.${p['year']} ${p['hour']}:${p['minute']}:${p['second']}`,
    };
  });

  readonly selectedDateTimeString = signal('');
  readonly animationSpeed         = signal(0.5);
  readonly currentDate            = this.clockService.currentDate;
  readonly isAnimationRunning     = this.clockService.isAnimationRunning;

  constructor() {
    this._syncDateTimeString(this.clockService.getCurrentDate());
    effect(() => {
      const date = this.currentDate();
      if (!this.isAnimationRunning()) {
        this._syncDateTimeString(date);
      }
    });
  }

  onDateTimeChange(): void {
    const raw = this.selectedDateTimeString();
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return;
    if (d < KALENDER_ANFANG || d > KALENDER_ENDE) return;
    if (this.clockService.isAnimationRunning()) this.clockService.stopAnimation();
    this.clockService.setDate(d);
  }

  setToCurrentTime(): void {
    if (this.clockService.isAnimationRunning()) this.clockService.stopAnimation();
    const now = new Date();
    this.clockService.setDate(now);
    this._syncDateTimeString(now);
  }

  toggleAnimation(): void {
    this.clockService.setAnimationSpeed(this.animationSpeed());
    this.clockService.toggleAnimation();
  }

  onSpeedChange(): void {
    this.clockService.setAnimationSpeed(this.animationSpeed());
  }

  private _syncDateTimeString(date: Date): void {
    const offset = date.getTimezoneOffset() * 60000;
    this.selectedDateTimeString.set(
      new Date(date.getTime() - offset).toISOString().slice(0, 16),
    );
  }
}
