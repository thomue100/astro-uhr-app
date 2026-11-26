// features/support/astro-uhr.ts
//
// Seitenobjekt für die Astro-Uhr. Schritt-Definitionen sprechen nur hiermit,
// nie direkt mit Selektoren: Ändert sich das Markup, wird nur diese Datei angepasst.
import { expect, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { CoverageReport } from 'monocart-coverage-reports';
import { coverageAktiv, coverageOptionen } from './coverage';

// ── Zeit: Alle Datumsangaben der Szenarien sind Lübecker Ortszeit ─────────
const ZONE = 'Europe/Berlin';

const berlinTeile = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONE, hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
});

/** Wanduhrzeit in Europe/Berlin → Zeitpunkt; unabhängig von der Zeitzone des Testrechners. */
function berlinZeitpunkt(j: number, mo: number, t: number, h: number, mi: number): Date {
  const soll = Date.UTC(j, mo - 1, t, h, mi);
  let ts = soll;
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(berlinTeile.formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
    const ist = Date.UTC(+p['year'], +p['month'] - 1, +p['day'], +p['hour'], +p['minute']);
    ts += soll - ist;
  }
  return new Date(ts);
}

/** "25.11.2026" (= 12:00) oder "25.11.2026 14:30", jeweils Lübecker Ortszeit */
export function parseDatum(text: string): Date {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/.exec(text.trim());
  if (!m) throw new Error(`Datum "${text}" bitte als TT.MM.JJJJ oder TT.MM.JJJJ HH:MM angeben`);
  const [, t, mo, j, h = '12', mi = '00'] = m;
  return berlinZeitpunkt(+j, +mo, +t, +h, +mi);
}

/** Zeitpunkt → "JJJJ-MM-TTTHH:MM" in Lübecker Ortszeit (Format des Datumsfelds) */
function alsFeldwert(d: Date): string {
  const p = Object.fromEntries(berlinTeile.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p['year']}-${p['month']}-${p['day']}T${p['hour']}:${p['minute']}`;
}

// ── Fachliche Konstanten für Auswertungen ──────────────────────────────────
const GRAD = 180 / Math.PI;
const norm360 = (g: number) => ((g % 360) + 360) % 360;
/** Abstand zweier Winkel in Grad, Ergebnis −180 … +180 */
export const winkelAbstand = (a: number, b: number) => ((((a - b) % 360) + 540) % 360) - 180;

/**
 * Ausdehnung der Tierkreis-Sternbilder auf der Ekliptik (IAU-Grenzen, Grad),
 * in Laufrichtung der Sonne ab dem Stier. Der Stier ist auf dem Ring der App
 * um die 12-Uhr-Richtung zentriert (Referenz: 2. Juni, Sonne mitten im Stier).
 */
const STERNBILDER: ReadonlyArray<readonly [string, number]> = [
  ['Stier', 36.7], ['Zwillinge', 27.9], ['Krebs', 20.1], ['Löwe', 35.7],
  ['Jungfrau', 44.1], ['Waage', 23.0], ['Skorpion', 6.7], ['Schlangenträger', 18.6],
  ['Schütze', 33.4], ['Steinbock', 27.9], ['Wassermann', 24.2], ['Fische', 37.2], ['Widder', 24.7],
];

export class AstroUhr {
  private eigenerKontext?: BrowserContext;

  constructor(
    public page: Page,
    private readonly browser: Browser,
    private readonly baseURL: string | undefined,
  ) {}

  // ── Bereiche der Seite ──────────────────────────────────────────────
  get canvas(): Locator { return this.page.locator('#canvas'); }
  get kalenderPanel(): Locator { return this.page.locator('app-calendar-panel'); }
  get datumsfeld(): Locator { return this.page.locator('#dateTimeInput'); }
  get einfuehrung(): Locator { return this.page.locator('#infoButtonHeader'); }
  get sprachButton(): Locator { return this.page.locator('.lang-btn'); }
  private menuepunkt(panelId: string): Locator {
    return this.page.locator(`#${panelId} > .controls-header`);
  }

  // ── Aktionen ────────────────────────────────────────────────────────
  /**
   * Simuliert ein Gerät in einer anderen Zeitzone (Standard ist Europe/Berlin).
   * Öffnet dafür eine neue Browser-Sitzung; muss vor setzeHeute/oeffnen laufen.
   */
  async nutzeZeitzone(zeitzone: string): Promise<void> {
    await this.neueSitzung({ timezoneId: zeitzone });
  }

  /** Smartphone im Hochformat mit Touch-Bildschirm; vor setzeHeute/oeffnen aufrufen. */
  async nutzeSmartphone(): Promise<void> {
    await this.neueSitzung({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  }

  /** Ersetzt die Browser-Sitzung; übernimmt bisherige Sonderwünsche (Zeitzone, Gerät). */
  private sitzungsWunsch: Parameters<Browser['newContext']>[0] = {};
  private async neueSitzung(wunsch: Parameters<Browser['newContext']>[0]): Promise<void> {
    this.sitzungsWunsch = { ...this.sitzungsWunsch, ...wunsch };
    await this.sitzungBeenden();
    this.eigenerKontext = await this.browser.newContext({
      viewport: { width: 1400, height: 1000 },
      deviceScaleFactor: 2,
      locale: 'de-DE',
      timezoneId: ZONE,
      baseURL: this.baseURL,
      ...this.sitzungsWunsch,
    });
    this.page = await this.eigenerKontext.newPage();
    // Abdeckungsmessung (COVERAGE=1) auch für eigene Sitzungen – sonst fehlen
    // alle Smartphone-/Zeitzonen-Szenarien, z. B. die Touch-Gesten.
    if (coverageAktiv) await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
  }

  /** Schließt die eigene Sitzung und liefert vorher ggf. ihre Abdeckungsdaten ab. */
  private async sitzungBeenden(): Promise<void> {
    if (!this.eigenerKontext) return;
    if (coverageAktiv) {
      const daten = await this.page.coverage.stopJSCoverage().catch(() => []);
      if (daten.length) await new CoverageReport(coverageOptionen).add(daten);
    }
    await this.eigenerKontext.close();
    this.eigenerKontext = undefined;
  }

  /** Browser mit anderer Sprache (z. B. "en-US"); vor oeffnen(). */
  async nutzeBrowserSprache(locale: string): Promise<void> {
    await this.neueSitzung({ locale });
  }

  // ── Störungen nachstellen (vor oeffnen() aufrufen) ──────────────────
  /** Bilder der Uhr (Zeiger, Hintergründe, Tierkreiszeichen) laden nicht. */
  async sperreBilderDerUhr(): Promise<void> {
    await this.page.route(/\/assets\/images\/(zeiger|hintergrund|tierkreiszeichen)\//, (r) => r.abort());
  }

  /** Kalenderdaten (data/*.json) laden nicht. */
  async sperreKalenderdaten(): Promise<void> {
    await this.page.route(/\/data\/[^/]+\.json/, (r) => r.abort());
  }

  /** Der Browser stellt kein WebGL bereit (wie bei alter Grafik/abgeschalteter Beschleunigung). */
  async ohneWebGL(): Promise<void> {
    await this.page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, typ: string, ...rest: unknown[]) {
        return typ.startsWith('webgl') || typ === 'experimental-webgl' ? null : (original as any).call(this, typ, ...rest);
      } as typeof original;
    });
  }

  async neuLaden(): Promise<void> {
    await this.page.reload();
    await expect(this.canvas).toBeVisible();
  }

  /** Gerät bittet um reduzierte Bewegung (Betriebssystem-Einstellung); vor oeffnen(). */
  async bevorzugeReduzierteBewegung(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
  }

  async aufraeumen(): Promise<void> {
    await this.sitzungBeenden();
  }

  /**
   * Friert die Uhrzeit des Browsers ein. Muss VOR oeffnen() laufen, weil die
   * App beim Start die aktuelle Zeit übernimmt. Timer laufen weiter.
   */
  async setzeHeute(datum: Date): Promise<void> {
    await this.page.clock.setFixedTime(datum);
  }

  async oeffnen(): Promise<void> {
    await this.page.goto('/');
    await expect(this.canvas).toBeVisible();
    // Die Bilder der Uhr laden asynchron; erst danach zeichnet der Canvas.
    await this.page.waitForFunction(() => {
      const c = document.querySelector<HTMLCanvasElement>('#canvas');
      return !!c && c.width > 0 && Array.from(document.images).every((i) => i.complete);
    });
  }

  /** Datum über das Simulationsfeld einstellen (wie ein Mensch es tut). */
  async stelleDatumEin(datum: Date): Promise<void> {
    if (!(await this.datumsfeld.isVisible())) await this.menuepunkt('simulationPanel').click();
    await this.datumsfeld.fill(alsFeldwert(datum));
  }

  async oeffneKalender(): Promise<void> {
    await this.menuepunkt('calendarPanel').click();
    await expect(this.kalenderPanel).toBeVisible();
  }

  /** Klick auf den Menüpunkt „Kalender“ ohne Erwartung (öffnet bzw. schließt). */
  async oeffneKalenderMenue(): Promise<void> {
    await this.menuepunkt('calendarPanel').click();
  }

  async wechsleSprache(): Promise<void> {
    await this.sprachButton.click();
  }

  // ── Kalender-Panel ──────────────────────────────────────────────────
  /** Angabe im Kalender-Panel über ihre Bezeichnung (Tooltip), z. B. "Osterdatum". */
  kalenderAngabe(bezeichnung: string): Locator {
    return this.kalenderPanel.getByTitle(bezeichnung, { exact: true });
  }
  /** Zeilen der Finsternis-Liste (je Zeile: Tooltip = Art, Text = Datum/Uhrzeit). */
  get finsternisZeilen(): Locator { return this.kalenderPanel.locator('.cal-eclipse-compact'); }

  async oeffneErlaeuterungen(): Promise<void> {
    await this.kalenderPanel.getByRole('button', { name: /Erläuterungen|Explanation/ }).click();
    await expect(this.modal).toBeVisible();
  }
  get modal(): Locator { return this.page.locator('app-modal .modal-content'); }

  // ── Simulation ──────────────────────────────────────────────────────
  get simulation(): Locator { return this.page.locator('app-simulation-panel'); }
  get liveAnzeige(): Locator { return this.page.locator('#liveDateTime'); }
  get startStopButton(): Locator { return this.simulation.getByRole('button', { name: /Start|Stop/ }); }
  get geschwindigkeitsRegler(): Locator { return this.simulation.getByRole('slider'); }

  async starteSimulation(): Promise<void> {
    await expect(this.startStopButton).toContainText('Start');
    await this.startStopButton.click();
  }
  async halteSimulationAn(): Promise<void> {
    await expect(this.startStopButton).toContainText('Stop');
    await this.startStopButton.click();
  }
  async setzeSimulationZurueck(): Promise<void> {
    await this.simulation.getByRole('button', { name: 'Reset', exact: true }).click();
  }
  async stelleGeschwindigkeitEin(faktor: number): Promise<void> {
    await this.geschwindigkeitsRegler.fill(String(faktor));
  }
  /**
   * Beobachtet die Live-Anzeige über eine Zeitspanne. Ein festes Warten ist
   * hier der Zweck: Geprüft wird, ob sich in dieser Zeit etwas ändert.
   */
  async beobachteZeitpunkt(ms: number): Promise<{ vorher: Date; nachher: Date }> {
    const vorher = await this.angezeigterZeitpunkt();
    await this.page.waitForTimeout(ms);
    return { vorher, nachher: await this.angezeigterZeitpunkt() };
  }

  /** Angezeigter Zeitpunkt der Simulation (Live-Anzeige "TT.MM.JJJJ HH:mm:ss"). */
  async angezeigterZeitpunkt(): Promise<Date> {
    const text = (await this.liveAnzeige.innerText()).trim();
    const m = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(text);
    if (!m) throw new Error(`Live-Anzeige "${text}" nicht lesbar`);
    return new Date(berlinZeitpunkt(+m[3], +m[2], +m[1], +m[4], +m[5]).getTime() + +m[6] * 1000);
  }

  // ── Bedienung der Kalenderscheibe ───────────────────────────────────
  scheibenButton(bezeichnung: string): Locator { return this.page.getByTitle(bezeichnung, { exact: true }); }
  get scheibenReset(): Locator { return this.scheibenButton('⟲ Reset'); }

  /**
   * Bedienbar = sichtbar, nicht durchsichtig und klickbar. Die Steuerung wird
   * per opacity/pointer-events ausgeblendet; toBeVisible() erkennt das nicht.
   */
  async istBedienbar(element: Locator): Promise<boolean> {
    if ((await element.count()) === 0 || !(await element.isVisible())) return false;
    return element.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.1 && s.pointerEvents !== 'none';
    });
  }

  /** Zieht mit der Maus auf einem Kreis um die Canvas-Mitte (positiv = im Uhrzeigersinn). */
  async ziehe(vonGrad: number, bisGrad: number): Promise<void> {
    const bb = await this.warteBisCanvasRuhig();
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2, r = bb.width * 0.3;
    const punkt = (g: number) => [cx + r * Math.cos(g / GRAD), cy + r * Math.sin(g / GRAD)] as const;
    await this.page.mouse.move(...punkt(vonGrad));
    await this.page.mouse.down();
    for (let i = 1; i <= 10; i++) await this.page.mouse.move(...punkt(vonGrad + ((bisGrad - vonGrad) * i) / 10));
    await this.page.mouse.up();
  }

  /** Zieht mit der Maus geradlinig (für den Verschiebe-Modus). */
  async ziehePixel(dx: number, dy: number): Promise<void> {
    const bb = await this.warteBisCanvasRuhig();
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + dx, y + dy, { steps: 10 });
    await this.page.mouse.up();
  }

  /**
   * Finger-Geste auf dem Uhr-Canvas, siehe beruehreElement().
   */
  async beruehre(bilder: Array<Array<[number, number]>>): Promise<void> {
    await this.beruehreElement(this.canvas, bilder);
  }

  /**
   * Finger-Geste auf einem Element. `bilder` ist eine Folge von Momentaufnahmen,
   * jede mit der Position aller aufliegenden Finger (Bildschirmkoordinaten).
   * Kommt ein Finger hinzu → touchstart, gleiche Zahl → touchmove, weniger →
   * touchend mit den verbleibenden Fingern; am Ende werden alle angehoben.
   * Playwright kann nur einzelne Taps; Mehrfinger-Gesten werden daher als
   * TouchEvents nachgestellt (braucht eine Sitzung mit hasTouch, s. nutzeSmartphone).
   */
  async beruehreElement(ziel: Locator, bilder: Array<Array<[number, number]>>): Promise<void> {
    await ziel.evaluate((el, bilder) => {
      const finger = (pts: Array<[number, number]>, ab = 0) =>
        pts.map(([x, y], i) => new Touch({ identifier: ab + i, target: el, clientX: x, clientY: y }));
      const sende = (typ: string, touches: Touch[], geaendert: Touch[]) =>
        el.dispatchEvent(new TouchEvent(typ, { touches, changedTouches: geaendert, bubbles: true, cancelable: true }));
      let vorher: Array<[number, number]> = [];
      for (const jetzt of [...bilder, []]) {
        const alle = finger(jetzt);
        if (jetzt.length > vorher.length) sende('touchstart', alle, alle.slice(vorher.length));
        else if (jetzt.length === vorher.length) sende('touchmove', alle, alle);
        else sende('touchend', alle, finger(vorher.slice(jetzt.length), jetzt.length));
        vorher = jetzt;
      }
    }, bilder);
  }

  /** Tablet im Hochformat mit Touch-Bildschirm (Modusknöpfe der Kalenderscheibe sichtbar). */
  async nutzeTablet(): Promise<void> {
    await this.neueSitzung({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  }

  /** Mittelpunkt und Radius für Gesten auf dem Canvas. */
  async gestenMass(): Promise<{ cx: number; cy: number; r: number }> {
    const bb = await this.warteBisCanvasRuhig();
    return { cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2, r: bb.width * 0.3 };
  }

  /** Lage zweier Bereiche (für Layout-Prüfungen). */
  async box(element: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
    const bb = await element.boundingBox();
    if (!bb) throw new Error('Element nicht sichtbar');
    return bb;
  }
  get menue(): Locator { return this.page.locator('#controls'); }

  /** Ist die Seite breiter als der Bildschirm (seitliches Scrollen)? */
  async seitlichVerschiebbar(): Promise<boolean> {
    return this.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  }

  /** Alle sichtbaren Bedienelemente in `bereich` (Standard: Menü), die kleiner als `min` px sind. */
  async zuKleineBedienelemente(min: number, bereich: Locator = this.menue): Promise<string[]> {
    return bereich.evaluate((root, min) => {
      const els = Array.from(root.querySelectorAll<HTMLElement>('button, select, input, .controls-header, .modal-close'));
      return els
        .filter((e) => e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden')
        .filter((e) => !(e instanceof HTMLInputElement && e.type === 'range'))
        .map((e) => [((e.getAttribute('aria-label') ?? e.textContent) || e.id || e.tagName).trim(), e.getBoundingClientRect().height] as const)
        .filter(([, h]) => h < min - 0.5)
        .map(([name, h]) => `${name} (${h.toFixed(0)} px)`);
    }, min);
  }

  // ── Fenster (Modals) ────────────────────────────────────────────────
  get fenster(): Locator { return this.page.locator('app-modal'); }
  get fensterTitel(): Locator { return this.modal.locator('.modal-title'); }
  /** Das „ד oben rechts – als Knopf „Schließen“ auch für Tastatur und Screenreader. */
  get fensterKreuz(): Locator {
    return this.modal.locator('.modal-header').getByRole('button', { name: /Schließen|Close/ });
  }
  get fensterSchliessen(): Locator {
    return this.modal.locator('.modal-footer').getByRole('button', { name: /Schließen|Close/ });
  }

  /** Öffnet ein Fenster über seinen Menüpunkt: "Einführung" oder "Kunst & Geschichte". */
  async oeffneFenster(name: string): Promise<void> {
    const panel = { 'Einführung': 'infoButtonHeader', 'Kunst & Geschichte': 'historyPanel' }[name];
    if (!panel) throw new Error(`Unbekanntes Fenster "${name}"`);
    const ziel = panel === 'infoButtonHeader' ? this.einfuehrung : this.menuepunkt(panel);
    await ziel.click();
    await this.warteAufFenster();
  }

  /** Wartet, bis das Fenster fertig eingeblendet ist (CSS-Animationen fadeIn/slideIn, 0,3 s). */
  async warteAufFenster(): Promise<void> {
    await expect(this.modal).toBeVisible();
    await this.fenster.evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)).then(() => undefined));
  }

  /** Klick auf den abgedunkelten Hintergrund neben dem Fenster. */
  async klickeNebenDasFenster(): Promise<void> {
    await this.page.locator('.modal-overlay').click({ position: { x: 5, y: 5 } });
  }

  async hintergrundScrollGesperrt(): Promise<boolean> {
    return this.page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden');
  }

  // ── Bildbetrachter ──────────────────────────────────────────────────
  get bildbetrachter(): Locator { return this.modal.locator('app-image-viewer'); }
  /** Bildbetrachter, dessen Titel `titel` enthält. */
  bild(titel: string): Locator { return this.bildbetrachter.filter({ hasText: titel }); }

  /** Lage des Bildes laut CSS-transform: translate(x, y) scale(s). */
  async bildAnsicht(titel: string): Promise<{ x: number; y: number; s: number }> {
    const t = await this.bild(titel).locator('img').evaluate((img) => (img as HTMLElement).style.transform);
    const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)\s*scale\((-?[\d.]+)\)/.exec(t);
    if (!m) throw new Error(`Bild-Transform "${t}" nicht lesbar`);
    return { x: +m[1], y: +m[2], s: +m[3] };
  }

  /** Scrollt jedes Bild ins Sichtfeld (sie laden „lazy“) und liefert die nicht ladbaren. */
  async nichtGeladeneBilder(): Promise<string[]> {
    const fehlend: string[] = [];
    for (const viewer of await this.bildbetrachter.all()) {
      const img = viewer.locator('img');
      await img.scrollIntoViewIfNeeded();
      const ok = await expect
        .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { timeout: 10_000 })
        .toBe(true).then(() => true, () => false);
      if (!ok) fehlend.push(await img.getAttribute('src') ?? '?');
    }
    return fehlend;
  }

  async ziehePixelIn(element: Locator, dx: number, dy: number): Promise<void> {
    await element.scrollIntoViewIfNeeded();
    const bb = await this.box(element);
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + dx, y + dy, { steps: 8 });
    await this.page.mouse.up();
  }

  // ── 3D-Funktionsmodell ──────────────────────────────────────────────
  get m3dPanel(): Locator { return this.page.locator('app-model3d-panel'); }
  get m3dBild(): Locator { return this.page.getByLabel(/Dreidimensionales Modell|three-dimensional model/i); }
  get m3dZurueck(): Locator { return this.page.locator('#controls').getByText(/Zurück zur Uhr|Back to the clock/); }
  get m3dLaufKnopf(): Locator { return this.m3dPanel.locator('button.play'); }
  get m3dGeschwindigkeit(): Locator { return this.m3dPanel.getByRole('combobox'); }
  get m3dUhrStellen(): Locator { return this.m3dPanel.locator('#m3d-when'); }
  get m3dBeschriftungen(): Locator { return this.page.locator('app-model3d-stage .tag'); }
  get m3dHinweis(): Locator { return this.page.locator('app-model3d-stage .hint'); }
  get m3dFehler(): Locator { return this.page.locator('app-model3d-stage .err'); }
  m3dKnopf(name: string): Locator { return this.m3dPanel.getByRole('button', { name, exact: true }); }

  async oeffne3dModell(): Promise<void> {
    await this.menuepunkt('model3dPanel').click();
    await expect(this.m3dBild).toBeVisible({ timeout: 15_000 }); // three.js lädt nach
  }

  /** Zeitpunkt im Feld „Uhr stellen“ – Lübecker Ortszeit (im Sommer MESZ), wie die echte Uhr. */
  async m3dZeitpunkt(): Promise<Date> {
    const v = await this.m3dUhrStellen.inputValue();
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
    if (!m) throw new Error(`Feld „Uhr stellen“ enthält "${v}"`);
    return berlinZeitpunkt(+m[1], +m[2], +m[3], +m[4], +m[5]);
  }

  /** Zeitpunkt → Feldwert in Lübecker Ortszeit (Format datetime-local). */
  static alsFeldwert(d: Date): string {
    return alsFeldwert(d);
  }

  /**
   * Beschriftungen fester Bauteile – ohne Sonne und Mond, die sich mit dem
   * laufenden Modell bewegen. Ihre Bildschirmlage ändert sich nur mit der Kamera.
   */
  async feststehendeBeschriftungen(): Promise<Array<{ text: string; x: number; y: number }>> {
    return (await this.sichtbareBeschriftungen())
      .filter((b) => !/^(Sonne|Mond|Sun|Moon)$/.test(b.text))
      .map((b) => {
        const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)\s*$/.exec(b.transform);
        return { text: b.text, x: m ? +m[1] : NaN, y: m ? +m[2] : NaN };
      });
  }

  /**
   * Wartet, bis die Kamera ruht. Nach dem Öffnen und nach einem Ansichtswechsel
   * fährt sie einige Sekunden lang weich an ihr Ziel.
   */
  async warteBisKameraRuhig(): Promise<void> {
    let vorher = '', gleich = 0;
    for (let i = 0; i < 80; i++) {
      const jetzt = JSON.stringify(await this.feststehendeBeschriftungen());
      gleich = jetzt === vorher ? gleich + 1 : 0;
      if (gleich >= 3) return;
      vorher = jetzt;
      await this.page.waitForTimeout(250);
    }
    throw new Error('Kamera des 3D-Modells kommt nicht zur Ruhe');
  }

  /** Mit der Maus im 3D-Bild ziehen (optional mit gedrückter Umschalttaste). */
  async ziehe3d(dx: number, dy: number, umschalt = false): Promise<void> {
    const bb = await this.box(this.m3dBild);
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    if (umschalt) await this.page.keyboard.down('Shift');
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + dx, y + dy, { steps: 10 });
    await this.page.mouse.up();
    if (umschalt) await this.page.keyboard.up('Shift');
  }

  async mausrad3d(schritte: number): Promise<void> {
    const bb = await this.box(this.m3dBild);
    await this.page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    for (let i = 0; i < Math.abs(schritte); i++) await this.page.mouse.wheel(0, schritte < 0 ? -200 : 200);
  }

  /** Sichtbare Beschriftungen und ihre Bildschirmpositionen. */
  async sichtbareBeschriftungen(): Promise<Array<{ text: string; transform: string }>> {
    return this.m3dBeschriftungen.evaluateAll((els) =>
      els.filter((e) => (e as HTMLElement).style.display !== 'none')
        .map((e) => ({ text: e.textContent ?? '', transform: (e as HTMLElement).style.transform })),
    );
  }

  async mausrad(schritte: number): Promise<void> {
    const bb = await this.warteBisCanvasRuhig();
    await this.page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    for (let i = 0; i < Math.abs(schritte); i++) await this.page.mouse.wheel(0, schritte < 0 ? -100 : 100);
  }

  // ── Visuelle Prüfungen (Canvas) ─────────────────────────────────────
  /**
   * Wartet, bis der Canvas seine endgültige Größe hat. Nach dem Öffnen des
   * Kalenders wächst er per CSS-Übergang noch ~600 ms; ein zu früh
   * berechneter Ausschnitt zeigt sonst eine falsche Stelle.
   */
  async warteBisCanvasRuhig(): Promise<{ x: number; y: number; width: number; height: number }> {
    // Erst nach 4 gleichen Messungen in Folge (~1 s) gilt die Größe als fest:
    // Der Übergang beginnt mitunter erst einige hundert ms nach dem Klick.
    let vorher = '';
    let gleich = 0;
    for (let i = 0; i < 60; i++) {
      const bb = await this.canvas.boundingBox();
      if (!bb) throw new Error('Canvas nicht sichtbar');
      const jetzt = JSON.stringify(bb);
      gleich = jetzt === vorher ? gleich + 1 : 0;
      if (gleich >= 3) return bb;
      vorher = jetzt;
      await this.page.waitForTimeout(250);
    }
    throw new Error('Canvas-Größe kommt nicht zur Ruhe');
  }

  /**
   * Ausschnitt um den feststehenden Datumszeiger der Kalenderscheibe
   * (links, 9-Uhr-Position). Für toHaveScreenshot(..., { clip }).
   * Relativ zur Canvas-Größe, damit er bei jeder Fenstergröße passt.
   */
  async zeigerAusschnitt(): Promise<{ x: number; y: number; width: number; height: number }> {
    const bb = await this.warteBisCanvasRuhig();
    return {
      x: bb.x + bb.width * 0.116,
      y: bb.y + bb.height / 2 - bb.height * 0.037,
      width: bb.width * 0.098,
      height: bb.height * 0.049,
    };
  }

  /** Ausschnitt um den Sonnenzeiger, wenn er oben (12 Uhr) steht. */
  async sonnenAusschnitt(): Promise<{ x: number; y: number; width: number; height: number }> {
    const bb = await this.warteBisCanvasRuhig();
    return { x: bb.x + bb.width * 0.3, y: bb.y + bb.height * 0.08, width: bb.width * 0.4, height: bb.height * 0.28 };
  }

  /** Die ganze Uhr. */
  async uhrAusschnitt(): Promise<{ x: number; y: number; width: number; height: number }> {
    return this.warteBisCanvasRuhig();
  }

  /** Unterer Bereich der Uhr – dort steht mittags der Vollmond (gegenüber der Sonne). */
  async untererAusschnitt(): Promise<{ x: number; y: number; width: number; height: number }> {
    const bb = await this.warteBisCanvasRuhig();
    return { x: bb.x + bb.width * 0.3, y: bb.y + bb.height * 0.62, width: bb.width * 0.4, height: bb.height * 0.3 };
  }

  // ── Fachliche Auswertung des gezeichneten Zustands ──────────────────
  // Die Uhr ist ein Canvas ohne DOM. Diese Methoden übersetzen die Winkel,
  // mit denen gezeichnet wird, in Begriffe der Uhr (Stunde, Sternbild,
  // Mondalter). Die Erwartungswerte kommen aus der Astronomie, nicht aus dem Code.

  /** Uhrzeit, auf die der Sonnenzeiger auf dem 24-Stunden-Ring zeigt (12 = oben). */
  async stundeDesSonnenzeigers(): Promise<number> {
    const z = await this.zustand();
    return (norm360((z['angleSun'] as number) * GRAD + 270) / 360) * 24;
  }

  /** Sternbild des Tierkreisrings, in dem die Sonne gerade steht. */
  async sternbildDerSonne(): Promise<string> {
    const z = await this.zustand();
    // Lage der Sonne im Bezugssystem des (mitdrehenden) Tierkreisrings
    const relativ = ((z['angleSun'] as number) - (z['angleZodiac'] as number)) * GRAD;
    // Gradzahl entlang der Ekliptik, ab dem Anfang des Stiers gezählt
    let x = norm360(-90 - relativ + STERNBILDER[0][1] / 2);
    for (const [name, breite] of STERNBILDER) {
      if (x < breite) return name;
      x -= breite;
    }
    return STERNBILDER[0][0];
  }

  /** Mondalter in Tagen seit Neumond (0 … 29,5). */
  async mondalter(): Promise<number> {
    return (await this.zustand())['mondAlterFractional'] as number;
  }

  /** Ansicht der Kalenderscheibe: Drehung (Grad), Zoomstufe, Verschiebung (px). */
  async scheibenAnsicht(): Promise<{ drehung: number; zoom: number; dx: number; dy: number; sichtbar: boolean }> {
    const z = await this.zustand();
    return {
      drehung: (z['angleCalendarDisk'] as number) * GRAD,
      zoom: z['calendarZoom'] as number,
      dx: z['calendarOffsetX'] as number,
      dy: z['calendarOffsetY'] as number,
      sichtbar: z['showCalendarDisk'] as boolean,
    };
  }

  /** Winkel zwischen Mond- und Sonnenzeiger in Grad (−180 … +180). */
  async mondSonneAbstand(): Promise<number> {
    const z = await this.zustand();
    return winkelAbstand((z['angleMoon'] as number) * GRAD, (z['angleSun'] as number) * GRAD);
  }

  // ── Notausgang für Canvas-Zustand ───────────────────────────────────
  /**
   * Liest den berechneten Zustand (Winkel, Mondalter …) direkt aus dem
   * ClockSimulationService. Funktioniert nur mit `ng serve` (Dev-Build,
   * window.ng). Nur verwenden, wenn sich etwas weder über DOM noch über
   * einen Screenshot prüfen lässt.
   */
  async zustand(): Promise<Record<string, unknown>> {
    return this.page.evaluate(() => {
      const ng = (window as any).ng;
      if (!ng) throw new Error('window.ng fehlt – läuft die App im Dev-Modus (ng serve)?');
      const cmp = ng.getComponent(document.querySelector('app-canvas'));
      return { ...cmp.clockService.astroState() };
    });
  }
}
