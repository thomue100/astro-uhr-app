import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal';
import { HistoryModalComponent } from '../history-modal/history-modal';
import { InfoModalComponent } from '../info-modal/info-modal';
import { CalendarModalComponent } from '../calendar-modal/calendar-modal';


type ModalType = 'info' | 'history' | 'calendar' | null;

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    HistoryModalComponent,
    InfoModalComponent,
    CalendarModalComponent
  ],
  templateUrl: './controls.html',
  styleUrls: ['./controls.css']
})



export class ControlsComponent {
  activeModal: ModalType = null;
  selectedDate = new Date();

  openModal(type: Exclude<ModalType, null>) {
    this.activeModal = type;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.activeModal = null;
    document.body.style.overflow = '';
  }

  // ✅ ESC-Listener
  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.activeModal) {
      this.closeModal();
    }
  }
}
