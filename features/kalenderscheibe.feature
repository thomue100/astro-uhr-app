# language: de
@visuell
Funktionalität: Datumszeiger der Kalenderscheibe
  Der goldene Stern-Zeiger gehört zum Gehäuse und steht still,
  die Kalenderscheibe dreht sich darunter einmal im Jahr.
  Der Zeiger muss immer auf den heutigen Tag zeigen.

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
