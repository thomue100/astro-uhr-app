# language: de
Funktionalität: Die App bleibt bei Störungen benutzbar
  Fehlen Bilder (schlechtes Netz, Inhaltsblocker), Kalenderdaten oder WebGL,
  soll die App nicht leer oder kaputt aussehen, sondern mit Ersatzgrafiken
  weiterlaufen und verständlich sagen, was fehlt.

  @visuell
  Szenario: Ohne Bilder zeichnet die Uhr Ersatzgrafiken
    Angenommen die Bilder der Uhr sind nicht erreichbar
    Und heute ist der "25.11.2026 12:00"
    Und die Astro-Uhr ist geöffnet
    Dann zeigt der Sonnenzeiger auf "12:00" Uhr
    Und steht die Sonne im Sternbild "Skorpion"
    Und sieht die ganze Uhr aus wie im Referenzbild "uhr-ohne-bilder"

  @visuell
  Szenario: Ohne Bild meldet die Kalenderscheibe, dass sie fehlt
    Angenommen die Bilder der Uhr sind nicht erreichbar
    Und heute ist der "25.11.2026 12:00"
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann sieht die ganze Uhr aus wie im Referenzbild "kalenderscheibe-ohne-bild"

  Szenario: Ohne Kalenderdaten meldet der Kalender das verständlich
    Angenommen die Kalenderdaten sind nicht erreichbar
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann meldet der Kalender "Jahresdaten nicht vorhanden."
    Wenn ich die Erläuterungen zum Kalender öffne
    Dann meldet das Fenster "Jahresdaten nicht vorhanden."

  Szenario: Ohne Kalenderdaten läuft die Uhr weiter
    Angenommen die Kalenderdaten sind nicht erreichbar
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Datum "15.07.2026 12:00" einstelle
    Dann zeigt der Sonnenzeiger auf "12:00" Uhr
    Und steht die Sonne im Sternbild "Zwillinge"

  Szenario: Ohne WebGL erklärt das 3D-Modell, was fehlt
    Angenommen mein Browser stellt kein WebGL bereit
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Menü des 3D-Modells öffne
    Dann meldet das 3D-Modell "Das 3D-Modell braucht WebGL."
    Wenn ich zur Uhr zurückkehre
    Dann zeigt der Rahmen wieder die Uhr mit dem Menü
