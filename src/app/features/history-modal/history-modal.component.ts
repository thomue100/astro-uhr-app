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

  get stAnnenImage(): ImageViewerConfig {
    return {
      src:      'assets/images/history-modal/st-annen.jpg',
      alt:      this.t.translate('modal_history.img_title'),
      title:    this.t.translate('modal_history.img_title'),
      subtitle: this.t.translate('modal_history.img_subtitle'),
    };
  }

  /** Hero-Bild oben: Figurenaufsatz/Giebel der Uhr im Gesamteindruck. */
  get giebelImage(): ImageViewerConfig {
    return {
      src:      'assets/images/history-modal/giebel.jpg',
      alt:      this.t.translate('modal_history.img_giebel_title'),
      title:    this.t.translate('modal_history.img_giebel_title'),
      subtitle: this.t.translate('modal_history.img_giebel_subtitle'),
    };
  }

  /** Passend zum Technik-Abschnitt (Zeigerwerk/Mechanismen). */
  get getriebeImage(): ImageViewerConfig {
    return {
      src:      'assets/images/history-modal/getriebe.jpg',
      alt:      this.t.translate('modal_history.img_getriebe_title'),
      title:    this.t.translate('modal_history.img_getriebe_title'),
      subtitle: this.t.translate('modal_history.img_getriebe_subtitle'),
    };
  }

  /** Passend zum Technik-Abschnitt (fertiggestelltes Uhrwerk). */
  get uhrwerkImage(): ImageViewerConfig {
    return {
      src:      'assets/images/history-modal/uhrwerk.jpg',
      alt:      this.t.translate('modal_history.img_uhrwerk_title'),
      title:    this.t.translate('modal_history.img_uhrwerk_title'),
      subtitle: this.t.translate('modal_history.img_uhrwerk_subtitle'),
    };
  }

  /** Passend zum Figurenumgang-Abschnitt. */
  get figurenumlaufImage(): ImageViewerConfig {
    return {
      src:      'assets/images/history-modal/figurenumlauf.jpg',
      alt:      this.t.translate('modal_history.img_figurenumlauf_title'),
      title:    this.t.translate('modal_history.img_figurenumlauf_title'),
      subtitle: this.t.translate('modal_history.img_figurenumlauf_subtitle'),
    };
  }
}
