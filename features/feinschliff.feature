# language: de
Funktionalität: Feinschliff der Oberfläche
  Kein unnötiger Scrollbalken, ein einheitlicher Symbolsatz statt Emoji,
  Orientierung in langen Texten und auffindbare Gesten an der Kalenderscheibe
  (UX-Review, Punkte 12–16).

  # Der Scrollbalken war am Computer per CSS dauerhaft eingeschaltet; außerdem
  # war die Seite bei niedrigen Fenstern ein paar Pixel zu hoch.
  Szenariogrundriss: Am Computer kein Scrollbalken
    Angenommen ich nutze einen Computer mit <breite> mal <hoehe> Pixeln
    Und die Astro-Uhr ist geöffnet
    Dann braucht die Seite keinen Scrollbalken
    Und reicht das Menü bis zur Unterkante der Uhr

    Beispiele:
      | breite | hoehe |
      | 1024   | 700   |
      | 1280   | 720   |
      | 1366   | 768   |
      | 1920   | 1080  |

  Szenario: Bedienelemente mit einheitlichen Symbolen statt Emoji
    Angenommen die Astro-Uhr ist geöffnet
    Dann enthalten die Bedienelemente keine Emoji
    Wenn ich den Kalender öffne
    Dann enthalten die Bedienelemente keine Emoji

  Szenario: Nur eine Trennlinie unter dem Fenstertitel
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "Einführung" öffne
    Dann hat das Fenster unter dem Titel nur eine Trennlinie

  Szenariogrundriss: Sprungliste in langen Fenstern
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "<fenster>" öffne
    Und ich in der Sprungliste "<eintrag>" wähle
    Dann steht der Abschnitt "<abschnitt>" oben im Fenster und hat den Fokus

    Beispiele:
      | fenster            | eintrag        | abschnitt                                 |
      | Einführung         | Bedienung      | II. Bedienelemente und Funktionen         |
      | Kunst & Geschichte | Figurenumgang  | Der Figurenumgang: Die Gläubigen der Welt |

  Szenario: Gesten-Hinweis an der Kalenderscheibe am Computer
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann zeigt die Kalenderscheibe den Hinweis "Ziehen zum Drehen · Mausrad zum Zoomen"
    Wenn ich das Mausrad 1-mal nach vorn drehe
    Dann ist der Hinweis an der Kalenderscheibe verschwunden

  Szenario: Gesten-Hinweis an der Kalenderscheibe auf dem Smartphone
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann zeigt die Kalenderscheibe den Hinweis "Mit einem Finger drehen · mit zwei Fingern zoomen und verschieben"
    Wenn ich die Kalenderscheibe mit einem Finger um 30 Grad im Uhrzeigersinn drehe
    Dann ist der Hinweis an der Kalenderscheibe verschwunden

  # Fehlerbild: Beim Wechsel Simulation ↔ Kalender waren kurz beide Panels
  # offen, die Seite lief über, der Scrollbalken blitzte auf und die Uhr
  # wackelte. 1536 × 730: Laptop mit 125 % Skalierung.
  Szenariogrundriss: Umschalten zwischen Simulation und Kalender ohne Wackeln
    Angenommen ich nutze einen Computer mit <breite> mal <hoehe> Pixeln
    Und die Astro-Uhr ist geöffnet
    Wenn ich beim Umschalten auf "Kalender" Seite und Uhr beobachte
    Dann ist die Seite dabei nie höher als das Fenster geworden
    Und hat die Uhr dabei ihre Größe behalten
    Und braucht die Seite keinen Scrollbalken
    Wenn ich beim Umschalten auf "Simulation" Seite und Uhr beobachte
    Dann ist die Seite dabei nie höher als das Fenster geworden
    Und hat die Uhr dabei ihre Größe behalten

    Beispiele:
      | breite | hoehe |
      | 1280   | 600   |
      | 1536   | 730   |
      | 1366   | 768   |
      | 1920   | 1080  |

  # Spalte und Uhr schaukelten sich gegenseitig hoch (8 px Rahmen je Bild):
  # die Uhr wuchs nach dem Laden 65 Bilder lang, das Menü zeigte kurz Balken.
  Szenariogrundriss: Uhr steht beim Laden sofort in voller Größe
    Angenommen ich nutze einen Computer mit <breite> mal <hoehe> Pixeln
    Und ich beobachte die Größe der Uhr ab dem Laden der Seite
    Und die Astro-Uhr ist geöffnet
    Dann hatte die Uhr vom ersten Bild an ihre endgültige Größe
    Und ist die Uhr quadratisch
    Und braucht die Seite keinen Scrollbalken

    Beispiele:
      | breite | hoehe |
      | 1366   | 768   |
      | 1920   | 1080  |
      | 2560   | 1300  |

  # Erschien im Menü ein senkrechter Balken, stand das fest 250 px breite
  # Menü um dessen Breite über – ein unnötiger waagerechter Balken folgte.
  Szenario: Menü ohne waagerechten Scrollbalken
    Angenommen ich nutze einen Computer mit 1280 mal 600 Pixeln
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann kann das Menü nicht waagerecht scrollen
