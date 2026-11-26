# language: de
Funktionalität: Bildbetrachter
  Die Fotos in „Kunst & Geschichte“ lassen sich vergrößern und verschieben,
  um Details der Uhr anzusehen: per Knopf, Mausrad, Ziehen oder auf dem
  Smartphone mit zwei Fingern. „Reset“ zeigt wieder das ganze Bild.

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet
    Und ich das Fenster "Kunst & Geschichte" öffne

  # Schritte zu 0,3; Grenzen 0,2 und 6
  Szenariogrundriss: Vergrößern und verkleinern mit den Knöpfen
    Wenn ich das Bild "Das moderne Uhrwerk" <mehr>-mal vergrößere
    Und ich das Bild "Das moderne Uhrwerk" <weniger>-mal verkleinere
    Dann wird das Bild "Das moderne Uhrwerk" <faktor>-fach vergrößert angezeigt

    Beispiele:
      | mehr | weniger | faktor |
      | 2    | 0       | 1.6    |
      | 0    | 2       | 0.4    |
      | 30   | 0       | 6.0    |
      | 0    | 10      | 0.2    |

  Szenario: Vergrößern mit dem Mausrad
    Wenn ich das Bild "Das moderne Uhrwerk" mit dem Mausrad 4-mal vergrößere
    Dann wird das Bild "Das moderne Uhrwerk" 2.0-fach vergrößert angezeigt

  Szenario: Bild verschieben und zurücksetzen
    Wenn ich das Bild "Das moderne Uhrwerk" 3-mal vergrößere
    Und ich das Bild "Das moderne Uhrwerk" um 60 Pixel nach rechts ziehe
    Dann ist das Bild "Das moderne Uhrwerk" um 60 Pixel nach rechts verschoben
    Wenn ich die Ansicht des Bildes "Das moderne Uhrwerk" zurücksetze
    Dann wird das Bild "Das moderne Uhrwerk" 1.0-fach vergrößert angezeigt
    Und ist das Bild "Das moderne Uhrwerk" nicht verschoben

  # Mehrere kurze Züge: Ein Zug endet, sobald die Maus die Bildfläche verlässt
  Szenario: Das Bild bleibt im Rahmen
    Wenn ich das Bild "Das moderne Uhrwerk" 8-mal um 150 Pixel nach rechts ziehe
    Dann lässt sich das Bild "Das moderne Uhrwerk" nicht aus dem Rahmen schieben

  Szenario: Jedes Bild hat seine eigene Ansicht
    Wenn ich das Bild "Das moderne Uhrwerk" 2-mal vergrößere
    Dann wird das Bild "Das moderne Uhrwerk" 1.6-fach vergrößert angezeigt
    Und wird das Bild "Das Getriebe der Astronomischen Uhr" 1.0-fach vergrößert angezeigt
