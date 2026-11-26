# language: de
Funktionalität: Fenster und Bildbetrachter auf dem Smartphone
  Auch in den Fenstern sind alle Bedienelemente groß genug für den Finger
  (mindestens 44 Pixel, wie im übrigen Menü); Fotos werden mit zwei Fingern
  vergrößert. Fehlt ein Bild, sagt der Bildbetrachter das deutlich.

  Szenariogrundriss: Bedienelemente in den Fenstern sind groß genug
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "<fenster>" öffne
    Dann sind alle Bedienelemente im Fenster mindestens 44 Pixel hoch
    Und passt das geöffnete Fenster auf den Bildschirm

    Beispiele:
      | fenster            |
      | Einführung         |
      | Kunst & Geschichte |

  Szenario: Bild mit zwei Fingern vergrößern
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Und ich das Bild "Das moderne Uhrwerk" mit zwei Fingern auf das 2.0-fache aufziehe
    Dann wird das Bild "Das moderne Uhrwerk" 2.0-fach vergrößert angezeigt
    Und ist der Bedienhinweis des Bildbetrachters ausgeblendet

  Szenario: Nicht erreichbares Bild wird gemeldet
    Angenommen das Bild "uhrwerk.jpg" ist nicht erreichbar
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Dann meldet der Bildbetrachter "Bild konnte nicht geladen werden." für "Das moderne Uhrwerk"
