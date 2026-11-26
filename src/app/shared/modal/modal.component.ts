import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  host: { class: 'modal-host' },
})
export class ModalComponent {
  readonly title = input<string>();
  readonly close = output<void>();

  onClose(): void {
    this.close.emit();
  }
}
