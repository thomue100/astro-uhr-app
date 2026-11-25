# App-Karte der Astro-Uhr (für Schritte und Erwartungswerte)

Stand: November 2026. Vor dem Verwenden eines Selektors kurz im Template gegenprüfen. Ändert sich das Markup, `features/support/astro-uhr.ts` anpassen und diese Datei nachziehen.

## Inhalt
1. Seitenaufbau und Selektoren
2. Texte (i18n)
3. Was auf dem Canvas liegt
4. Fachwissen für Erwartungswerte
5. Bekannte Stolperstellen

## 1. Seitenaufbau und Selektoren

| Bereich | Selektor | Hinweis |
|---|---|---|
| Uhr (alles Gezeichnete) | `#canvas` in `app-canvas` | kein DOM-Inhalt, siehe Abschnitt 3 |
| Seitenleiste | `#controls` (`app-controls`) | |
| Sprachumschalter | `.lang-btn` | Beschriftung zeigt die *andere* Sprache („EN“ wenn Deutsch aktiv) |
| Einführung (Modal) | `#infoButtonHeader` | öffnet `app-modal` mit `app-info-modal-content` |
| Simulation | `#simulationPanel > .controls-header` | beim Start bereits offen |
| Datum/Uhrzeit-Feld | `#dateTimeInput` (Label „Datum und Uhrzeit:“) | `datetime-local`, Wert `JJJJ-MM-TTTHH:MM`, erlaubt 1911–2080 |
| Live-Anzeige Datum | `#liveDateTime` | Format `TT.MM.JJJJ HH:mm:ss` |
| Geschwindigkeit | `#speedSlider` | 0.1–5 |
| Start/Stop, Reset | Buttons in `app-simulation-panel .btn-row` | „▶️ Start“/„⏸️ Stop“, „Reset“ (= jetzt) |
| Kalender | `#calendarPanel > .controls-header` | öffnet Panel **und** schaltet Canvas auf die Kalenderscheibe um |
| Kalender-Infos | `app-calendar-panel` | Text z. B. `📅 Sa, 22.05.1965📆 18. April🔢9🔠C,D🔤C🙏 HELENA🌑 1965…`; Langformen stehen nur im `title`-Attribut |
| Kalenderscheibe: Reset | `.cc-reset-corner` | nur sichtbar, wenn Kalender offen |
| Kalenderscheibe: Zoom/Modus | `.calendar-controls-bar .cc-btn` | nur Tablet/Desktop |
| 3D-Modell | `#model3dPanel > .controls-header` | ersetzt Menü durch `app-model3d-panel`, Canvas wird ausgeblendet, three.js lädt verzögert |
| 3D: zurück | `.controls-header.m3d-back` oder Escape | |
| 3D: Uhr stellen | `#m3d-when` | |
| Kunst & Geschichte | `#historyPanel > .controls-header` | Modal `app-history-modal-content` |
| Modal allgemein | `.modal-overlay`, `.modal-close`, `.modal-title` | Escape schließt |

## 2. Texte (i18n)

Alle sichtbaren Texte stehen in `public/i18n/de.json` und `en.json`. Erwartungswerte von dort übernehmen statt raten. Häufig gebraucht:

| Schlüssel | Deutsch | Englisch |
|---|---|---|
| `nav.intro` | ℹ️ Einführung | ℹ️ Introduction |
| `nav.simulation` | Simulation | Simulation |
| `nav.calendar` | Kalender | Calendar |
| `nav.history` | ℹ️ Kunst & Geschichte | ℹ️ Art & History |
| `nav.model3d` | ⚙️ 3D-Funktionsmodell | ⚙️ 3D working model |
| `simulation.date_label` | Datum und Uhrzeit: | |
| `calendar.easter` | Osterdatum | Easter date |
| `weekdays_short.*` | So Mo Di Mi Do Fr Sa | |

Tagesheilige erscheinen in GROSSBUCHSTABEN (wie auf der Scheibe), z. B. `HELENA`.

## 3. Was auf dem Canvas liegt

Normale Ansicht: 24-Stunden-Ziffernring, Tierkreis-Ring (13 Sternbilder inkl. Schlangenträger), Sonnenzeiger mit Sonne, Mond mit Phase und Mondzeiger, Heiland in der Mitte.
Kalenderansicht (nach Klick auf „Kalender“): Foto der Kalenderscheibe, die sich einmal im Jahr dreht, und ein **feststehender** goldener Stern-Zeiger links (9-Uhr-Position).

Vorhandene Ausschnitte im Seitenobjekt:
- `zeigerAusschnitt()` – Datumszeiger der Kalenderscheibe mit den Tageszeilen daneben
- `sonnenAusschnitt()` – oberer Bereich um den Sonnenzeiger (um 12:00 Uhr steht er oben, mit Sternbild darunter)
- `untererAusschnitt()` – unterer Bereich; dort steht mittags der Vollmond

Fachliche Auswertungen im Seitenobjekt (rechnen die Zeichenwinkel in Begriffe der Uhr um; Erwartungswerte immer aus der Astronomie nehmen, nie aus dem App-Code):
- `stundeDesSonnenzeigers()` – Uhrzeit auf dem 24-Stunden-Ring (Dezimalstunden)
- `sternbildDerSonne()` – Sternbild nach IAU-Ausdehnung auf der Ekliptik („Stier“, „Schlangenträger“ …)
- `mondalter()` – Tage seit Neumond (0 … 29,53)
- `mondSonneAbstand()` – Winkel Mond- zu Sonnenzeiger in Grad (±180 = gegenüber)

Alle Datumsangaben in Szenarien sind **Lübecker Ortszeit** (`parseDatum` rechnet unabhängig von der Zeitzone des Testrechners). Ein Gerät in fremder Zeitzone simuliert `Angenommen mein Gerät ist auf die Zeitzone "…" eingestellt` (vor „heute ist der“ und vor dem Öffnen).

Zustand über `uhr.zustand()`: `angleSun`, `angleMoon`, `angleZodiac`, `angleCalendarDisk` (Radiant), `mondAlter`, `mondAlterFractional`, `showCalendarDisk`, `calendarZoom`, `calendarOffsetX/Y`.

## 4. Fachwissen für Erwartungswerte

- **Kalenderscheibe:** Der Zeiger zeigt auf die Zeile des heutigen Tages (Nummer + Tagesheilige). Grenzfälle, die schon einmal falsch waren: Tage der Zeitumstellung (letzter Sonntag im März/Oktober) und Jahreswechsel.
- **Tierkreis:** Die Sonne steht im astronomischen Sternbild (IAU-Grenzen, nicht Horoskop): Steinbock 20.01.–16.02., Wassermann –11.03., Fische –18.04., Widder –14.05., Stier –21.06., Zwillinge –20.07., Krebs –10.08., Löwe –16.09., Jungfrau –30.10., Waage –23.11., Skorpion –29.11., Schlangenträger –17.12., Schütze –20.01. (±1 Tag je nach Jahr). Am 2. Juni steht die Sonne mitten im Stier (Referenz der App).
- **Mond:** Bei Vollmond steht der Mond der Sonne gegenüber. Referenz-Vollmond der App: 05.11.2025 13:19 UTC; synodischer Monat ≈ 29,53 Tage. Die App rechnet (wie das Räderwerk) mit dem *mittleren* Mondlauf; wahre Voll-/Neumonde 2026 weichen davon um bis zu ±15 h ab → Toleranz ±1 Tag. Bereits verwendete Termine stehen in `features/mond.feature`.
- **Uhrzeit:** Sonnenzeiger um 12:00 MEZ/MESZ oben; die App rechnet die Uhrzeit fest in Europe/Berlin (Standort Lübeck).
- **Osterdaten** (zum Prüfen): 2000 → 23. April, 2025 → 20. April, 2026 → 5. April, 2027 → 28. März.

## 5. Bekannte Stolperstellen

- **Canvas wächst nach dem Öffnen des Kalenders** ~600 ms (CSS-Übergang); der Übergang setzt manchmal erst verzögert ein. Ausschnitte immer über das Seitenobjekt holen, das auf eine über ~1 s stabile Größe wartet.
- **Bilder laden asynchron**; `uhr.oeffnen()` wartet, bis alle `<img>` fertig sind und der Canvas eine Größe hat.
- **„Heute“ muss vor dem Laden feststehen** (`setzeHeute` vor `oeffnen`). Danach das Datum nur noch über das Datumsfeld ändern.
- **`window.ng` gibt es nur im Dev-Build** (`ng serve`). Die Playwright-Config startet genau den; gegen einen Produktions-Build funktioniert `uhr.zustand()` nicht.
- **Firefox/WebKit-Projekte** in `playwright.config.ts` gehören zu den alten Tests in `tests/`; deren Browser sind nicht installiert. Gherkin-Szenarien immer mit `--project=bdd` (macht `npm run test:bdd` automatisch).
