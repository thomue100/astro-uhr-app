import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ControlsComponent } from './controls.component';

describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let fixture: ComponentFixture<ControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ControlsComponent],
      // Importiere hier ggf. FormsModule, falls du [(ngModel)] nutzt
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sollte Simulation öffnen und Kalender schließen, wenn Simulation-Header geklickt wird', () => {
    // 1. Setup: Erst Kalender öffnen
    component.isSimulationOpen = false;
    component.isCalendarOpen = true;
    fixture.detectChanges();

    // 2. Aktion: Klick auf Simulation-Header
    const simHeader = fixture.debugElement.query(By.css('#controlsHeader'));
    simHeader.nativeElement.click();
    fixture.detectChanges();

    // 3. Assertion: Prüfen, ob die Flags korrekt gesetzt sind
    expect(component.isSimulationOpen).toBeTrue();
    expect(component.isCalendarOpen).toBeFalse();

    // 4. Assertion: Prüfen, ob die CSS-Klassen im DOM stimmen
    const simContent = fixture.debugElement.query(By.css('#controlsContent'));
    const calContent = fixture.debugElement.query(By.css('#calendarContent'));

    expect(simContent.classes['controls-content--hidden']).toBeFalsy();
    expect(calContent.classes['controls-content--hidden']).toBeTrue();
  });
});ng
