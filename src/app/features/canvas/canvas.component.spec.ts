import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasComponent } from './canvas.component'; // ✅ korrigiert

describe('CanvasComponent', () => {

  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTesting
    Module({
      imports: [CanvasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
