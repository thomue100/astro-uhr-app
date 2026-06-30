import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryModalComponent } from './history-modal.component';

describe('HistoryModalComponent', () => {

  let component: HistoryModalComponent;   // ✅ FIX
  let fixture: ComponentFixture<HistoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
