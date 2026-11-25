---
name: gherkin-tests
description: Schreibt, erweitert und repariert Gherkin/Cucumber-Akzeptanztests (deutsche .feature-Dateien mit playwright-bdd) für die Astro-Uhr-App. Verwende diesen Skill immer, wenn es um Szenarien, Features, Akzeptanztests, BDD, Cucumber, Gherkin, Given/When/Then bzw. Angenommen/Wenn/Dann, End-to-End- oder UI-Tests der App geht – auch wenn nur gesagt wird „teste das“, „schreib einen Test für die Kalenderscheibe/den Tierkreis/die Sprachumschaltung“, „sichere diesen Bugfix mit einem Test ab“ oder wenn ein `npm run test:bdd`-Lauf fehlschlägt. Nicht für Vitest-Unit-Tests einzelner Funktionen (src/**/*.spec.ts).
---

# Gherkin-Tests für die Astro-Uhr

Akzeptanztests beschreiben das Verhalten der Uhr so, wie eine Besucherin es erlebt – auf Deutsch, in der Fachsprache der Uhr (Kalenderscheibe, Tierkreis, Sonnenzeiger, Mondphase). playwright-bdd übersetzt die `.feature`-Dateien in Playwright-Tests; es gibt also nur *einen* Test-Runner, Report und Trace-Viewer.

## Aufbau im Projekt

```
features/
├── *.feature                 # Szenarien, je Fachbereich eine Datei, # language: de
├── steps/*.steps.ts          # Schritt-Definitionen, je Fachbereich eine Datei
├── support/fixtures.ts       # test + Given/When/Then (immer von hier importieren)
├── support/astro-uhr.ts      # Seitenobjekt AstroUhr – alle Selektoren wohnen hier
└── referenzbilder/*.png      # Referenz-Screenshots für Canvas-Prüfungen (eingecheckt)
playwright.config.ts          # Projekt "bdd": Europe/Berlin, de-DE, 1400×1000, DPR 2
.features-gen/                # generierte Specs – nicht bearbeiten, nicht einchecken
```

Befehle:
- `npm run test:bdd` – generiert und führt alle Szenarien aus (startet `ng serve` auf Port 4200 selbst oder nutzt einen laufenden)
- `npm run test:bdd -- --grep @visuell` – nur getaggte Szenarien
- `npm run test:bdd:steps` – listet alle vorhandenen Schritte (**vor dem Schreiben neuer Schritte aufrufen**)
- `npm run test:bdd:update` – schreibt fehlende/geänderte Referenzbilder neu

Für Details zur App (Bereiche, Selektoren, Texte, Fachwissen zu Kalender und Tierkreis) lies `references/app-karte.md`, sobald du Schritte schreibst oder Erwartungswerte festlegst.

## Vorgehen

### 1. Verhalten verstehen
Kläre, *was* sich für die Nutzerin beobachtbar ändern soll. Lies die betroffene Komponente und die Texte in `public/i18n/de.json`. Bei einem Bugfix: Das Szenario muss mit dem alten Code fehlschlagen und mit dem neuen bestehen – formuliere es entlang des Fehlerbilds (z. B. „Zeiger steht am Tag der Zeitumstellung richtig“).

### 2. Szenario schreiben
- Kopfzeile `# language: de`, dann `Funktionalität:` mit 2–3 Sätzen Nutzen (wer, was, wozu).
- Schlüsselwörter: `Grundlage`, `Szenario`, `Szenariogrundriss` + `Beispiele`, `Angenommen` / `Wenn` / `Dann` / `Und` / `Aber`.
- **Deklarativ statt Klickanleitung:** „Wenn ich den Kalender öffne“ statt „Wenn ich auf das Element #calendarPanel klicke“. Selektoren, IDs und CSS gehören nie in eine `.feature`-Datei – sie würden bei jeder Markup-Änderung die Fachbeschreibung brechen.
- Ein Szenario prüft *ein* Verhalten. Mehrere Daten für dieselbe Regel → `Szenariogrundriss` mit `Beispiele`-Tabelle; Grenzfälle (Jahreswechsel, Schaltjahr, Zeitumstellung 29.03./25.10. o. ä.) gehören als Zeilen hinein und bekommen einen kurzen `#`-Kommentar, warum sie drin sind.
- Datumsangaben immer als `"TT.MM.JJJJ"` oder `"TT.MM.JJJJ HH:MM"` (so parst `parseDatum`).
- Tags: `@visuell` für Screenshot-Vergleiche, `@wip` für Unfertiges (wird nicht ausgeschlossen – vor dem Commit entfernen oder Szenario fertigstellen).
- „Heute“ festlegen (`Angenommen heute ist der …`) muss **vor** `die Astro-Uhr ist geöffnet` stehen, weil die App die Startzeit beim Laden übernimmt. Eine `Grundlage`, die die Uhr öffnet, passt dann nicht – solche Szenarien in eine eigene Datei.

### 3. Schritte wiederverwenden, dann ergänzen
Rufe `npm run test:bdd:steps` auf und formuliere Szenarien möglichst mit vorhandenen Schritten (exakter Wortlaut zählt). Fehlt einer:
- In die passende `features/steps/<bereich>.steps.ts` (neue Datei für neuen Fachbereich), `Given/When/Then` aus `../support/fixtures` importieren.
- Parameter über Cucumber-Ausdrücke (`{string}`, `{int}`), nicht über Regex.
- Der Schritt ruft Methoden von `uhr` (Seitenobjekt) auf; neue Selektoren/Aktionen dort als Methode/Getter ergänzen. So bleibt jede Markup-Änderung an *einer* Stelle.
- Locator-Rangfolge: Rolle/Label (`getByRole`, `getByLabel`) → sichtbarer Text aus i18n → stabile IDs (`#calendarPanel`) → Komponenten-Tag (`app-calendar-panel`). Keine generierten Angular-Attribute (`_ngcontent-…`) und keine tiefen CSS-Ketten.
- Für Erwartungen `expect(...)` mit Auto-Warten (`toContainText`, `toBeVisible`) – kein `waitForTimeout` als Synchronisation, außer das Seitenobjekt kapselt einen begründeten Fall.

### 4. Canvas-Inhalte prüfen
Uhr, Kalenderscheibe, Zeiger und Tierkreis sind auf einem `<canvas>` gezeichnet – dort gibt es kein DOM. Drei Wege, in dieser Reihenfolge:
1. **DOM-Spiegel nutzen:** Vieles steht zusätzlich im Kalender-Panel oder Simulationsfeld (Datum, Wochentag, Heilige, Osterdatum, Finsternisse). Das ist am robustesten.
2. **Screenshot-Ausschnitt** (`@visuell`): `expect(page).toHaveScreenshot('<name>.png', { clip: await uhr.zeigerAusschnitt(), scale: 'device', maxDiffPixelRatio: 0.02 })`. Ausschnitte berechnet das Seitenobjekt relativ zur Canvas-Größe und wartet vorher, bis der Canvas nicht mehr wächst (nach dem Öffnen des Kalenders ~600 ms CSS-Übergang). Neue Ausschnitte genauso anlegen.
3. **Zustand lesen** (`uhr.zustand()` → Winkel, Mondalter aus dem `ClockSimulationService` über `window.ng`): nur im Dev-Server verfügbar und prüft die Rechnung, nicht das Bild. Nur wenn 1 und 2 nicht gehen.

**Neue Referenzbilder sind erst nach Sichtprüfung gültig.** `test:bdd:update` speichert, was gerade gezeichnet wird – auch einen Fehler. Öffne jedes neue/geänderte PNG unter `features/referenzbilder/` (Read-Tool) und bestätige fachlich, was zu sehen ist (z. B. „Zeiger steht auf 25. KATHARINA“). Nenne das Ergebnis dieser Prüfung im Bericht.

### 5. Ausführen und stabil machen
- `npm run test:bdd` (bei Bedarf `-- --grep "<Szenarioname>"`). Der erste Lauf eines neuen Screenshot-Schritts scheitert mit „snapshot doesn't exist, writing actual“ – erwartet; dann Bild prüfen (siehe oben).
- Bei Fehlschlägen zuerst `test-results/**/error-context.md` lesen (enthält Seiten-Snapshot) bzw. `*-actual.png`/`*-diff.png` ansehen.
- Neue oder geänderte Szenarien mindestens **dreimal hintereinander** grün laufen lassen. Flackert etwas, die Ursache beheben (meist fehlendes Warten auf Laden/Größe) – nicht Toleranzen hochdrehen oder Retries einbauen.
- Zeit deterministisch halten: „heute“ über `uhr.setzeHeute` (friert `Date` ein, Timer laufen weiter), Zeitzone kommt aus der Config.
- Bei Bugfix-Tests einmal gegenprüfen, dass der Test den Fehler erkennt (z. B. Referenzbild eines anderen Tages unterschieben oder Fix kurz zurücknehmen) und danach alles wiederherstellen.

### 6. Abschluss
Berichte kurz: neue/geänderte Szenarien (Dateien), neue Schritte, Ergebnis der Sichtprüfung neuer Referenzbilder, Anzahl der grünen Läufe. Committe nur, wenn darum gebeten wird; `.features-gen/`, `test-results/`, `playwright-report/` sind ignoriert, `features/referenzbilder/` gehört ins Repository.

## Beispiel

```gherkin
# language: de
@visuell
Funktionalität: Datumszeiger der Kalenderscheibe
  Der Stern-Zeiger steht still, die Scheibe dreht sich einmal im Jahr darunter.

  Szenariogrundriss: Zeiger steht auf dem heutigen Tag
    Angenommen heute ist der "<datum>"
    Und die Astro-Uhr ist geöffnet
    Wenn ich den Kalender öffne
    Dann zeigt der Zeiger der Kalenderscheibe auf denselben Tag wie im Referenzbild "<bild>"

    # 29.03.: Tag der Zeitumstellung (war früher um einen Tag versetzt)
    Beispiele:
      | datum      | bild         |
      | 25.11.2026 | zeiger-25-11 |
      | 29.03.2026 | zeiger-29-03 |
```
