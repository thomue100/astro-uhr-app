# language: de
Funktionalität: Kalenderangaben zum eingestellten Datum
  Als Besucherin oder Besucher der Astronomischen Uhr
  möchte ich zu jedem Datum Wochentag, Tagesheilige und Osterdatum sehen,
  damit ich die Kalenderscheibe der Uhr nachvollziehen kann.

  Die Scheibe hat immer eine Zeile für den 29. Februar. Deshalb haben
  Gemeinjahre zwei Sonntagsbuchstaben (vor und ab März), Schaltjahre einen.

  Grundlage:
    Angenommen die Astro-Uhr ist geöffnet

  Szenario: Kalenderangaben für einen historischen Tag
    Wenn ich das Datum "22.05.1965 12:00" einstelle
    Und ich den Kalender öffne
    Dann zeigt der Kalender "Sa, 22.05.1965"
    Und zeigt der Kalender den Wochentag "Samstag"
    Und zeigt der Kalender "HELENA"

  # Erwartungswerte unabhängig berechnet: Ostern nach Gauß, Goldene Zahl =
  # Jahr mod 19 + 1, Sonntagsbuchstaben aus dem ersten Sonntag im Januar/März.
  # 1911 und 2080 sind das erste und letzte Jahr der Scheibe;
  # 2024: Ostern im März (Umlaut!), Schaltjahr.
  Szenariogrundriss: Jahresangaben
    Wenn ich das Datum "01.06.<jahr>" einstelle
    Und ich den Kalender öffne
    Dann zeigt der Kalender diese Angaben:
      | Osterdatum        | <ostern>            |
      | Goldene Zahl      | <goldene_zahl>      |
      | Sonntagsbuchstabe | <sonntagsbuchstabe> |

    Beispiele:
      | jahr | ostern    | goldene_zahl | sonntagsbuchstabe |
      | 1911 | 16. April | 12           | A,B               |
      | 1965 | 18. April | 9            | C,D               |
      | 2000 | 23. April | 6            | B                 |
      | 2024 | 31. März  | 11           | G                 |
      | 2026 | 5. April  | 13           | D,E               |
      | 2079 | 23. April | 9            | A,B               |
      | 2080 | 7. April  | 10           | G                 |

  # Tagesbuchstaben laufen A–G über alle 366 Zeilen der Scheibe
  Szenariogrundriss: Tagesbuchstabe und Tagesheilige
    Wenn ich das Datum "<datum>" einstelle
    Und ich den Kalender öffne
    Dann zeigt der Kalender diese Angaben:
      | Tagesbuchstabe  | <buchstabe> |
      | Tagesheilige(r) | <heilige>   |

    Beispiele:
      | datum      | buchstabe | heilige   |
      | 01.01.2026 | A         | NEUJAHR   |
      | 29.02.2024 | D         | GABRIEL   |
      | 01.03.2026 | E         | ALBINUS   |
      | 22.05.1965 | C         | HELENA    |
      | 24.12.2026 | B         | ADAM-EVA  |
      | 31.12.2026 | B         | SYLVESTER |

  Szenario: Sichtbare Finsternisse des Jahres
    Wenn ich das Datum "01.06.2026" einstelle
    Und ich den Kalender öffne
    Dann listet der Kalender diese Finsternisse:
      | Art                        | Zeitpunkt    |
      | Partielle Sonnenfinsternis | 12.08. 20:06 |
      | Partielle Mondfinsternis   | 28.08. 06:09 |

  Szenario: Erste Finsternis der Scheibe (Jahr 2000)
    Wenn ich das Datum "01.06.2000" einstelle
    Und ich den Kalender öffne
    Dann listet der Kalender diese Finsternisse:
      | Art                   | Zeitpunkt    |
      | Totale Mondfinsternis | 21.01. 05:45 |

  # Der Rechengang braucht für jeden Monat den passenden Eintrag der Tagesdaten
  Szenariogrundriss: Erläuterung leitet den Wochentag her
    Wenn ich das Datum "<datum>" einstelle
    Und ich den Kalender öffne
    Und ich die Erläuterungen zum Kalender öffne
    Dann ergibt der Rechengang den Wochentag "<wochentag>"

    Beispiele:
      | datum      | wochentag  |
      | 22.05.1965 | Samstag    |
      | 15.01.2026 | Donnerstag |
      | 15.03.2026 | Sonntag    |
      | 15.06.2026 | Montag     |
      | 15.09.2026 | Dienstag   |
      | 29.02.2024 | Donnerstag |
      | 25.12.2026 | Freitag    |
