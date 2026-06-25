import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationPanel } from './simulation-panel';

describe('SimulationPanel', () => {
  let component: SimulationPanel;
  let fixture: ComponentFixture<SimulationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
