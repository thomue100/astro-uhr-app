import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { ControlsComponent } from './controls.component';
import { ClockSimulationService } from '../../core/services/clock-simulation.service';

describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let fixture: ComponentFixture<ControlsComponent>;

  const clockServiceMock = {
    currentDate: signal(new Date()),

    isAnimationRunning: vi.fn(),
    stopAnimation: vi.fn(),

    setShowCalendarDisk: vi.fn(),
    triggerRedraw: vi.fn(),

    setCalendarZoom: vi.fn(),
    setAngleCalendarDisk: vi.fn(),

    getCurrentDate: vi.fn(() => new Date()),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsComponent],
      providers: [
        {
          provide: ClockSimulationService,
          useValue: clockServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsComponent);
    component = fixture.componentInstance;

    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
