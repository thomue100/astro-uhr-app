// src/app/features/info-modal/info-modal.component.ts
import { Component } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { SprunglisteComponent } from '../../shared/sprungliste/sprungliste.component';

@Component({
  selector: 'app-info-modal-content',
  standalone: true,
  imports: [SprunglisteComponent, TranslatePipe],
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css'],
})
export class InfoModalComponent {}
