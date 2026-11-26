// src/app/features/model3d/model3d-stage.component.ts
import { AfterViewInit, Component, ElementRef, OnDestroy, effect, inject, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { Model3dStateService } from '../../core/services/model3d-state.service';
import { ClockModel3D } from './clock-model-3d';

/**
 * Das 3D-Bild im blauen Rahmen der Uhr. Enthält three.js und wird daher
 * von app-canvas per @defer erst beim Öffnen des 3D-Modells nachgeladen.
 */
@Component({
  selector: 'app-model3d-stage',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="stage" #stage>
      <canvas #gl [attr.aria-label]="'model3d.canvas_label' | translate"></canvas>
      <div #tagLayer></div>
      <div class="hint">{{ 'model3d.hint' | translate }}</div>
      @if (webglError()) {
        <div class="err">{{ 'model3d.no_webgl' | translate }}</div>
      }
    </div>
  `,
  styles: `
    :host{display:block;width:100%;height:100%}
    .stage{position:relative;width:100%;height:100%;overflow:hidden}
    canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab}
    canvas:active{cursor:grabbing}
    .stage ::ng-deep .tag{position:absolute;left:0;top:0;font:500 13px/1 Consolas,monospace;color:#f4f4f4;background:rgba(7,21,34,.8);border:1px solid #1a4261;border-radius:4px;padding:3px 5px;white-space:nowrap;pointer-events:none}
    .stage ::ng-deep .tag.t{font-family:inherit;color:#ffcc33}
    .hint{position:absolute;left:10px;right:10px;bottom:8px;text-align:center;color:#88aacc;font-size:13px;pointer-events:none}
    .err{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#88aacc}
    @media (max-width:600px){.hint{display:none}}
  `,
})
export class Model3dStageComponent implements AfterViewInit, OnDestroy {
  private readonly t = inject(TranslationService);
  private readonly s = inject(Model3dStateService);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('gl');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly tagLayer = viewChild.required<ElementRef<HTMLElement>>('tagLayer');

  readonly webglError = signal(false);
  private model?: ClockModel3D;
  private raf = 0;
  private last = 0;
  private lastUi = 0;

  constructor() {
    effect(() => { this.t.currentLang(); this.model?.updateLabels(); });
    effect(() => { const g = this.s.glass(); this.model?.setGlass(g); });
    effect(() => { const h = this.s.heil(); this.model?.setHeil(h); });
    effect(() => { const v = this.s.tags(); this.model?.setTags(v); });
    effect(() => { const v = this.s.view(); if (v.seq) this.model?.setView(v.key); });
  }

  ngAfterViewInit(): void {
    try {
      this.model = new ClockModel3D(this.canvas().nativeElement, this.tagLayer().nativeElement, (k) => this.t.translate(k));
    } catch (e) {
      console.error('WebGL nicht verfügbar:', e);
      this.webglError.set(true);
      return;
    }
    this.model.setGlass(this.s.glass());
    this.model.setHeil(this.s.heil());
    this.model.setTags(this.s.tags());
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.model?.dispose();
  }

  private readonly frame = (now: number): void => {
    const s = this.s;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (s.playing()) s.simT += dt * s.speed() * 1000;
    const st = this.stage().nativeElement;
    this.model!.render(s.simT, st.clientWidth, st.clientHeight);

    // Feld „Uhr stellen“ mitlaufen lassen (nicht in jedem Frame)
    if (now - this.lastUi > 500) {
      this.lastUi = now;
      if (s.playing() && !s.editingWhen) s.syncWhen();
    }
    this.raf = requestAnimationFrame(this.frame);
  };
}
