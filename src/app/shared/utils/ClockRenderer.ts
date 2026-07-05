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
      this.drawSun(rLarge, parseAngle(state.angleSun), center);
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
      this.withContext(() => {
        // Zuerst zum (verschobenen) Mittelpunkt, dann drehen
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);
        const size = radius * 2;
        ctx.globalAlpha = 1.0;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
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
    const size = this.logicalSize * 0.05;
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
    drawMoon(radius: number, angle: number, days: number, center: { x: number; y: number }): void {
      const ctx      = this.ctx;
      const dynamicH = this.logicalSize * 0.04;
      const dynamicW = dynamicH * (this.config?.moonDimensions?.aspectRatio ?? 1);
      const HALF_PI  = this.config?.HALF_PI ?? Math.PI / 2;

      // Echte Zykluslänge aus der Konfiguration lesen (Fallback nur zur
      // Sicherheit, falls config aus irgendeinem Grund fehlt).
      const cycleLen = this.config?.MOON_CYCLE_DAYS ?? 29.530851063829787;

      // Emoji-Fallback (falls kein Bild geladen werden konnte): nutzt
      // jetzt ebenfalls die echte Zykluslänge statt der alten,
      // hart codierten "29.5".
      const getMoonSymbol = (d: number): string => {
        const symbols = ['🌘','🌗','🌖','🌕','🌔','🌓','🌒','🌑'];
        const norm = ((d - 1 + cycleLen) % cycleLen);
        return symbols[Math.floor(norm / (cycleLen / 8))];
      };

      this.withContext(() => {
        ctx.translate(center.x, center.y);
        ctx.rotate(angle);
        const x = radius;

        const phaseCount = this.images?.moonPhases?.length ?? 1;

        // Anteil des Zyklus, der bereits "vergangen" ist (0.0 bis 1.0),
        // multipliziert mit der Bilderanzahl → gleichmäßige Verteilung
        // der 30 Bilder über die tatsächliche Zykluslänge.
        const idx = Math.max(
          0,
          Math.min(
            Math.floor((days / cycleLen) * phaseCount),
            phaseCount - 1
          )
        );
        const img = this.images?.moonPhases?.[idx];

        ctx.save();
        ctx.translate(x, 0);
        ctx.rotate(HALF_PI);
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, -dynamicW / 2, -dynamicH / 2, dynamicW, dynamicH);
        } else {
          const fontSize = dynamicH * 1.5;
          ctx.font          = `${fontSize}px sans-serif`;
          ctx.textAlign     = 'center';
          ctx.textBaseline  = 'middle';
          ctx.fillStyle     = 'silver';
          ctx.fillText(getMoonSymbol(days), 0, 0);
        }
        ctx.restore();
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
