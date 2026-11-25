# language: de
Funktionalität: Sonne im Tierkreis
  Der Tierkreisring zeigt die 13 Sternbilder, durch die die Sonne im Laufe
  eines Jahres wandert – mit den astronomischen Grenzen (IAU), also
  einschließlich des Schlangenträgers. Die Sonne muss am jeweiligen Tag im
  richtigen Sternbild stehen.

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet

  # Stichtage jeweils mitten im Zeitraum, in dem die Sonne im Sternbild steht
  # (der Skorpion wird nur vom 23. bis 29. November durchlaufen).
  Szenariogrundriss: Sonne steht im Sternbild der Jahreszeit
    Wenn ich das Datum "<datum>" einstelle
    Dann steht die Sonne im Sternbild "<sternbild>"

    Beispiele:
      | datum      | sternbild       |
      | 03.01.2026 | Schütze         |
      | 03.02.2026 | Steinbock       |
      | 28.02.2026 | Wassermann      |
      | 30.03.2026 | Fische          |
      | 01.05.2026 | Widder          |
      | 02.06.2026 | Stier           |
      | 05.07.2026 | Zwillinge       |
      | 31.07.2026 | Krebs           |
      | 28.08.2026 | Löwe            |
      | 08.10.2026 | Jungfrau        |
      | 11.11.2026 | Waage           |
      | 25.11.2026 | Skorpion        |
      | 08.12.2026 | Schlangenträger |

  # Das Sternbild hängt nur vom Tag ab, nicht von der Uhrzeit.
  Szenariogrundriss: Sternbild bleibt über den Tag gleich
    Wenn ich das Datum "<zeitpunkt>" einstelle
    Dann steht die Sonne im Sternbild "Skorpion"

    Beispiele:
      | zeitpunkt        |
      | 25.11.2026 00:30 |
      | 25.11.2026 12:00 |
      | 25.11.2026 23:30 |

  @visuell
  Szenariogrundriss: Sonnenzeiger über dem Sternbild
    Wenn ich das Datum "<datum> 12:00" einstelle
    Dann sieht der Bereich um den Sonnenzeiger aus wie im Referenzbild "<bild>"

    Beispiele:
      | datum      | bild               |
      | 02.06.2026 | tierkreis-stier    |
      | 25.11.2026 | tierkreis-skorpion |
