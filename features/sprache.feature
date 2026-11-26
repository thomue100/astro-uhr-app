# language: de
Funktionalität: Sprache
  Die App ist zweisprachig (Deutsch/Englisch). Sie startet in der Sprache
  des Browsers (Deutsch nur bei deutschem Browser, sonst Englisch) und merkt
  sich eine ausdrücklich gewählte Sprache auch über das Neuladen hinaus.

  Szenario: Von Deutsch auf Englisch und zurück
    Angenommen die Astro-Uhr ist geöffnet
    Dann heißt der Menüpunkt für die Einführung "Einführung"
    Wenn ich die Sprache umschalte
    Dann heißt der Menüpunkt für die Einführung "Introduction"
    Wenn ich die Sprache umschalte
    Dann heißt der Menüpunkt für die Einführung "Einführung"

  Szenariogrundriss: Startsprache folgt dem Browser
    Angenommen mein Browser ist auf die Sprache "<browser>" eingestellt
    Und die Astro-Uhr ist geöffnet
    Dann heißt der Menüpunkt für die Einführung "<einführung>"

    Beispiele:
      | browser | einführung   |
      | de-DE   | Einführung   |
      | de-AT   | Einführung   |
      | en-US   | Introduction |
      | fr-FR   | Introduction |

  Szenario: Die gewählte Sprache bleibt nach dem Neuladen
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich die Sprache umschalte
    Und ich die Seite neu lade
    Dann heißt der Menüpunkt für die Einführung "Introduction"

  Szenario: Die gewählte Sprache hat Vorrang vor der Browsersprache
    Angenommen mein Browser ist auf die Sprache "en-US" eingestellt
    Und die Astro-Uhr ist geöffnet
    Wenn ich die Sprache umschalte
    Und ich die Seite neu lade
    Dann heißt der Menüpunkt für die Einführung "Einführung"
