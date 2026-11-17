// src/app/features/model3d/model3d-panel.component.ts
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Model3dStateService } from '../../core/services/model3d-state.service';
import { ViewKey } from './clock-math';

/** Bedienfeld des 3D-Modells – ersetzt in der Sidebar das Menü, solange das Modell offen ist. */
@Component({
  selector: 'app-model3d-panel',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './model3d-panel.component.html',
  styleUrls: ['./model3d-panel.component.css'],
})
export class Model3dPanelComponent {
  readonly s = inject(Model3dStateService);

  readonly speeds = [1, 60, 600, 3600, 21600, 86400];
  readonly views: ViewKey[] = ['start', 'front', 'side', 'back'];

  togglePlay(): void { this.s.playing.update((p) => !p); }
  setSpeed(v: string): void { this.s.speed.set(+v); }
  toggleGlass(): void { this.s.glass.update((g) => !g); }
  toggleHeil(): void { this.s.heil.update((h) => !h); }
  toggleTags(): void { this.s.tags.update((v) => !v); }
}
