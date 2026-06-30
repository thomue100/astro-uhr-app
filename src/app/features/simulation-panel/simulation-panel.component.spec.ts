import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationPanelComponent } from './simulation-panel.component';

describe('SimulationPanelComponent', () => {
  let component: SimulationPanelComponent;
  let fixture: ComponentFixture<SimulationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
