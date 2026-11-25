# language: de
Funktionalität: Mondphase und Mondzeiger
  Die Uhr zeigt die Mondphase und mit dem Mondzeiger die Stellung des Mondes
  zur Sonne: Bei Vollmond steht er der Sonne gegenüber, bei Neumond bei ihr.
  Wie das Räderwerk rechnet die App mit dem mittleren Mondlauf; der wahre
  Mond weicht davon um bis zu etwa 15 Stunden ab.

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet

  # Zeitpunkte in Lübecker Ortszeit; darunter Finsternis-Tage:
  # 03.03. totale Mondfinsternis, 28.08. partielle Mondfinsternis
  Szenariogrundriss: Vollmond
    Wenn ich das Datum "<zeitpunkt>" einstelle
    Dann ist Vollmond
    Und steht der Mond der Sonne gegenüber

    Beispiele:
      | zeitpunkt        |
      | 03.01.2026 11:03 |
      | 03.03.2026 12:38 |
      | 31.05.2026 10:45 |
      | 28.08.2026 06:18 |
      | 24.11.2026 15:53 |

  # 17.02. ringförmige, 12.08. totale Sonnenfinsternis
  Szenariogrundriss: Neumond
    Wenn ich das Datum "<zeitpunkt>" einstelle
    Dann ist Neumond
    Und steht der Mond bei der Sonne

    Beispiele:
      | zeitpunkt        |
      | 17.02.2026 13:01 |
      | 12.08.2026 19:37 |
      | 09.11.2026 08:02 |

  Szenariogrundriss: Zu- und abnehmender Mond
    Wenn ich das Datum "<datum>" einstelle
    Dann nimmt der Mond <richtung>

    Beispiele:
      | datum      | richtung |
      | 16.11.2026 | zu       |
      | 01.12.2026 | ab       |
      | 06.08.2026 | ab       |
      | 20.08.2026 | zu       |

  @visuell
  Szenario: Vollmond steht mittags unten, gegenüber der Sonne
    Wenn ich das Datum "24.11.2026 12:00" einstelle
    Dann sieht der untere Bereich der Uhr aus wie im Referenzbild "vollmond-mittag-24-11"
