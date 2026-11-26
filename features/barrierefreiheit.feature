# language: de
Funktionalität: Barrierefreiheit
  Die App soll auch mit Screenreader, Tastatur und Vergrößerung nutzbar sein
  (WCAG 2.2, Stufe AA). Eine automatische Prüfung mit axe-core deckt die
  technisch prüfbaren Regeln ab; was sie nicht sieht, prüfen eigene Szenarien
  (Textalternative der Uhr, Seitensprache; Tastatur siehe tastatur.feature).

  Szenariogrundriss: Keine Verstöße in allen Ansichten
    Angenommen die Astro-Uhr ist geöffnet
    Wenn <aktion>
    Dann findet die automatische Barrierefreiheitsprüfung keine Verstöße

    Beispiele:
      | aktion                                       |
      | ich das Datum "25.11.2026 12:00" einstelle   |
      | ich den Kalender öffne                       |
      | ich das Fenster "Einführung" öffne           |
      | ich das Fenster "Kunst & Geschichte" öffne   |
      | ich das 3D-Modell öffne                      |
      | ich die Sprache umschalte                    |

  Szenario: Keine Verstöße in den Kalender-Erläuterungen
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Erläuterungen zum Kalender öffne
    Dann findet die automatische Barrierefreiheitsprüfung keine Verstöße

  Szenario: Keine Verstöße auf dem Smartphone
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Dann findet die automatische Barrierefreiheitsprüfung keine Verstöße

  # WCAG 3.1.1: Screenreader sprechen Englisch sonst mit deutscher Aussprache
  Szenario: Die Seitensprache wechselt mit
    Angenommen die Astro-Uhr ist geöffnet
    Dann ist die Seitensprache "de"
    Wenn ich die Sprache umschalte
    Dann ist die Seitensprache "en"
    Wenn ich die Sprache umschalte
    Dann ist die Seitensprache "de"

  # WCAG 1.1.1: Die gezeichnete Uhr braucht eine Textalternative
  Szenario: Textalternative der Uhr
    Angenommen heute ist der "25.11.2026 12:00"
    Und die Astro-Uhr ist geöffnet
    Dann beschreibt die Textalternative der Uhr "Astronomische Uhr, eingestellt auf Mittwoch, 25. November 2026, 12:00 Uhr"
    Wenn ich das Datum "24.11.2026 15:53" einstelle
    Dann beschreibt die Textalternative der Uhr "Dienstag, 24. November 2026, 15:53 Uhr"
    Und beschreibt die Textalternative der Uhr "Mond: Vollmond"
    Wenn ich das Datum "09.11.2026 08:00" einstelle
    Dann beschreibt die Textalternative der Uhr "Montag, 9. November 2026, 08:00 Uhr"
    Und beschreibt die Textalternative der Uhr "Mond: Neumond"

  Szenario: Textalternative der Kalenderscheibe
    Angenommen heute ist der "25.11.2026 12:00"
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann beschreibt die Textalternative der Uhr "Kalenderscheibe der Astronomischen Uhr, eingestellt auf Mittwoch, 25. November 2026"

  Szenario: Textalternative auf Englisch
    Angenommen heute ist der "24.11.2026 15:53"
    Und die Astro-Uhr ist geöffnet
    Wenn ich die Sprache umschalte
    Dann beschreibt die Textalternative der Uhr "Astronomical clock set to Tuesday, 24 November 2026, 15:53"
    Und beschreibt die Textalternative der Uhr "Moon: full moon"
