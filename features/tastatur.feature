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
    Und erreicht die Tab-Taste "⟲ Ansicht zurücksetzen" nicht

  # ── Menüpunkte ─────────────────────────────────────────────────────────
  Szenario: Alle Menüpunkte sind per Tab erreichbar
    Dann erreicht die Tab-Taste "Einführung"
    Und erreicht die Tab-Taste "Simulation"
    Und erreicht die Tab-Taste "Kalender"
    Und erreicht die Tab-Taste "3D-Funktionsmodell"
    Und erreicht die Tab-Taste "Kunst & Geschichte"

  Szenario: Kalender mit der Tastatur auf- und zuklappen
    Dann ist der Menüpunkt "Kalender" als zugeklappt gekennzeichnet
    Wenn ich den Menüpunkt "Kalender" per Tastatur betätige
    Dann zeigt die Uhr die Kalenderscheibe
    Und ist der Menüpunkt "Kalender" als aufgeklappt gekennzeichnet
    Und ist der Menüpunkt "Simulation" als zugeklappt gekennzeichnet
    Und erreicht die Tab-Taste "Erläuterungen"
    Wenn ich den Menüpunkt "Kalender" mit der Leertaste betätige
    Dann zeigt die Uhr wieder das Zifferblatt
    Und ist der Menüpunkt "Kalender" als zugeklappt gekennzeichnet

  Szenario: Simulation mit der Tastatur zuklappen
    Dann ist der Menüpunkt "Simulation" als aufgeklappt gekennzeichnet
    Wenn ich den Menüpunkt "Simulation" per Tastatur betätige
    Dann ist das Simulationsfeld zugeklappt
    Und ist der Menüpunkt "Simulation" als zugeklappt gekennzeichnet

  # ── Fenster ────────────────────────────────────────────────────────────
  Szenariogrundriss: Fenster mit der Tastatur öffnen und schließen
    Wenn ich den Menüpunkt "<menüpunkt>" per Tastatur betätige
    Dann ist das Fenster als Dialog mit dem Titel "<titel>" gekennzeichnet
    Und liegt der Fokus auf "Schließen"
    Und bleibt der Fokus beim Tabben im Fenster
    Wenn ich die Escape-Taste drücke
    Dann ist kein Fenster geöffnet
    Und liegt der Fokus auf "<menüpunkt>"

    Beispiele:
      | menüpunkt          | titel                                        |
      | Einführung         | Die Astronomische Uhr 🧭                     |
      | Kunst & Geschichte | Kunst & Geschichte der Astronomischen Uhr 📜 |

  Szenario: Erläuterungen per Tastatur – der Fokus kehrt zurück
    Wenn ich den Menüpunkt "Kalender" per Tastatur betätige
    Und ich die Erläuterungen zum Kalender öffne
    Dann liegt der Fokus auf "Schließen"
    Wenn ich das Fenster mit „Schließen“ schließe
    Dann ist kein Fenster geöffnet
    Und liegt der Fokus auf "Erläuterungen"

  # ── 3D-Modell ──────────────────────────────────────────────────────────
  Szenario: 3D-Modell mit der Tastatur öffnen und verlassen
    Wenn ich den Menüpunkt "3D-Funktionsmodell" per Tastatur betätige
    Dann zeigt der Rahmen das 3D-Modell
    Wenn ich den Menüpunkt "Zurück zur Uhr" per Tastatur betätige
    Dann zeigt der Rahmen wieder die Uhr mit dem Menü
