import { Component, OnInit } from '@angular/core';
import { ControlsComponent } from './features/controls/controls.component';
import { CanvasComponent } from './features/canvas/canvas.component';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ControlsComponent, CanvasComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ngOnInit() {
    // Initialisiert Analytics beim Starten der Anwendung
    inject();
  }
}
