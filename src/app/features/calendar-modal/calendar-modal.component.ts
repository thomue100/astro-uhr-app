// src/app/features/calendar-modal/calendar-modal.component.ts
import { Component, input, inject, signal, effect } from '@angular/core';
import { CalendarLogicService, CalendarResult } from '../../core/services/calendar-logic.service';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [],
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.css'],
})
export class CalendarModalComponent {
  readonly date = input.required<Date>();

  private readonly logic = inject(CalendarLogicService);
  readonly result = signal<CalendarResult | null>(null);

  constructor() {
    effect(() => {
      const d = this.date();
      this.logic.calculate(d).then(r => this.result.set(r));
    });
  }
}
