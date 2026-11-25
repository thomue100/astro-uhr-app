# language: de
Funktionalität: Kalenderangaben zum eingestellten Datum
  Als Besucherin oder Besucher der Astronomischen Uhr
  möchte ich zu jedem Datum Wochentag, Tagesheilige und Osterdatum sehen,
  damit ich die Kalenderscheibe der Uhr nachvollziehen kann.

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet

  Szenario: Kalenderangaben für einen historischen Tag
    Wenn ich das Datum "22.05.1965 12:00" einstelle
    Und ich den Kalender öffne
    Dann zeigt der Kalender "Sa, 22.05.1965"
    Und zeigt der Kalender "HELENA"

  Szenariogrundriss: Osterdatum des eingestellten Jahres
    Wenn ich das Datum "<datum>" einstelle
    Und ich den Kalender öffne
    Dann zeigt der Kalender "<ostern>"

    Beispiele:
      | datum      | ostern     |
      | 01.06.2026 | 5. April   |
      | 01.06.2000 | 23. April  |
