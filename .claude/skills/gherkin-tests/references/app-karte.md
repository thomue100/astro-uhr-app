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
| Ansicht-Umschalter | Gruppe „Ansicht im Rahmen“ über dem Rahmen (`uhr.ansichtUmschalter`, `uhr.ansichtKnopf(name)`) | Knöpfe „Uhr“, „Kalenderscheibe“, „3D-Modell“ mit `aria-pressed`; Zustand in `AnsichtService` – Kalenderscheibe = Kalender-Panel offen, Menü und Umschalter zeigen immer dasselbe |
| Farben | – | Gold (#ffcc33) nur für Bedienbares und Überschriften; Beschriftungen #c9d6e3, Text #e8eef5. Prüfen mit „sind im Menü nur Bedienbares und Überschriften gold“ (`uhr.goldeneTexte`) |
| Titelzeile | `header.app-kopf` (`uhr.kopf`) | eigener Bereich vor Uhr und Menü (Smartphone: ganz oben; Computer: links über dem Menü) |
| Sprachumschalter | `.lang-btn` (in der Titelzeile, nicht in `#controls`) | Beschriftung zeigt die *andere* Sprache („EN“ wenn Deutsch aktiv) |
| Einführung (Modal) | `#infoButtonHeader` | öffnet `app-modal` mit `app-info-modal-content` |
| Simulation | `#simulationPanel > .controls-header` | beim Start bereits offen |
| Datum/Uhrzeit-Feld | `#dateTimeInput` (Label „Datum und Uhrzeit:“) | `datetime-local`, Wert `JJJJ-MM-TTTHH:MM`, erlaubt 1911–2080 |
| Live-Anzeige Datum | `#liveDateTime` | Format `TT.MM.JJJJ HH:mm:ss` |
| Geschwindigkeit | `#speedSlider` | 0.1–5 |
| Start/Stop, Reset | Buttons in `app-simulation-panel .btn-row` | „▶️ Start“/„⏸️ Stop“, „Reset“ (= jetzt) |
| Kalender | `#calendarPanel > .controls-header` | öffnet Panel **und** schaltet Canvas auf die Kalenderscheibe um |
| Kalender-Infos | `app-calendar-panel` | Datum mit ausgeschriebenem Wochentag (`.cal-date`), darunter Liste `dl.cal-werte` mit sichtbaren Bezeichnungen (`dt`: Osterdatum, Goldene Zahl, Sonntagsbuchstabe, Tagesbuchstabe, Tagesheilige(r)) und Werten (`dd`); Finsternisse als `li.cal-eclipse-compact` mit `.cal-finsternis-art` und `.cal-finsternis-zeit`. Werte über `uhr.kalenderAngabe(bezeichnung)` |
| Kalenderscheibe: Reset | `.cc-reset-corner` | nur sichtbar, wenn Kalender offen |
| Kalenderscheibe: Zoom/Modus | `.calendar-controls-bar .cc-btn` | nur Tablet/Desktop |
| 3D-Modell | Umschalter-Knopf „3D-Modell“ (`uhr.oeffne3dModell()`; kein Menüpunkt mehr) | ersetzt Menü durch `app-model3d-panel`, Canvas wird ausgeblendet, three.js lädt verzögert |
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

- **Ausgeblendete Knöpfe sind für Playwright „sichtbar“:** Die Steuerung der Kalenderscheibe wird per `opacity: 0` + `pointer-events: none` versteckt. `toBeVisible()` meldet sie trotzdem als sichtbar → `uhr.istBedienbar(locator)` verwenden.
- **Kalender-Panel-Angaben** über ihre Tooltips ansprechen: `uhr.kalenderAngabe('Osterdatum' | 'Goldene Zahl' | 'Sonntagsbuchstabe' | 'Tagesbuchstabe' | 'Tagesheilige(r)')`; im Gherkin per Datentabelle „Dann zeigt der Kalender diese Angaben:“.
- **Kalenderdaten** (`public/data/*.json`) folgen der Scheibe: immer eine Zeile für den 29. Februar → Gemeinjahre zwei Sonntagsbuchstaben („C,D“), Schaltjahre einen („G“). Finsternisse nur 2000–2036 (wie auf der Scheibe „ab 21.1.2000“). Erwartungswerte unabhängig berechnen (Ostern nach Gauß, Goldene Zahl = Jahr mod 19 + 1), nicht aus den JSON-Dateien abschreiben – so wurden 2026 ein Kodierungsfehler („M�rz“) und vertauschte Osterdaten 2079/2080 gefunden.
- **Zeitraffer** läuft über `requestAnimationFrame`; im Headless-Browser vergehen bei Geschwindigkeit 0,5 nur ~10 simulierte Minuten pro Sekunde. Fortschritt mit `expect.poll` und niedriger Schwelle prüfen.
- **Vorher-nachher-Vergleiche** über die Fixture `ablage` (Map pro Szenario).
- **Störungen nachstellen:** `uhr.sperreBilderDerUhr()`, `uhr.sperreKalenderdaten()` (beide per `page.route`), `uhr.ohneWebGL()` (per Init-Skript) – jeweils vor dem Öffnen. Die Ersatzgrafiken ohne Bilder sind exakt reproduzierbar → Bildvergleich mit kleiner Toleranz (`maxDiffPixelRatio: 0.001`); bei 2 % fiele z. B. eine fehlende Ersatz-Sonne (~0,4 % der Fläche) nicht auf. Allgemein: Toleranz an die Größe des kleinsten Details anpassen, das der Test sichern soll.
- **Zugeklappte Menü-Panels** (max-height/opacity, 0,4 s Übergang) gelten für Playwright als sichtbar → Panelhöhe prüfen (siehe „ist das Simulationsfeld zugeklappt“). Sie sind außerdem `inert` (nicht fokussierbar, nicht bedienbar) – ebenso die Bedienelemente der Kalenderscheibe bei geschlossenem Kalender. Felder darin lassen sich daher nicht befüllen, ohne das Panel zu öffnen.
- **Tastatur:** `uhr.tabReihenfolge(n)` drückt n-mal Tab und meldet je Element, ob es sichtbar ist (Schritte in `tastatur.steps.ts`). Neue ein-/ausblendbare Bereiche immer mit „erreicht die Tab-Taste nur sichtbare Bedienelemente“ absichern.
- **Menüpunkte sind `<button class="controls-header">`** (vorher `<div>`): per Rolle ansprechbar (`uhr.menue.getByRole('button', { name: … })`); Simulation/Kalender tragen `aria-expanded`, Fenster-Öffner `aria-haspopup="dialog"`. Die alten Selektoren `#…Panel > .controls-header` funktionieren weiter.
- **Fenster sind Dialoge** (`getByRole('dialog', { name: Titel })`): Beim Öffnen liegt der Fokus auf „Schließen“, Tab bleibt im Fenster, beim Schließen kehrt der Fokus zum Auslöser zurück. Fokus-Prüfungen: `<body>` als „kein Element fokussiert“ werten – sein Text enthält sonst jedes Wort der Seite.
- **Schriftgrößen:** Fließtext, Beschriftungen und Knöpfe ≥ 14 px, Menüpunkte 15 px, Nebensächliches (Untertitel, Zeitzone, Quellen, Hinweise) 13 px; Eingabefelder auf dem Smartphone 16 px (sonst zoomt iOS). Absichern mit „ist keine Schrift in Titelzeile und Menü/im Fenster kleiner als 13 Pixel“ (`uhr.zuKleineTexte`).
- **Barrierefreiheit:** „Dann findet die automatische Barrierefreiheitsprüfung keine Verstöße“ (axe-core 4.14.0, WCAG 2.0–2.2 A/AA + best practice) nach jeder neuen Ansicht ergänzen (`barrierefreiheit.feature`). axe prüft keine Textalternativen für Canvas/WebGL und keine Sprachwechsel – dafür eigene Schritte. Die Uhr ist `role="img"` mit dynamischer Beschreibung (`getByRole('img', { name: … })`); `<html lang>` folgt der gewählten Sprache. Hauptüberschrift ist `<h1 class="app-title">`, der Seiteninhalt liegt in `<main class="container">`.
- **Shell-Fallen bei Gegenproben (Git-Bash):** Argumente wie `</main>` werden als Pfad umgeschrieben, Backslashes in `node -e` verändert – Eingriffe als Skript-Datei schreiben und von dort ausführen.
- **Gegenproben nie mit `git checkout`/`git stash` auf Dateien mit offenen Änderungen** – vorher sichern (cp + md5sum) und aus der Sicherung wiederherstellen.
- **3D-Kamera:** Nach dem Öffnen fliegt die Kamera ~5 s an → vor Vergleichen `uhr.warteBisKameraRuhig()`. Für Kameraprüfungen `uhr.feststehendeBeschriftungen()` verwenden (ohne Sonne/Mond, die sich mit dem Modell bewegen und sonst Kamerabewegung vortäuschen). Verschieben vs. Drehen: Verschieben lässt alle Beschriftungen sichtbar und rein waagerecht wandern (perspektivisch unterschiedlich weit, ~1,2:1).
- **Gegenproben mit eingebauten Fehlern:** Muster mit `\r?\n` schreiben (Windows-Zeilenenden); Eingriffe dürfen nicht ungenutzte Variablen hinterlassen (Compiler-Fehler → Dev-Server legt ein Fehler-Overlay über die Seite, Klicks laufen in Zeitüberschreitung). Nach jedem Eingriff mehrere Sekunden auf den Neubau warten.
- **Fenster (Modals):** `uhr.oeffneFenster('Einführung' | 'Kunst & Geschichte')` wartet das Einblenden ab (CSS `slideIn`, 0,3 s) – Positionen erst danach messen. Das Kreuz ist ein Knopf „Schließen“ im Kopf (`uhr.fensterKreuz`), der Footer hat einen zweiten „Schließen“-Knopf. Am Computer ist die Scrollleiste immer eingeblendet (`overflow-y: scroll`): bildschirmfüllende Elemente sind ~15 px schmaler als der Viewport.
- **Kein `backdrop-filter`/`transform`/`filter` an Vorfahren von Fenstern:** Das macht sie zum Bezugsrahmen für `position: fixed` – Fenster wurden so im App-Rahmen statt im Bildschirm zentriert und waren oben abgeschnitten (behoben, Szenario „Fenster passen am Computer auf den Bildschirm“).
- **Bildbetrachter:** Zoom/Verschiebung stehen im `style.transform` des `<img>` (`uhr.bildAnsicht(titel)`). Ein Maus-Zug endet bei `mouseleave` der Bildfläche → große Verschiebungen als mehrere kurze Züge. Bilder laden „lazy“ → vor Prüfungen ins Sichtfeld scrollen (`uhr.nichtGeladeneBilder()`). Nicht ladbare Bilder per `page.route(... abort)` simulieren.
- **Ein Browser zur Zeit:** Die npm-Scripts laufen mit `--workers=1`. Mit mehreren parallelen Browsern (v. a. 3D-Modell) ging dem Rechner (8 GB) der Speicher aus, und reihenweise Szenarien scheiterten. Kaum langsamer, aber stabil.
- **3D-Modell (WebGL):** läuft headless per Software-Rendering – langsam (wenige Bilder/s), daher Projekt-Timeout 60 s. Prüfbar über DOM: Bedienfeld `app-model3d-panel` (Umschalter mit `aria-pressed`, Feld „Uhr stellen (MEZ)“ `#m3d-when`), Beschriftungen `app-model3d-stage .tag` (ausgeblendet per `style.display='none'`, erst beim nächsten gerenderten Bild → `expect.poll` mit großzügigem Timeout). Zeitraffer rückt je Bild höchstens 0,1 s vor → keine strengen Zeitvorgaben. Reduzierte Bewegung (`Angenommen mein Gerät bevorzugt reduzierte Bewegung`) startet in Echtzeit – gut für exakte Zeitvergleiche.
- **Uhrzeit = Lübecker Ortszeit (Sommer MESZ):** Die echte Uhr wird zur Sommerzeit umgestellt. 2D-Uhr und 3D-Modell rechnen beide in Europe/Berlin; das Feld „Uhr stellen (Lübecker Zeit)“ im 3D-Modell ebenso. (Bis November 2026 rechnete das 3D-Modell ganzjährig MEZ – Sommer-Szenarien in `modell3d.feature` sichern das ab; der Abgleich der Zeigerstellung 2D↔3D steckt im Unit-Test `clock-math.spec.ts`.)
- **Smartphone/Tablet:** `Angenommen ich nutze ein Smartphone` (390×844) bzw. `… ein Tablet` (768×1024, Modusknöpfe der Kalenderscheibe sichtbar) öffnet eine neue Sitzung mit Touch; die Abdeckungsmessung läuft dort mit. Gesten über `uhr.beruehre(bilder)` (Canvas) bzw. `uhr.beruehreElement(locator, bilder)`: `bilder` = Folge von Momentaufnahmen aller aufliegenden Finger; mehr Finger → touchstart, gleich viele → touchmove, weniger → touchend (so lässt sich „einen von zwei Fingern anheben“ nachstellen). Fertige Gesten-Schritte in `features/steps/touch.steps.ts`. Mindestgröße für Bedienelemente 44 px (`zuKleineBedienelemente`). Kleine Canvas-Ausschnitte sind auf dem Smartphone nicht ablesbar → dort Zustand statt Referenzbild vergleichen.
- **Canvas wächst nach dem Öffnen des Kalenders** ~600 ms (CSS-Übergang); der Übergang setzt manchmal erst verzögert ein. Ausschnitte immer über das Seitenobjekt holen, das auf eine über ~1 s stabile Größe wartet.
- **Bilder laden asynchron**; `uhr.oeffnen()` wartet, bis alle `<img>` fertig sind und der Canvas eine Größe hat.
- **„Heute“ muss vor dem Laden feststehen** (`setzeHeute` vor `oeffnen`). Danach das Datum nur noch über das Datumsfeld ändern.
- **`window.ng` gibt es nur im Dev-Build** (`ng serve`). Die Playwright-Config startet genau den; gegen einen Produktions-Build funktioniert `uhr.zustand()` nicht.
- **Firefox/WebKit-Projekte** in `playwright.config.ts` gehören zu den alten Tests in `tests/`; deren Browser sind nicht installiert. Gherkin-Szenarien immer mit `--project=bdd` (macht `npm run test:bdd` automatisch).
