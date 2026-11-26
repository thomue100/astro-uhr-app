import { AfterViewInit, Component, ElementRef, OnDestroy, input, output, viewChild } from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';

let naechsteId = 0;

/** Elemente, die per Tab erreichbar sind. */
const FOKUSSIERBAR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fenster (Dialog) über der App. Für Tastatur und Screenreader:
 * - beim Öffnen springt der Fokus ins Fenster (auf „Schließen“),
 * - Tab/Umschalt+Tab bleiben im Fenster,
 * - beim Schließen kehrt der Fokus zum auslösenden Element zurück.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  host: { class: 'modal-host' },
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  readonly title = input<string>();
  readonly close = output<void>();

  readonly titelId = `modal-titel-${++naechsteId}`;

  private readonly inhalt = viewChild.required<ElementRef<HTMLElement>>('inhalt');
  private readonly schliessen = viewChild<ElementRef<HTMLButtonElement>>('schliessen');

  /** Element, das beim Öffnen den Fokus hatte (meist der Menüpunkt). */
  private readonly vorherFokussiert =
    typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

  ngAfterViewInit(): void {
    (this.schliessen()?.nativeElement ?? this.inhalt().nativeElement).focus();
  }

  ngOnDestroy(): void {
    const ziel = this.vorherFokussiert;
    if (ziel && ziel !== document.body && document.contains(ziel)) ziel.focus();
  }

  onClose(): void {
    this.close.emit();
  }

  /** Hält Tab und Umschalt+Tab innerhalb des Fensters (vom letzten zum ersten Element und umgekehrt). */
  fokusImFenster(ereignis: Event): void {
    const e = ereignis as KeyboardEvent;
    const elemente = Array.from(this.inhalt().nativeElement.querySelectorAll<HTMLElement>(FOKUSSIERBAR))
      .filter((el) => el.getClientRects().length > 0);
    if (elemente.length === 0) return;
    const erstes = elemente[0], letztes = elemente[elemente.length - 1];
    const aktiv = document.activeElement;
    if (e.shiftKey && (aktiv === erstes || aktiv === this.inhalt().nativeElement)) {
      e.preventDefault();
      letztes.focus();
    } else if (!e.shiftKey && aktiv === letztes) {
      e.preventDefault();
      erstes.focus();
    }
  }
}
