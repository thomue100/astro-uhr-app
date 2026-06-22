import { Component } from '@angular/core';
import { ControlsComponent } from './features/controls/controls.component';
import { CanvasComponent } from './features/canvas/canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ControlsComponent, CanvasComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
