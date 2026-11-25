// features/support/astro-uhr.ts
//
// Seitenobjekt für die Astro-Uhr. Schritt-Definitionen sprechen nur hiermit,
// nie direkt mit Selektoren: Ändert sich das Markup, wird nur diese Datei angepasst.
import { expect, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

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
    this.eigenerKontext = await this.browser.newContext({
      viewport: this.page.viewportSize() ?? undefined,
      deviceScaleFactor: 2,
      locale: 'de-DE',
      timezoneId: zeitzone,
      baseURL: this.baseURL,
    });
    this.page = await this.eigenerKontext.newPage();
  }

  async aufraeumen(): Promise<void> {
    await this.eigenerKontext?.close();
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

  async wechsleSprache(): Promise<void> {
    await this.sprachButton.click();
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
