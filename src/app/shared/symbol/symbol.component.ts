// src/app/shared/symbol/symbol.component.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SymbolName =
  | 'info' | 'auf' | 'zu' | 'zurueck' | 'start' | 'pause'
  | 'vergroessern' | 'verkleinern' | 'zuruecksetzen' | 'drehen' | 'verschieben' | 'warnung';

/**
 * Einheitlicher SVG-Symbolsatz statt Emoji (ℹ️ ▶️ 🔽 ⏸️ 🔍 ⟲ …): Emoji sehen
 * auf jedem System anders aus, unter Windows teils als blaue Kästchen.
 * Strichstärke und Farbe folgen dem Text (currentColor, 1em groß).
 * Rein dekorativ – die Bedeutung trägt immer der Text bzw. title/aria-label.
 */
@Component({
  selector: 'app-symbol',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
         stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
      @switch (name()) {
        @case ('info') { <circle cx="12" cy="12" r="9.5"/><path d="M12 11v6"/><path d="M12 7.2v.1"/> }
        @case ('auf') { <path d="M9 5l7 7-7 7"/> }
        @case ('zu') { <path d="M5 9l7 7 7-7"/> }
        @case ('zurueck') { <path d="M15 5l-7 7 7 7"/> }
        @case ('start') { <path d="M7 4.5v15l12-7.5z" fill="currentColor"/> }
        @case ('pause') { <path d="M8 5v14M16 5v14" stroke-width="3.6"/> }
        @case ('vergroessern') { <circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M7.5 10.5h6M10.5 7.5v6"/> }
        @case ('verkleinern') { <circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M7.5 10.5h6"/> }
        @case ('zuruecksetzen') { <path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 3.5V9h5.5"/> }
        @case ('drehen') { <path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3.5V9h-5.5"/> }
        @case ('verschieben') { <path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/> }
        @case ('warnung') { <path d="M10.3 4.2L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z"/><path d="M12 10v4M12 17.3v.1"/> }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; vertical-align: -0.14em; line-height: 0; flex-shrink: 0; }
    svg { display: block; overflow: visible; }
  `,
})
export class SymbolComponent {
  readonly name = input.required<SymbolName>();
}
