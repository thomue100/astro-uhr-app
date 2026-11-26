// src/app/shared/sprungliste/sprungliste.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';

/**
 * Sprungliste am Anfang eines langen Fenstertextes: je Abschnitt ein Knopf,
 * der den Abschnitt ins Bild scrollt und den Fokus dorthin setzt (Tastatur
 * und Screenreader lesen dort weiter). Die Ziele brauchen eine id und
 * tabindex="-1"; die Beschriftung kommt aus i18n „sprungliste.<id>“.
 */
@Component({
  selector: 'app-sprungliste',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="sprungliste" [attr.aria-label]="'sprungliste.label' | translate">
      <span class="sprungliste-titel" aria-hidden="true">{{ 'sprungliste.label' | translate }}:</span>
      <ul>
        @for (ziel of ziele(); track ziel) {
          <li><button type="button" (click)="springe(ziel)">{{ 'sprungliste.' + ziel | translate }}</button></li>
        }
      </ul>
    </nav>
  `,
  styles: `
    .sprungliste { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin: 4px 0 14px; }
    .sprungliste-titel { color: #c9d6e3; font-size: 14px; }
    ul { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
    button {
      width: auto; min-height: 32px; padding: 4px 12px; border-radius: 16px;
      background: #123b57; color: #ffcc33; border: 1px solid #2f8fc4;
      font-size: 14px; font-weight: 600; white-space: nowrap;
    }
    button:hover { background: #184a6b; }
    @media (max-width: 600px) { button { min-height: 44px; } }
  `,
})
export class SprunglisteComponent {
  /** ids der Abschnitte, in Lesereihenfolge */
  readonly ziele = input.required<string[]>();

  springe(id: string): void {
    const ziel = document.getElementById(id);
    if (!ziel) return;
    const ruhig = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    ziel.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    ziel.focus({ preventScroll: true });
  }
}
