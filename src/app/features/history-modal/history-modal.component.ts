// src/app/features/history-modal/history-modal.component.ts
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { ImageViewerComponent, ImageViewerConfig } from '../../shared/image-viewer/image-viewer.component';

@Component({
  selector: 'app-history-modal-content',
  standalone: true,
  imports: [TranslatePipe, ImageViewerComponent],
  templateUrl: './history-modal.component.html',
  styleUrls: ['./history-modal.component.css'],
})
export class HistoryModalComponent {
  readonly t = inject(TranslationService);

  // Das Bild-Konfig-Objekt wird als computed property gebaut,
  // damit Titel und Untertitel bei Sprachwechsel automatisch aktualisiert werden.
  get stAnnenImage(): ImageViewerConfig {
    return {
      src:      'assets/images/st-annen.jpg',
      alt:      this.t.translate('modal_history.img_title'),
      title:    this.t.translate('modal_history.img_title'),
      subtitle: this.t.translate('modal_history.img_subtitle'),
    };
  }
}
