// src/app/features/history-modal/history-modal.component.ts
import { Component } from '@angular/core';
import { ImageViewerComponent } from '../../shared/image-viewer/image-viewer.component';

@Component({
  selector: 'app-history-modal-content',
  standalone: true,
  imports: [ImageViewerComponent],
  templateUrl: './history-modal.component.html',
  styleUrls: ['./history-modal.component.css'],
})
export class HistoryModalComponent {
  readonly stAnnenImage = {
    src: 'assets/images/history-modal/st-annen.jpg',
    alt: 'Erhaltenes Uhrwerk der ersten Astronomischen Uhr von 1405 im St.-Annen-Museum Lübeck',
    title: '📷 Das erhaltene Uhrwerk im St.-Annen-Museum, Lübeck',
    subtitle:
      'Reste der ersten Astronomischen Uhr von 1405 — Tierkreisscheibe mit vergoldeten ' +
      'Figuren, Zahnräder und Zeiger. Das untere Rad ist das Antriebsrad des Uhrwerks.',
  };
}
