import { Component, OnInit, inject as injizieren } from '@angular/core';
import { ControlsComponent } from './features/controls/controls.component';
import { CanvasComponent } from './features/canvas/canvas.component';
import { TranslationService } from './core/services/translation.service';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ControlsComponent, CanvasComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /** Für die Titelzeile mit Sprachumschalter (steht vor Uhr und Menü). */
  readonly t = injizieren(TranslationService);

  ngOnInit() {
    // Initialisiert Analytics beim Starten der Anwendung
    inject();
  }
}
