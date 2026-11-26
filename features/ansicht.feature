# language: de
Funktionalität: Umschalter für die Ansicht im Rahmen
  Über dem Rahmen steht sichtbar, was er gerade zeigt – Uhr, Kalenderscheibe
  oder 3D-Modell – und man kann direkt wechseln. Vorher tauschte das
  Aufklappen des Kalenders unbemerkt die ganze Uhr aus.

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet

  Szenario: Beim Start ist die Uhr gewählt
    Dann steht der Umschalter über dem Rahmen
    Und ist im Umschalter "Uhr" gewählt
    Und zeigt der Rahmen das Zifferblatt

  Szenario: Kalenderscheibe über den Umschalter
    Wenn ich im Umschalter "Kalenderscheibe" wähle
    Dann ist im Umschalter "Kalenderscheibe" gewählt
    Und zeigt der Rahmen die Kalenderscheibe
    Und ist das Kalender-Panel aufgeklappt
    Wenn ich im Umschalter "Uhr" wähle
    Dann zeigt der Rahmen das Zifferblatt
    Und ist das Simulationsfeld zu sehen

  Szenario: Umschalter folgt dem Menü
    Wenn ich den Kalender öffne
    Dann ist im Umschalter "Kalenderscheibe" gewählt

  Szenario: 3D-Modell über den Umschalter und zurück
    Wenn ich im Umschalter "3D-Modell" wähle
    Dann zeigt der Rahmen das 3D-Modell
    Und ist im Umschalter "3D-Modell" gewählt
    Und ersetzt das Bedienfeld des 3D-Modells das Menü
    Wenn ich im Umschalter "Uhr" wähle
    Dann zeigt der Rahmen wieder die Uhr mit dem Menü
    Und ist im Umschalter "Uhr" gewählt

  # Aus dem 3D-Modell direkt zur Kalenderscheibe, ohne Umweg über „Zurück“
  Szenario: Vom 3D-Modell direkt zur Kalenderscheibe
    Wenn ich im Umschalter "3D-Modell" wähle
    Und ich im Umschalter "Kalenderscheibe" wähle
    Dann zeigt der Rahmen die Kalenderscheibe
    Und ist das Kalender-Panel aufgeklappt

  # UX-Review 9: Gold für Bedienbares und Überschriften, Text hell-neutral
  Szenario: Farbhierarchie im Menü
    Dann sind im Menü nur Bedienbares und Überschriften gold
    Wenn ich den Kalender öffne
    Dann sind im Menü nur Bedienbares und Überschriften gold
