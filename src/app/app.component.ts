import { Component } from '@angular/core';
import { ControlsComponent } from './features/controls/controls';
import { Canvas } from './features/canvas/canvas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ControlsComponent, Canvas],
  templateUrl: './app.html',
})
export class AppComponent {}
