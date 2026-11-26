# language: de
Funktionalität: Bedienung mit der Tab-Taste
  Wer ohne Maus bedient (Tastatur, Screenreader), springt mit der Tab-Taste
  von Bedienelement zu Bedienelement. Dabei dürfen nur Elemente erreichbar
  sein, die man auch sieht – sonst verschwindet der Fokus scheinbar, und ein
  Screenreader liest Unsichtbares vor (WCAG 2.4.3 Fokusreihenfolge).

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet

  # Beim Start ist die Simulation offen, der Kalender zugeklappt
  Szenario: Nach dem Start nur sichtbare Elemente
    Dann erreicht die Tab-Taste nur sichtbare Bedienelemente
    Und erreicht die Tab-Taste "Start"
    Und erreicht die Tab-Taste "Erläuterungen" nicht

  Szenario: Zugeklappte Simulation ist per Tab nicht erreichbar
    Wenn ich den Menüpunkt Simulation anklicke
    Dann erreicht die Tab-Taste nur sichtbare Bedienelemente
    Und erreicht die Tab-Taste "Start" nicht

  Szenario: Geöffneter Kalender ist per Tab erreichbar
    Wenn ich den Kalender öffne
    Dann erreicht die Tab-Taste nur sichtbare Bedienelemente
    Und erreicht die Tab-Taste "Erläuterungen"
    Und erreicht die Tab-Taste "Vergrößern"

  Szenario: Bedienelemente der Kalenderscheibe nur bei geöffnetem Kalender
    Dann erreicht die Tab-Taste "Vergrößern" nicht
    Und erreicht die Tab-Taste "⟲ Reset" nicht
