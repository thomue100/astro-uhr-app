# language: de
Funktionalität: Sonnenzeiger zeigt die Lübecker Ortszeit
  Der Sonnenzeiger läuft einmal am Tag über den 24-Stunden-Ring, mittags steht er oben.
  Er zeigt immer die Uhrzeit in Lübeck – auch wenn das Gerät auf eine
  andere Zeitzone eingestellt ist, damit die Simulation zur echten Uhr passt.

  Szenariogrundriss: Sonnenzeiger zur eingestellten Uhrzeit
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das Datum "<zeitpunkt>" einstelle
    Dann zeigt der Sonnenzeiger auf "<uhrzeit>" Uhr

    # Winterzeit (MEZ), Sommerzeit (MESZ), Mitternacht und die erste
    # Stunde nach der Umstellung auf Sommerzeit (02:00 → 03:00)
    Beispiele:
      | zeitpunkt        | uhrzeit |
      | 25.11.2026 12:00 | 12:00   |
      | 15.07.2026 12:00 | 12:00   |
      | 25.11.2026 00:00 | 00:00   |
      | 25.11.2026 06:30 | 06:30   |
      | 25.11.2026 18:45 | 18:45   |
      | 29.03.2026 03:00 | 03:00   |

  # Früherer Fehler: Die App las die Uhrzeit des Geräts statt der Lübecker Zeit.
  Szenariogrundriss: Gerät in einer anderen Zeitzone
    Angenommen mein Gerät ist auf die Zeitzone "<zeitzone>" eingestellt
    Und heute ist der "<zeitpunkt>"
    Und die Astro-Uhr ist geöffnet
    Dann zeigt der Sonnenzeiger auf "<uhrzeit>" Uhr

    Beispiele:
      | zeitzone         | zeitpunkt        | uhrzeit |
      | America/New_York | 25.11.2026 12:00 | 12:00   |
      | Asia/Tokyo       | 25.11.2026 12:00 | 12:00   |
      | UTC              | 15.07.2026 08:15 | 08:15   |


  # Die Zeitanzeige zeigt – wie der Sonnenzeiger – Lübecker Zeit, nicht die des Geräts
  Szenario: Zeitanzeige auf einem Gerät in New York
    Angenommen mein Gerät ist auf die Zeitzone "America/New_York" eingestellt
    Und heute ist der "25.11.2026 12:00"
    Und die Astro-Uhr ist geöffnet
    Dann lautet die Zeitanzeige der Simulation "Mittwoch, 25.11.2026 12:00:00 Lübecker Zeit"
