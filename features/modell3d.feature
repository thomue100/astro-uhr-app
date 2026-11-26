# language: de
Funktionalität: 3D-Funktionsmodell des Räderwerks
  Das 3D-Modell zeigt im Rahmen der Uhr, wie das Räderwerk Sonne, Tierkreis
  und Mond antreibt. Solange es offen ist, ersetzt sein Bedienfeld das Menü;
  „Zurück zur Uhr“ oder die Escape-Taste stellt den vorigen Zustand wieder her.

  Szenario: 3D-Modell öffnen und zur Uhr zurückkehren
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Dann zeigt der Rahmen das 3D-Modell
    Und ersetzt das Bedienfeld des 3D-Modells das Menü
    Wenn ich zur Uhr zurückkehre
    Dann zeigt der Rahmen wieder die Uhr mit dem Menü

  Szenario: Escape schließt das 3D-Modell
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich die Escape-Taste drücke
    Dann zeigt der Rahmen wieder die Uhr mit dem Menü

  Szenario: Nach dem 3D-Modell erscheint die zuvor geöffnete Kalenderscheibe wieder
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich das 3D-Modell öffne
    Und ich zur Uhr zurückkehre
    Dann zeigt die Uhr die Kalenderscheibe

  Szenario: Öffnen des 3D-Modells hält den Zeitraffer der Uhr an
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich die Simulation starte
    Und ich das 3D-Modell öffne
    Und ich zur Uhr zurückkehre
    Dann ist der Zeitraffer angehalten

  # Die echte Uhr wird zur Sommerzeit umgestellt – das Modell zeigt wie die
  # Uhr die Lübecker Ortszeit (Winter MEZ, Sommer MESZ). Früher rechnete das
  # Modell ganzjährig in MEZ und ging im Sommer eine Stunde nach.
  Szenariogrundriss: Das Modell übernimmt den eingestellten Zeitpunkt der Uhr
    Angenommen mein Gerät bevorzugt reduzierte Bewegung
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Datum "<zeitpunkt>" einstelle
    Und ich das 3D-Modell öffne
    Dann ist die Uhr im 3D-Modell auf "<zeitpunkt>" gestellt
    Und heißt das Feld zum Stellen der Uhr "Uhr stellen (Lübecker Zeit)"

    # Winter, Sommer und jeweils die erste Stunde nach den Umstellungen 2026
    Beispiele:
      | zeitpunkt        |
      | 22.12.1965 09:45 |
      | 15.07.2026 12:00 |
      | 29.03.2026 03:30 |
      | 25.10.2026 03:30 |

  Szenario: Bei reduzierter Bewegung läuft das Modell in Echtzeit
    Angenommen mein Gerät bevorzugt reduzierte Bewegung
    Und die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Dann läuft das 3D-Modell mit "Echtzeit"

  Szenario: Ohne Sonderwunsch läuft das Modell im Zeitraffer
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Dann läuft das 3D-Modell mit "10 Min. pro Sek."
    Und rückt die Uhr im 3D-Modell vor

  Szenario: Anhalten und weiterlaufen lassen
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich das 3D-Modell anhalte
    Dann steht die Zeit im 3D-Modell still
    Wenn ich das 3D-Modell weiterlaufen lasse
    Dann rückt die Uhr im 3D-Modell vor

  # Headless rendert per Software nur wenige Bilder pro Sekunde, und das Modell
  # rückt je Bild höchstens 0,1 s vor – daher keine strenge Zeitvorgabe.
  Szenario: Schnellster Zeitraffer
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich die Geschwindigkeit des 3D-Modells auf "1 Tag pro Sek." stelle
    Dann rückt die Uhr im 3D-Modell um mindestens 1 Tag vor

  Szenario: Uhr im Modell stellen und auf jetzt zurücksetzen
    Angenommen heute ist der "25.11.2026 14:30"
    Und die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich das 3D-Modell anhalte
    Und ich die Uhr im 3D-Modell auf "01.01.2000 08:00" stelle
    Dann ist die Uhr im 3D-Modell auf "01.01.2000 08:00" gestellt
    Und steht die Zeit im 3D-Modell still
    Wenn ich im 3D-Modell auf „Jetzt“ klicke
    Dann ist die Uhr im 3D-Modell auf "25.11.2026 14:30" gestellt

  Szenario: Uhr im Modell auf eine Sommerzeit stellen
    Angenommen heute ist der "15.07.2026 16:45"
    Und die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich das 3D-Modell anhalte
    Und ich die Uhr im 3D-Modell auf "01.08.2026 12:00" stelle
    Dann ist die Uhr im 3D-Modell auf "01.08.2026 12:00" gestellt
    Wenn ich im 3D-Modell auf „Jetzt“ klicke
    Dann ist die Uhr im 3D-Modell auf "15.07.2026 16:45" gestellt

  Szenario: Grundeinstellung der Darstellung
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Dann ist im 3D-Modell "Scheiben durchsichtig" ausgeschaltet
    Und ist im 3D-Modell "Christusfigur" eingeschaltet
    Und ist im 3D-Modell "Beschriftung" eingeschaltet
    Und zeigt das 3D-Modell Beschriftungen

  Szenario: Beschriftung aus- und einschalten
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich im 3D-Modell "Beschriftung" umschalte
    Dann ist im 3D-Modell "Beschriftung" ausgeschaltet
    Und zeigt das 3D-Modell keine Beschriftungen
    Wenn ich im 3D-Modell "Beschriftung" umschalte
    Dann zeigt das 3D-Modell Beschriftungen

  # Undurchsichtige Scheiben verdecken die Teile dahinter samt Beschriftung
  Szenario: Durchsichtige Scheiben geben den Blick aufs Räderwerk frei
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich mir die sichtbaren Beschriftungen merke
    Und ich im 3D-Modell "Scheiben durchsichtig" umschalte
    Dann ist im 3D-Modell "Scheiben durchsichtig" eingeschaltet
    Und sind im 3D-Modell mehr Beschriftungen sichtbar als vorher

  Szenariogrundriss: Ansicht wechseln
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich mir die sichtbaren Beschriftungen merke
    Und ich die Ansicht "<ansicht>" wähle
    Dann hat sich die Kamera bewegt

    Beispiele:
      | ansicht        |
      | Zifferblatt    |
      | Seitenansicht  |
      | Räderwerk      |

  Szenario: Beschriftungen auf Englisch
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich im 3D-Modell "Scheiben durchsichtig" umschalte
    Und ich die Sprache umschalte
    Dann zeigt das 3D-Modell die Beschriftung "Sun"
    Und zeigt der Rahmen das 3D-Modell

  # Kamera mit der Maus: Ziehen dreht, Umschalt + Ziehen verschiebt, Mausrad zoomt.
  # Angehalten, damit nur die Kamera die Beschriftungen bewegt (nicht der Zeiger).
  Szenario: Modell mit der Maus drehen
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich das 3D-Modell anhalte
    Und ich mir die sichtbaren Beschriftungen merke
    Und ich das 3D-Modell mit der Maus um 150 Pixel nach rechts ziehe
    Dann hat sich die Kamera bewegt

  Szenario: Modell mit gedrückter Umschalttaste verschieben
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich das 3D-Modell anhalte
    Und ich mir die sichtbaren Beschriftungen merke
    Und ich das 3D-Modell mit gedrückter Umschalttaste um 120 Pixel nach rechts ziehe
    Dann rücken alle Beschriftungen gemeinsam nach rechts

  Szenario: Mit dem Mausrad heranzoomen
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich das 3D-Modell anhalte
    Und ich mir den Abstand der Beschriftungen merke
    Und ich am Mausrad 3-mal nach vorn drehe
    Dann rücken die Beschriftungen auseinander

  Szenario: Christusfigur aus- und einblenden
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Und ich im 3D-Modell "Christusfigur" umschalte
    Dann ist im 3D-Modell "Christusfigur" ausgeschaltet
    Wenn ich im 3D-Modell "Christusfigur" umschalte
    Dann ist im 3D-Modell "Christusfigur" eingeschaltet
