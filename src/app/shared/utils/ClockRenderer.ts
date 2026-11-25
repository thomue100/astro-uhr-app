// src/app/shared/utils/ClockRenderer.ts
export class ClockRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private images: any;
  private config: any;

  /**
   * "Logische" Canvas-Größe in CSS-Pixeln — unabhängig von der tatsächlichen
   * Backing-Store-Auflösung (canvas.width/height), die jetzt zusätzlich mit
   * devicePixelRatio skaliert wird (siehe calculateResponsiveSize). Alle
   * proportionalen Zeichen-Berechnungen (Radien, Schriftgrößen, ...) nutzen
   * weiterhin diese logische Größe, damit sich an der bestehenden Geometrie
   * nichts ändert — nur die tatsächliche Bildschärfe wird verbessert.
   */
  private logicalSize: number;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    imageManager: any,
    config: any = null
  ) {
    this.canvas  = canvas;
    this.ctx     = ctx;
    this.images  = imageManager?.images ?? imageManager;
    this.config  = config ?? imageManager?.config ?? (window as any)['AstroConfig'] ?? {};
    this.logicalSize = canvas.width || 0;
  }

  withContext(fn: () => void): void {
    this.ctx.save();
    fn();
    this.ctx.restore();
  }

  drawClock(state: any): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.logicalSize, this.logicalSize);

    const center = { x: this.logicalSize / 2, y: this.logicalSize / 2 };
    const rLarge = this.logicalSize * 0.37;
    const rOuter = this.logicalSize * 0.37 * 1.12;
    const rSmall = this.logicalSize * 0.32;
    const rMoon  = (rLarge + rSmall) / 2;

    const parseAngle = (val: any): number =>
      typeof val === 'number' && !isNaN(val) ? val : 0;

    if (state.showCalendarDisk) {
      this.drawCalendarDisk(
        center,
        rOuter,
        parseAngle(state.angleCalendarDisk),
        state
      );
    } else {
      const combinedAngle = parseAngle(state.angleZodiac) + parseAngle(state.bgInitialAngle);
      this.fillRingBetween(rLarge * 1.005, rOuter, '#6d87a5', center);
      this.drawGoldenRings(rLarge * 1.005, rOuter, center);
      this.draw24HourDial(rLarge, center);
      this.drawBackgroundImage(rLarge, combinedAngle, center);
      this.drawZodiacSigns(rSmall, combinedAngle, center);
      this.drawPointer(parseAngle(state.angleSun), 0, rLarge * 0.96, 'gold', center);
      this.drawSun(rLarge * 1.13, parseAngle(state.angleSun), center);
      // ⚠️ KORREKTUR: Vorher wurde hier "state.mondAlter" übergeben
      // (der gerundete, für die Ziffernanzeige gedachte Wert, z. B.
      // "Tag 17"). Für eine gleichmäßige Bildverteilung braucht
      // drawMoon() aber den ungerundeten Bruchwert
      // "state.mondAlterFractional" (z. B. 16,73) — der wird bereits
      // vom ClockSimulationService berechnet und im AstroState
      // mitgeliefert, wurde bisher nur nicht an drawMoon() weitergereicht.
      this.drawMoon(rMoon, parseAngle(state.angleMoon), parseAngle(state.mondAlterFractional), center);

      this.drawPointer(parseAngle(state.angleMoon), 0, rMoon * 0.95, 'gold', center);
      this.drawHeilandImage(center);
    }
  }

  _drawRadialAsset(
    center: { x: number; y: number },
    angle: number,
    radius: number,
    image: HTMLImageElement | null,
    size: number,
    fallbackFn: ((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, config: any) => void) | null = null
  ): void {
    const ctx = this.ctx;
    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.rotate(angle);
      const x = radius;
      const y = 0;
      if (image && image.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
      } else if (fallbackFn) {
        fallbackFn(ctx, x, y, size, this.config);
      }
    });
  }

  fillRingBetween(rInner: number, rOuter: number, color: string, center: { x: number; y: number }): void {
    const ctx    = this.ctx;
    const TWO_PI = this.config?.TWO_PI ?? Math.PI * 2;
    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.beginPath();
      ctx.arc(0, 0, rOuter, 0, TWO_PI, false);
      ctx.arc(0, 0, rInner, 0, TWO_PI, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  drawGoldenRings(rInner: number, rOuter: number, center: { x: number; y: number }): void {
    const ctx    = this.ctx;
    const TWO_PI = this.config?.TWO_PI ?? Math.PI * 2;
    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.strokeStyle = 'gold';
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.arc(0, 0, rOuter, 0, TWO_PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, rInner, 0, TWO_PI); ctx.stroke();
    });
  }

  draw24HourDial(rOuter: number, center: { x: number; y: number }): void {
    const ctx = this.ctx;
    const img = this.images?.zifferring;
    const size = rOuter * 2 * 1.2;

    if (img && img.complete && img.naturalWidth > 0) {
      this.withContext(() => {
        ctx.translate(center.x, center.y);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      });
    } else {
      const PI      = this.config?.PI      ?? Math.PI;
      const HALF_PI = this.config?.HALF_PI ?? Math.PI / 2;
      const numerals = this.config?.romanNumerals ??
        ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
      this.withContext(() => {
        ctx.translate(center.x, center.y);
        ctx.fillStyle     = 'gold';
        ctx.textAlign     = 'center';
        ctx.textBaseline  = 'middle';
        for (let h = 1; h <= 24; h++) {
          const a = (h * 15 - 105) * PI / 180;
          const r = rOuter * 1.05;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(a + HALF_PI);
          ctx.font = `${Math.floor(this.logicalSize * 0.035)}px sans-serif`;
          ctx.fillText(numerals[(h - 1) % 12], 0, 0);
          ctx.restore();
        }
      });
    }
  }

  drawDisk(radius: number, _angle: number, color: string, center: { x: number; y: number }): void {
    const ctx    = this.ctx;
    const TWO_PI = this.config?.TWO_PI ?? Math.PI * 2;
    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TWO_PI);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  drawBackgroundImage(radius: number, rotationAngle: number, center: { x: number; y: number }): void {
    const ctx = this.ctx;
    const img = this.images?.bg;
    if (img && img.complete && img.naturalWidth > 0) {
      this.withContext(() => {
        ctx.translate(center.x, center.y);
        ctx.rotate(rotationAngle);
        const size = radius * 2;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      });
    } else {
      this.drawDisk(radius, 0, '#12283b', center);
      this.drawStarsOnBlueDiskEdge(radius - 5, rotationAngle);
    }
  }

  drawStar(cx: number, cy: number, points: number, outerRadius: number, innerRadius: number, color: string): void {
    const ctx = this.ctx;
    const PI  = this.config?.PI ?? Math.PI;
    ctx.save();
    ctx.beginPath();
    ctx.translate(cx, cy);
    ctx.moveTo(0, -outerRadius);
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * PI) / points;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      ctx.lineTo(Math.sin(angle) * r, -Math.cos(angle) * r);
    }
    ctx.closePath();
    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 4;
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.restore();
  }

  drawStarsOnBlueDiskEdge(radius: number, rotationAngle: number): void {
    const ctx    = this.ctx;
    const TWO_PI = this.config?.TWO_PI ?? Math.PI * 2;
    ctx.save();
    ctx.translate(this.logicalSize / 2, this.logicalSize / 2);
    ctx.rotate(rotationAngle);
    const numStars  = 96;
    const starOuter = radius * 0.015;
    const starInner = starOuter * 0.5;
    const r         = radius - starOuter;
    for (let i = 0; i < numStars; i++) {
      const angle     = (i * TWO_PI) / numStars;
      const numPoints = (i + 1) % 4 === 0 ? 8 : 4;
      this.drawStar(Math.cos(angle) * r, Math.sin(angle) * r, numPoints, starOuter, starInner, 'gold');
    }
    ctx.restore();
  }

  /**
   * Zeichnet die Kalenderscheibe mit Zoom, Rotation UND Verschiebung (offsetX/Y).
   *
   * Die Scheibe dreht sich immer um ihren eigenen Mittelpunkt (center + offset),
   * nicht um den Canvas-Mittelpunkt. Das erlaubt sauberes Verschieben + Drehen
   * unabhängig voneinander.
   *
   * canvasHalf basiert jetzt auf logicalSize statt canvas.width, damit die
   * Geometrie unabhängig von der (jetzt höheren) Backing-Store-Auflösung
   * exakt gleich bleibt wie zuvor - nur schärfer gerendert.
   */
  drawCalendarDisk(
    center: { x: number; y: number },
    maxRadius: number,
    rotationAngle: number,
    state: any
  ): void {
    const ctx    = this.ctx;
    const img    = this.images?.calendarDisk;
    const TWO_PI = this.config?.TWO_PI ?? Math.PI * 2;

    const CALENDAR_DISK_FIT_FACTOR = 0.93;
    const canvasHalf = this.logicalSize / 2;
    const zoomFactor = state.calendarZoom || 1.5;
    const radius     = canvasHalf * CALENDAR_DISK_FIT_FACTOR * (zoomFactor / 1.5);

    // Verschobener Mittelpunkt
    const cx = center.x + (state.calendarOffsetX ?? 0);
    const cy = center.y + (state.calendarOffsetY ?? 0);

    if (img && img.complete && img.naturalWidth > 0) {
      const size = radius * 2;
      this.withContext(() => {
        // Zuerst zum (verschobenen) Mittelpunkt, dann drehen
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);
        ctx.globalAlpha = 1.0;
        ctx.drawImage(this.getCalendarDiskWithoutPointer(img), -size / 2, -size / 2, size, size);
      });
      // Der Datumszeiger gehört zum Gehäuse der Uhr: Er dreht sich NICHT mit.
      this.withContext(() => {
        ctx.translate(cx, cy);
        ctx.scale(size / img.naturalWidth, size / img.naturalHeight);
        ctx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);
        this.drawCalendarDiskPointer(img.naturalWidth, img.naturalHeight);
      });
    } else {
      this.withContext(() => {
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.arc(0, 0, canvasHalf * CALENDAR_DISK_FIT_FACTOR, 0, TWO_PI);
        ctx.fillStyle = '#1e3a5f';
        ctx.fill();
        ctx.fillStyle    = 'white';
        ctx.font         = '16px sans-serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Kalenderscheibe nicht geladen', 0, 0);
      });
    }
  }

  /**
   * Das Foto der Kalenderscheibe enthält auch den goldenen Stern-Zeiger
   * (links, 9 Uhr, zeigt auf den 1./2. Juni). Würde das Foto unverändert
   * gedreht, drehte sich der Zeiger mit und zeigte immer auf Anfang Juni.
   *
   * Daher wird einmalig eine Kopie ohne Zeiger erzeugt: Der Sektor um den
   * Zeiger wird mit dem Bildinhalt von 14 Tagen weiter überdeckt – so passen
   * die Sonntagsbuchstaben (7-Tage-Zyklus) nahtlos. Den Zeiger zeichnet
   * drawCalendarDiskPointer() feststehend neu.
   */
  private calendarDiskCache: { src: HTMLImageElement; canvas: HTMLCanvasElement } | null = null;

  private getCalendarDiskWithoutPointer(img: HTMLImageElement): CanvasImageSource {
    if (this.calendarDiskCache?.src === img) return this.calendarDiskCache.canvas;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const off = document.createElement('canvas');
    off.width  = w;
    off.height = h;
    const c = off.getContext('2d');
    if (!c) return img;

    c.drawImage(img, 0, 0);

    const deg = Math.PI / 180;
    const R   = w / 2;
    // Zeiger liegt zwischen 2,5° unter und 6° über der 9-Uhr-Linie (Bildmitte)
    const a0 = Math.PI - 2.5 * deg;
    const a1 = Math.PI + 6 * deg;
    const shift = (14 / 365) * 2 * Math.PI;

    c.save();
    c.beginPath();
    c.arc(w / 2, h / 2, R * 1.02, a0, a1, false);
    c.arc(w / 2, h / 2, R * 0.75, a1, a0, true);
    c.closePath();
    c.clip();
    c.clearRect(0, 0, w, h);
    c.translate(w / 2, h / 2);
    c.rotate(shift);
    c.drawImage(img, -w / 2, -h / 2);
    c.restore();

    this.calendarDiskCache = { src: img, canvas: off };
    return off;
  }

  /**
   * Feststehender Datumszeiger (Stab + achtzackiger Stern) an derselben
   * Stelle wie im Foto. Koordinaten in Pixeln des Originalfotos (2732 × 2716),
   * werden auf die tatsächliche Bildgröße umgerechnet.
   */
  private drawCalendarDiskPointer(w: number, h: number): void {
    const ctx = this.ctx;
    const sx = w / 2732;
    const sy = h / 2716;
    const starX = 255 * sx;
    const starY = 1322 * sy;
    const unit  = sx;

    const gold = ctx.createLinearGradient(0, starY - 60 * unit, 0, starY + 60 * unit);
    gold.addColorStop(0,   '#fff3c4');
    gold.addColorStop(0.5, '#e6c66e');
    gold.addColorStop(1,   '#a8832f');

    ctx.fillStyle   = gold;
    ctx.strokeStyle = 'rgba(60, 40, 0, 0.6)';
    ctx.lineWidth   = 2 * unit;

    // Stab vom Rand bis zum Stern
    ctx.beginPath();
    ctx.moveTo(-10 * sx, 1302 * sy);
    ctx.lineTo(starX, starY - 6 * unit);
    ctx.lineTo(starX, starY + 6 * unit);
    ctx.lineTo(-10 * sx, 1348 * sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Achtzackiger Stern; die lange Zacke zeigt auf das Datum
    const tipAngle = Math.atan2(1330 - 1322, 322 - 255);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = tipAngle + (i * Math.PI) / 8;
      const r = i === 0 ? 68 * unit : i % 2 === 0 ? 56 * unit : 16 * unit;
      const x = starX + Math.cos(a) * r;
      const y = starY + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawPointer(angle: number, start: number, end: number, color: string, center: { x: number; y: number }): void {
    const ctx = this.ctx;
    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.rotate(angle);
      const length = end - start;
      const img = this.images?.pointer;
      if (img && img.complete && img.naturalWidth > 0) {
        const imgH = this.logicalSize * 0.06;
        ctx.drawImage(img, start, -imgH / 2, length, imgH);
      } else {
        ctx.beginPath();
        ctx.moveTo(start, 0);
        ctx.lineTo(end, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 4;
        ctx.stroke();
      }
    });
  }

  drawSun(radius: number, angle: number, center: { x: number; y: number }): void {
    const size = this.logicalSize * 0.1;
    this._drawRadialAsset(
      center, angle, radius - size / 2,
      this.images?.sun, size,
      (ctx, x, y, s, config) => {
        ctx.beginPath();
        ctx.fillStyle = 'gold';
        ctx.arc(x, y, s / 2, 0, config?.TWO_PI ?? Math.PI * 2);
        ctx.fill();
      }
    );
  }

  /**
     * ⚠️ KORREKTUR: Bildauswahl für die Mondphase.
     *
     * VORHER: idx = Math.floor(days) - 1
     *   → "days" war ein ganzzahliger Tageszähler (1..30), passend zur
     *     alten, falschen Zykluslänge von 30 Tagen. Jedes der 30 Bilder
     *     deckte damit exakt "1 Tag" ab.
     *
     * JETZT: Die Zykluslänge ist auf Behrens' präziseren Wert
     *   (≈29,530851 Tage) korrigiert (siehe config.ts). Ein einfaches
     *   "Math.floor(days) - 1" würde jetzt nicht mehr sauber auf die
     *   30 vorhandenen Bilder passen (29,53 ist kein Vielfaches von 30).
     *
     *   Deshalb wird der Bild-Index jetzt PROPORTIONAL berechnet:
     *   "Wie weit bin ich (in Prozent) durch den aktuellen Zyklus
     *   gewandert?" × "Anzahl vorhandener Bilder". So werden die
     *   30 Bilder unabhängig von der genauen Zykluslänge immer
     *   gleichmäßig über einen vollen Mondumlauf verteilt.
     *
     *   Wichtig: "days" muss hierfür der KONTINUIERLICHE Bruchwert sein
     *   (astroState.mondAlterFractional, Bereich 0..MOON_CYCLE_DAYS),
     *   nicht der gerundete Anzeige-Wert astroState.mondAlter.
     *   → Aufrufer-Anpassung in drawClock() weiter unten!
     */
    /**
     * Ersetzt die 30 Bild-Assets durch eine prozedurale, golden schimmernde
     * Mondkugel. Vorteile gegenüber den Bildern:
     *  - keine Diskretisierung mehr nötig (kein Math.floor/Index-Mapping,
     *    siehe unsere vorherige Korrektur) — der volle Bruchwert
     *    "mondAlterFractional" fließt direkt und stufenlos ein.
     *  - keine 30 Bilddateien zu laden/pflegen.
     *
     */
  /**
   * Mondkugel in der Kugelschale am Mondzeiger — golden/3D gerendert,
   * ohne die 30 Bild-Assets.
   *
   * Die Kugel sitzt fest in einer Halbkugelschale am Zeiger und dreht sich
   * daher zwangsläufig MIT dem Zeiger mit ("lokal unten" zeigt immer zur
   * Erde in der Mitte) — das ist keine Vereinfachung, sondern die
   * mechanische Realität der Lagerung, wie in der Originalzeichnung zu
   * sehen. Diese Rotation war schon in der ursprünglichen Vorlage korrekt
   * so vorgesehen.
   *
   * WICHTIG für später: Diese Zeiger-Rotation allein reicht nicht aus, um
   * die Phase korrekt relativ zur SONNE zu zeigen — dafür ist zusätzlich
   * die von Behrens berechnete Differenzrotation Mond:Sonne
   * (MOON_TO_SUN_RATIO, siehe config.ts) nötig, die die Kugel INNERHALB
   * der Schale noch einmal unabhängig weiterdreht. Sobald ein echter
   * Sonnen-Zeiger/-winkel in der App vorhanden ist, müsste hier zusätzlich
   * um den Winkel zwischen Sonnen- und Mondzeiger nachgedreht werden
   * (ctx.rotate(angle + Math.PI/2 + differenzWinkel)). Für dieses isolierte
   * Mond-Demo ohne Sonnenzeiger bilden wir zunächst nur die reine
   * Schalen-Mechanik nach.
   */
  drawMoon(radius: number, angle: number, days: number, center: { x: number; y: number }): void {
    const ctx = this.ctx;
    const r = this.logicalSize * 0.022;
    const cycleLen = this.config?.MOON_CYCLE_DAYS ?? 29.530851063829787;
    const phase = days / cycleLen;
    const waxing = phase < 0.5;

    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;

    // Highlight-Versatz in LOKALEN Kugelkoordinaten -> dreht sich mit der
    // Kugel in der Schale mit, wie ein echter Lichtreflex auf der
    // rotierenden, polierten Oberfläche.
    const hlx = -r * 0.35, hly = -r * 0.35;

    const gold = ctx.createRadialGradient(hlx, hly, r * 0.05, 0, 0, r * 1.05);
    gold.addColorStop(0, '#FFF3C4');
    gold.addColorStop(0.35, '#FFD866');
    gold.addColorStop(0.7, '#D4A017');
    gold.addColorStop(1, '#8A6A14');

    const dark = ctx.createRadialGradient(hlx * 0.5, hly * 0.5, r * 0.05, 0, 0, r * 1.05);
    dark.addColorStop(0, '#3A3D44');
    dark.addColorStop(0.6, '#22242A');
    dark.addColorStop(1, '#131418');

    let leftFill, rightFill, ellipseFill;
    if (waxing) {
      leftFill = dark; rightFill = gold;
      ellipseFill = phase < 0.25 ? dark : gold;
    } else {
      leftFill = gold; rightFill = dark;
      ellipseFill = phase < 0.75 ? gold : dark;
    }

    this.withContext(() => {
      ctx.translate(x, y);
      // Kugelschale am Zeiger: "lokal unten" zeigt immer zur Erde (Mitte) —
      // wiederhergestellt wie im Original.
      ctx.rotate(angle + Math.PI / 2);

      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI / 2, Math.PI * 1.5);
      ctx.fillStyle = leftFill; ctx.fill();

      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI / 2);
      ctx.fillStyle = rightFill; ctx.fill();

      const termAngle = phase * 2 * Math.PI;
      const rx = r * Math.abs(Math.cos(termAngle));
      ctx.beginPath(); ctx.ellipse(0, 0, rx, r, 0, 0, 2 * Math.PI);
      ctx.fillStyle = ellipseFill; ctx.fill();

      ctx.beginPath(); ctx.arc(0, 0, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255,216,102,0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
  drawHeilandImage(center: { x: number; y: number }): void {
    const size = this.logicalSize * 0.29;
    this._drawRadialAsset(
      center, 0, 0,
      this.images?.heiland, size,
      (ctx, x, y, s, config) => {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(x, y, s / 2, 0, config?.TWO_PI ?? Math.PI * 2);
        ctx.fill();
      }
    );
  }

  drawZodiacSigns(radius: number, rotationAngle: number, center: { x: number; y: number }): void {
    const ctx        = this.ctx;
    const zodiacData = this.config?.zodiacData ?? this._fallbackZodiacData();
    const fontSize   = this.logicalSize * 0.02;
    const rBase      = radius - radius * 0.2;

    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.rotate(rotationAngle);

      for (const name of zodiacData.names) {
        const angle = zodiacData.angles?.[name];
        if (angle === undefined) continue;

        const img       = this.images?.zodiac?.[name];
        const scale     = zodiacData.scaleFactors?.[name]  ?? 1;
        const radialOff = zodiacData.radialOffsets?.[name] ?? 0;
        const rPos      = rBase + radius * radialOff;
        const x         = Math.cos(angle) * rPos;
        const y         = Math.sin(angle) * rPos;
        const size      = fontSize * scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-rotationAngle);

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else if (zodiacData.symbols?.[name]) {
          ctx.font          = `${fontSize * 1.2}px Arial`;
          ctx.textAlign     = 'center';
          ctx.textBaseline  = 'middle';
          ctx.fillStyle     = 'white';
          ctx.fillText(zodiacData.symbols[name], 0, 0);
        }
        ctx.restore();
      }
    });
  }

  /**
   * Fix "Zoom-Problematik" (höchste Priorität), Teil 2: Die Backing-Store-
   * Auflösung des Canvas wird jetzt an devicePixelRatio angepasst (auf max.
   * 3x gedeckelt, um Speicher-/Performance-Probleme auf extrem hochauf-
   * lösenden Geräten zu vermeiden). Ohne das war die Darstellung auf
   * Retina-/High-DPI-Mobilgeräten unscharf, egal wie weit man zoomte.
   *
   * Wichtig: `logicalSize` bleibt die CSS-Pixel-Größe, mit der alle
   * bestehenden Zeichen-Berechnungen weiterrechnen. ctx.setTransform
   * skaliert nur die tatsächliche Ausgabe, ändert aber nichts an der
   * bestehenden Interaktions-/Zeichenlogik (Pan-Offsets aus Maus-/Touch-
   * Events sind bereits in CSS-Pixeln und bleiben dadurch exakt korrekt).
   */
  calculateResponsiveSize(availableWidth: number, availableHeight: number): number {
    const cssSize = Math.max(Math.min(availableWidth, availableHeight), 200);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const backingSize = Math.round(cssSize * dpr);

    this.logicalSize = cssSize;
    this.canvas.width  = backingSize;
    this.canvas.height = backingSize;
    this.canvas.style.width  = `${cssSize}px`;
    this.canvas.style.height = `${cssSize}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return cssSize;
  }

  private _fallbackZodiacData(): any {
    const names   = ['widder','stier','zwilling','krebs','loewe','jungfrau',
                     'waage','skorpion','schuetze','steinbock','wassermann','fische'];
    const angles: any  = {};
    const symbols: any = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
    names.forEach((n, i) => { angles[n] = ((i * 30 - 105) * Math.PI) / 180; });
    return { names, angles,
             symbols: Object.fromEntries(names.map((n, i) => [n, symbols[i]])),
             scaleFactors: {}, radialOffsets: {} };
  }
}
