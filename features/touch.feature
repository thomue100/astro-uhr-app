# language: de
Funktionalität: Finger-Gesten auf Smartphone und Tablet
  Auf Touch-Geräten werden Kalenderscheibe und Fotos mit den Fingern bedient:
  ein Finger dreht die Scheibe bzw. verschiebt ein Foto, zwei Finger zoomen,
  drehen und verschieben zugleich. Hebt man einen von zwei Fingern ab, geht
  es mit dem verbleibenden Finger nahtlos weiter.

  # ── Kalenderscheibe ───────────────────────────────────────────────────
  Szenario: Kalenderscheibe mit zwei Fingern verschieben
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe mit zwei Fingern um 40 Pixel nach rechts und 30 Pixel nach unten schiebe
    Dann ist die Kalenderscheibe um 40 Pixel nach rechts und 30 Pixel nach unten verschoben
    Und wird die Kalenderscheibe in Zoomstufe 1.5 angezeigt

  Szenario: Kalenderscheibe mit zwei Fingern drehen
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe mit zwei Fingern um 45 Grad im Uhrzeigersinn drehe
    Dann ist die Kalenderscheibe um 45 Grad im Uhrzeigersinn gedreht
    Und wird die Kalenderscheibe in Zoomstufe 1.5 angezeigt

  Szenario: Nach dem Aufziehen mit einem Finger weiterdrehen
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich die Kalenderscheibe mit zwei Fingern auf das 1.5-fache aufziehe, einen Finger anhebe und mit dem anderen um 30 Grad im Uhrzeigersinn weiterdrehe
    Dann wird die Kalenderscheibe in Zoomstufe 2.25 angezeigt
    Und ist die Kalenderscheibe um 30 Grad im Uhrzeigersinn gedreht

  # Auf dem Tablet sind die Modusknöpfe sichtbar – „Verschieben“ gilt auch für den Finger
  Szenario: Tablet: Kalenderscheibe im Verschiebe-Modus mit einem Finger verschieben
    Angenommen ich nutze ein Tablet
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Und ich in den Verschiebe-Modus wechsle
    Und ich die Kalenderscheibe mit einem Finger um 50 Pixel nach rechts und 20 Pixel nach unten schiebe
    Dann ist die Kalenderscheibe um 50 Pixel nach rechts und 20 Pixel nach unten verschoben

  Szenario: Ohne geöffneten Kalender lassen Gesten die Uhr in Ruhe
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich mit einem Finger über die Uhr wische
    Dann ist die Kalenderscheibe unverändert
    Und zeigt die Uhr wieder das Zifferblatt

  # ── Bildbetrachter ────────────────────────────────────────────────────
  Szenario: Foto mit einem Finger verschieben
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Und ich das Bild "Das moderne Uhrwerk" mit einem Finger um 60 Pixel nach rechts schiebe
    Dann ist das Bild "Das moderne Uhrwerk" um 60 Pixel nach rechts verschoben

  Szenario: Foto mit zwei Fingern verschieben
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Und ich das Bild "Das moderne Uhrwerk" mit zwei Fingern um 50 Pixel nach rechts schiebe
    Dann ist das Bild "Das moderne Uhrwerk" um 50 Pixel nach rechts verschoben
    Und wird das Bild "Das moderne Uhrwerk" 1.0-fach vergrößert angezeigt

  Szenario: Foto aufziehen und mit einem Finger weiterschieben
    Angenommen ich nutze ein Smartphone
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Und ich das Bild "Das moderne Uhrwerk" mit zwei Fingern auf das 1.5-fache aufziehe, einen Finger anhebe und mit dem anderen um 40 Pixel nach rechts schiebe
    Dann wird das Bild "Das moderne Uhrwerk" 1.5-fach vergrößert angezeigt
    Und ist das Bild "Das moderne Uhrwerk" um 40 Pixel nach rechts verschoben

  # Das Foto lädt erst beim Hineinscrollen („lazy“). Früher setzte das Ende
  # des Ladens die Ansicht zurück – eine schon begonnene Geste ging verloren.
  Szenario: Geste bleibt erhalten, wenn das Foto erst danach fertig lädt
    Angenommen ich nutze ein Smartphone
    Und das Bild "uhrwerk.jpg" lädt langsam
    Und die Astro-Uhr ist geöffnet
    Wenn ich das Fenster "Kunst & Geschichte" öffne
    Und ich das Bild "Das moderne Uhrwerk" noch während des Ladens mit zwei Fingern auf das 2.0-fache aufziehe
    Und das Bild "Das moderne Uhrwerk" fertig geladen ist
    Dann wird das Bild "Das moderne Uhrwerk" 2.0-fach vergrößert angezeigt
