// src/app/features/calendar-modal/calendar-modal.component.ts
import { Component, input, inject, signal, effect } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { CalendarLogicService, CalendarResult } from '../../core/services/calendar-logic.service';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.css'],
})
export class CalendarModalComponent {
  readonly date = input.required<Date>();

  private readonly logic = inject(CalendarLogicService);
  readonly t = inject(TranslationService);
  readonly result = signal<CalendarResult | null>(null);

  constructor() {
    // Neu berechnen wenn Datum ODER Sprache wechselt
    effect(() => {
      const d = this.date();
      // currentLang() als reaktive Abhängigkeit registrieren
      this.t.currentLang();
      this.logic.calculate(d).then(r => this.result.set(r));
    });
  }
}
