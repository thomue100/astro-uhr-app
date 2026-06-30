// src/app/features/info-modal/info-modal.component.ts
import { Component } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-info-modal-content',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css'],
})
export class InfoModalComponent {}
