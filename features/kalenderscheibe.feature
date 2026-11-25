# language: de
Funktionalität: Kalenderscheibe ansehen und bedienen
  Der goldene Stern-Zeiger gehört zum Gehäuse und steht still,
  die Kalenderscheibe dreht sich darunter einmal im Jahr.
  Zum genauen Ablesen lässt sich die Scheibe vergrößern, drehen und
  verschieben; „Zurücksetzen“ stellt sie wieder auf den heutigen Tag.

  @visuell
  Szenariogrundriss: Zeiger steht auf dem heutigen Tag
    Angenommen heute ist der "<datum>"
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann zeigt der Zeiger der Kalenderscheibe auf denselben Tag wie im Referenzbild "<bild>"

    # 29.03. und 25.10.: Tage der Zeitumstellung (früher um einen Tag versetzt)
    Beispiele:
      | datum      | bild          |
      | 01.01.2026 | zeiger-01-01  |
      | 29.03.2026 | zeiger-29-03  |
      | 25.10.2026 | zeiger-25-10  |
      | 25.11.2026 | zeiger-25-11  |

  Szenario: Kalender öffnen und schließen
    Angenommen die Astro-Uhr ist geöffnet
    Dann ist der Knopf zum Zurücksetzen der Kalenderscheibe nicht bedienbar
    Wenn ich den Kalender öffne
    Dann zeigt die Uhr die Kalenderscheibe
    Und sind die Zoom- und Modusknöpfe der Kalenderscheibe bedienbar
    Und ist der Knopf zum Zurücksetzen der Kalenderscheibe bedienbar
    Wenn ich den Kalender schließe
    Dann zeigt die Uhr wieder das Zifferblatt
    Und sind die Zoom- und Modusknöpfe der Kalenderscheibe nicht bedienbar
    Und ist der Knopf zum Zurücksetzen der Kalenderscheibe nicht bedienbar

  # Grundgröße 1,5; Stufen zu 0,25; Grenzen 0,5 und 8
  Szenariogrundriss: Vergrößern und verkleinern mit den Knöpfen
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe <mehr>-mal vergrößere
    Und ich die Kalenderscheibe <weniger>-mal verkleinere
    Dann wird die Kalenderscheibe in Zoomstufe <stufe> angezeigt

    Beispiele:
      | mehr | weniger | stufe |
      | 2    | 0       | 2.0   |
      | 0    | 3       | 0.75  |
      | 30   | 0       | 8.0   |
      | 0    | 10      | 0.5   |

  Szenario: Vergrößern mit dem Mausrad
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich das Mausrad 4-mal nach vorn drehe
    Dann wird die Kalenderscheibe in Zoomstufe 2.5 angezeigt

  Szenario: Scheibe mit der Maus drehen
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe mit der Maus um 90 Grad im Uhrzeigersinn drehe
    Dann ist die Kalenderscheibe um 90 Grad im Uhrzeigersinn gedreht

  Szenario: Scheibe verschieben
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich in den Verschiebe-Modus wechsle
    Und ich die Kalenderscheibe um 120 Pixel nach rechts und 40 Pixel nach unten ziehe
    Dann ist die Kalenderscheibe um 120 Pixel nach rechts und 40 Pixel nach unten verschoben

  @visuell
  Szenario: Zurücksetzen stellt die Scheibe wieder auf den heutigen Tag
    Angenommen heute ist der "25.11.2026"
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe 3-mal vergrößere
    Und ich die Kalenderscheibe mit der Maus um 60 Grad im Uhrzeigersinn drehe
    Und ich in den Verschiebe-Modus wechsle
    Und ich die Kalenderscheibe um 80 Pixel nach rechts und 30 Pixel nach unten ziehe
    Und ich die Ansicht der Kalenderscheibe zurücksetze
    Dann wird die Kalenderscheibe in Zoomstufe 1.5 angezeigt
    Und ist die Kalenderscheibe um 0 Pixel nach rechts und 0 Pixel nach unten verschoben
    Und zeigt der Zeiger der Kalenderscheibe auf denselben Tag wie im Referenzbild "zeiger-25-11"

  # Auf dem Smartphone wird nur per Geste gedreht/gezoomt; sichtbar bleibt nur „Zurücksetzen“
  Szenario: Bedienelemente auf dem Smartphone
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann ist der Knopf zum Zurücksetzen der Kalenderscheibe bedienbar
    Und sind die Zoom- und Modusknöpfe der Kalenderscheibe nicht bedienbar
