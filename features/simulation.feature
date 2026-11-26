# language: de
Funktionalität: Simulation – Zeitreise und Zeitraffer
  Mit der Simulation stelle ich jeden Zeitpunkt zwischen 1911 und 2080 ein
  (so weit reicht die Kalenderscheibe) oder lasse die Uhr im Zeitraffer laufen.

  Grundlage:
    Angenommen heute ist der "25.11.2026 14:30"
    Und die Astro-Uhr ist geöffnet

  Szenario: Die Uhr startet mit dem aktuellen Zeitpunkt
    Dann zeigt die Simulation den Zeitpunkt "25.11.2026 14:30"
    Und ist der Zeitraffer angehalten

  Szenario: Zeitpunkt einstellen
    Wenn ich das Datum "22.05.1965 08:15" einstelle
    Dann zeigt die Simulation den Zeitpunkt "22.05.1965 08:15"

  Szenariogrundriss: Grenzen des Kalenders werden eingehalten
    Wenn ich das Datum "15.06.2026 12:00" einstelle
    Und ich das Datum "<zeitpunkt>" einstelle
    Dann zeigt die Simulation den Zeitpunkt "<angezeigt>"

    Beispiele:
      | zeitpunkt        | angezeigt        |
      | 01.01.1911 00:00 | 01.01.1911 00:00 |
      | 31.12.2080 23:59 | 31.12.2080 23:59 |
      | 31.12.1910 23:59 | 15.06.2026 12:00 |
      | 01.01.2081 00:00 | 15.06.2026 12:00 |

  Szenario: Zeitraffer starten und anhalten
    Wenn ich die Simulation starte
    Dann ist der Zeitraffer gestartet
    Und läuft die simulierte Zeit vorwärts
    Wenn ich die Simulation anhalte
    Dann ist der Zeitraffer angehalten
    Und bleibt die simulierte Zeit stehen

  Szenario: Geschwindigkeit einstellen
    Dann steht die Geschwindigkeit auf "0.5x"
    Wenn ich die Geschwindigkeit auf 2.0 stelle
    Dann steht die Geschwindigkeit auf "2.0x"

  Szenario: Zurück zum aktuellen Zeitpunkt
    Wenn ich das Datum "01.01.2000 00:00" einstelle
    Und ich die Simulation zurücksetze
    Dann zeigt die Simulation den Zeitpunkt "25.11.2026 14:30"

  Szenario: Zurücksetzen hält den Zeitraffer an
    Wenn ich die Simulation starte
    Und ich die Simulation zurücksetze
    Dann ist der Zeitraffer angehalten
    Und zeigt die Simulation den Zeitpunkt "25.11.2026 14:30"

  Szenario: Öffnen des Kalenders hält den Zeitraffer an
    Wenn ich die Simulation starte
    Und ich den Kalender öffne
    Dann ist der Zeitraffer angehalten
    Und bleibt die simulierte Zeit stehen

  Szenario: Simulation zu- und wieder aufklappen
    Dann ist das Simulationsfeld zu sehen
    Wenn ich den Menüpunkt Simulation anklicke
    Dann ist das Simulationsfeld zugeklappt
    Wenn ich den Menüpunkt Simulation anklicke
    Dann ist das Simulationsfeld zu sehen

  Szenario: Öffnen der Simulation blendet die Kalenderscheibe aus
    Wenn ich den Kalender öffne
    Dann zeigt die Uhr die Kalenderscheibe
    Wenn ich den Menüpunkt Simulation anklicke
    Dann ist das Simulationsfeld zu sehen
    Und zeigt die Uhr wieder das Zifferblatt

  # Die Kalenderscheibe endet 2080 – der Zeitraffer läuft nicht darüber hinaus
  Szenario: Der Zeitraffer hält am Ende des Kalenders an
    Wenn ich das Datum "31.12.2080 23:30" einstelle
    Und ich die Geschwindigkeit auf 5.0 stelle
    Und ich die Simulation starte
    Dann hält der Zeitraffer beim Zeitpunkt "31.12.2080 23:59" an
    Wenn ich den Kalender öffne
    Dann zeigt der Kalender "31.12.2080"
    Und meldet der Kalender kein ungültiges Jahr

  # UX-Review: Wochentag und Zeitzone machen die laufende Anzeige aussagekräftig
  Szenario: Zeitanzeige mit Wochentag in Lübecker Zeit
    Dann lautet die Zeitanzeige der Simulation "Mittwoch, 25.11.2026 14:30:00 Lübecker Zeit"
    Wenn ich die Sprache umschalte
    Dann lautet die Zeitanzeige der Simulation "Wednesday, 25.11.2026 14:30:00 Lübeck time"
