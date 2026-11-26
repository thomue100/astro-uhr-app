# language: de
Funktionalität: Fenster mit Einführung und Kunst & Geschichte
  Einführung, Kunst & Geschichte und die Kalender-Erläuterungen öffnen sich
  als Fenster über der Uhr. Es gibt mehrere Wege, sie zu schließen; solange
  ein Fenster offen ist, scrollt die Seite dahinter nicht mit.

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet

  Szenariogrundriss: Fenster öffnen
    Wenn ich das Fenster "<menüpunkt>" öffne
    Dann ist das Fenster "<titel>" geöffnet
    Und enthält das Fenster "<inhalt>"
    Und lässt sich die Seite im Hintergrund nicht scrollen

    Beispiele:
      | menüpunkt          | titel                                        | inhalt                              |
      | Einführung         | Die Astronomische Uhr                     | Quellen dieser Einführung           |
      | Kunst & Geschichte | Kunst & Geschichte der Astronomischen Uhr | Die Geschichte der Astronomischen Uhr |

  Szenariogrundriss: Fenster schließen
    Wenn ich das Fenster "Einführung" öffne
    Und <aktion>
    Dann ist kein Fenster geöffnet
    Und lässt sich die Seite im Hintergrund wieder scrollen

    Beispiele:
      | aktion                                  |
      | ich das Fenster mit dem Kreuz schließe  |
      | ich das Fenster mit „Schließen“ schließe |
      | ich die Escape-Taste drücke             |
      | ich neben das Fenster klicke            |

  # Das Kreuz ist ein echter Knopf „Schließen“ (Tastatur, Screenreader)
  Szenario: Fenster mit der Tastatur schließen
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Und ich das Kreuz mit der Tastatur betätige
    Dann ist kein Fenster geöffnet

  # Früher war am Computer der obere Teil (Titel, Kreuz) abgeschnitten:
  # Das Fenster wurde im App-Rahmen statt im Bildschirm zentriert.
  Szenariogrundriss: Fenster passen am Computer auf den Bildschirm
    Wenn ich das Fenster "<fenster>" öffne
    Dann passt das geöffnete Fenster auf den Bildschirm
    Und verdeckt der abgedunkelte Hintergrund den ganzen Bildschirm

    Beispiele:
      | fenster            |
      | Einführung         |
      | Kunst & Geschichte |

  Szenario: Ein Klick in das Fenster lässt es offen
    Wenn ich das Fenster "Einführung" öffne
    Und ich in das Fenster klicke
    Dann ist das Fenster "Die Astronomische Uhr" geöffnet

  Szenario: Kalender-Erläuterungen als Fenster
    Wenn ich das Datum "22.05.1965 12:00" einstelle
    Und ich den Kalender öffne
    Und ich die Erläuterungen zum Kalender öffne
    Dann ist das Fenster "Wochentags-Rechengang für den 22.05.1965" geöffnet
    Wenn ich die Escape-Taste drücke
    Dann ist kein Fenster geöffnet

  Szenario: Fenster auf Englisch
    Wenn ich die Sprache umschalte
    Und ich das Fenster "Kunst & Geschichte" öffne
    Dann ist das Fenster "Art & History of the Astronomical Clock" geöffnet
    Und enthält das Fenster "The Modern Clockwork"

  Szenario: Bilder in Kunst & Geschichte
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Dann zeigt das Fenster 5 Bilder, jedes mit Titel, Alternativtext und dem Bildnachweis "© Müller"
    Und lassen sich alle Bilder laden
