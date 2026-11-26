# language: de
Funktionalität: Mobile Ansicht
  Die App ist für Smartphones gebaut („mobile first“): Die Uhr steht oben und
  nutzt die volle Breite, das Menü folgt darunter, alle Bedienelemente sind
  groß genug für den Finger (mindestens 44 Pixel, Apple HIG / WCAG 2.5.5),
  und die Kalenderscheibe wird mit Gesten gedreht und gezoomt.

  Szenario: Am Computer steht das Menü neben der Uhr
    Angenommen die Astro-Uhr ist geöffnet
    Dann steht das Menü links neben der Uhr
    Und lässt sich die Seite nicht seitlich verschieben

  Szenario: Auf dem Smartphone steht die Uhr über dem Menü
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Dann steht die Uhr über dem Menü
    Und nutzt die Uhr mindestens 85 % der Bildschirmbreite
    Und lässt sich die Seite nicht seitlich verschieben

  Szenariogrundriss: Bedienelemente sind groß genug für den Finger
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich <bereich>
    Dann sind alle Knöpfe und Menüpunkte mindestens 44 Pixel hoch
    Und lässt sich die Seite nicht seitlich verschieben

    Beispiele:
      | bereich              |
      | die Sprache umschalte |
      | den Kalender öffne    |
      | das 3D-Modell öffne   |

  Szenario: Fenster passen auf den Bildschirm
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich die Einführung öffne
    Dann passt das geöffnete Fenster auf den Bildschirm

  Szenario: Kalenderscheibe mit einem Finger drehen
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe mit einem Finger um 90 Grad im Uhrzeigersinn drehe
    Dann ist die Kalenderscheibe um 90 Grad im Uhrzeigersinn gedreht

  Szenario: Kalenderscheibe mit zwei Fingern vergrößern
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe mit zwei Fingern auf das 2.0-fache aufziehe
    Dann wird die Kalenderscheibe in Zoomstufe 3.0 angezeigt
    Und ist die Kalenderscheibe um 0 Pixel nach rechts und 0 Pixel nach unten verschoben

  Szenario: Nach Gesten stellt „Zurücksetzen“ den heutigen Tag wieder ein
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich mir die Stellung der Kalenderscheibe merke
    Und ich die Kalenderscheibe mit einem Finger um 120 Grad im Uhrzeigersinn drehe
    Und ich die Kalenderscheibe mit zwei Fingern auf das 2.5-fache aufziehe
    Und ich die Ansicht der Kalenderscheibe zurücksetze
    Dann wird die Kalenderscheibe in Zoomstufe 1.5 angezeigt
    Und steht die Kalenderscheibe wieder wie gemerkt

  Szenario: Im 3D-Modell entfällt auf dem Smartphone der Maus-Hinweis
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Dann zeigt der Rahmen das 3D-Modell
    Und ist der Bedienhinweis des 3D-Modells ausgeblendet

  Szenario: Am Computer zeigt das 3D-Modell den Maus-Hinweis
    Angenommen die Astro-Uhr ist geöffnet
    Wenn ich das 3D-Modell öffne
    Dann ist der Bedienhinweis des 3D-Modells zu sehen
