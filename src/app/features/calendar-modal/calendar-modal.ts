import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarLogicService } from '../../core/services/calendar-logic.service';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-modal.html'
})
export class CalendarModalComponent implements OnInit {

  @Input() date!: Date;

  result: any;
  title = '';

  constructor(
    private logic: CalendarLogicService,
    private cdr: ChangeDetectorRef   // ✅ NEU
  ) {}

  async ngOnInit() {
    this.result = await this.logic.calculate(this.date);
    this.title = this.result.title;

    this.cdr.detectChanges();  // ✅ DAS ist der entscheidende Fix
  }
}
