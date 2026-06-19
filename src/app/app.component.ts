import { Component } from '@angular/core';
import { ControlsComponent } from './features/controls/controls';
import { CanvasComponent } from './features/canvas/canvas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ControlsComponent, CanvasComponent],
  templateUrl: './app.html',
})
export class AppComponent {}
