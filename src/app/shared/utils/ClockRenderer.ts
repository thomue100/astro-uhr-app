// ClockRenderer.ts — Canvas-Zeichenlogik, portiert aus Renderer.js

export class ClockRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private images: any;
  private config: any;

  /**
   * @param canvas  Das Canvas-Element
   * @param ctx     Der 2D-Renderkontext
   * @param imageManager  ImageManager-Instanz — der Renderer liest .images daraus
   * @param config  AstroConfig mit TWO_PI, zodiacData, moonDimensions, usw.
   *
   * WICHTIG: In Renderer.js war die Signatur (ctx, canvas, images, config).
   * In der Angular-Version ist sie (canvas, ctx, imageManager, config),
   * damit canvas.ts konsistent mit dem ViewChild-Zugriff bleibt.
   */
  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    imageManager: any,
    config: any = null
  ) {
    this.canvas  = canvas;
    this.ctx     = ctx;
    // ImageManager besitzt ein .images-Objekt; direktes images-Objekt wird ebenfalls akzeptiert
    this.images  = imageManager?.images ?? imageManager;
    this.config  = config ?? imageManager?.config ?? (window as any)['AstroConfig'] ?? {};
  }

  withContext(fn: () => void): void {
    this.ctx.save();
    fn();
    this.ctx.restore();
  }

  // -----------------------------------------------------------------------
  // Haupt-Zeichenmethode
  // -----------------------------------------------------------------------

  drawClock(state: any): void {
    const ctx = this.ctx;
    const c   = this.canvas;
    ctx.clearRect(0, 0, c.width, c.height);

    const center = { x: c.width / 2, y: c.height / 2 };
    const rLarge = c.width * 0.37;
    const rOuter = c.width * 0.37 * 1.12;
    const rSmall = c.width * 0.32;
    const rMoon  = (rLarge + rSmall) / 2;

    const parseAngle = (val: any): number =>
      typeof val === 'number' && !isNaN(val) ? val : 0;

    // ENTFERNT: state.showCalendarDisk = false;
    // showCalendarDisk wird vom ControlsComponent über den Service gesetzt
    // (true wenn Kalender-Panel offen, false wenn Simulation-Panel offen)

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
      this.drawMoon(rMoon, parseAngle(state.angleMoon), parseAngle(state.mondAlter), center);
      this.drawPointer(parseAngle(state.angleMoon), 0, rMoon * 0.95, 'gold', center);
      this.drawHeilandImage(center);
    }
  }

  // -----------------------------------------------------------------------
  // Generische Hilfsmethode
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Spezifische Zeichenfunktionen — 1:1 aus Renderer.js portiert
  // -----------------------------------------------------------------------

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
      // Fallback: Römische Ziffern
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
          ctx.font = `${Math.floor(this.canvas.width * 0.035)}px sans-serif`;
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
    ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    ctx.rotate(rotationAngle);
    const numStars      = 96;
    const starOuter     = radius * 0.015;
    const starInner     = starOuter * 0.5;
    const r             = radius - starOuter;
    for (let i = 0; i < numStars; i++) {
      const angle = (i * TWO_PI) / numStars;
      const numPoints = (i + 1) % 4 === 0 ? 8 : 4;
      this.drawStar(Math.cos(angle) * r, Math.sin(angle) * r, numPoints, starOuter, starInner, 'gold');
    }
    ctx.restore();
  }

  /**
   * Zeichnet die Kalenderscheibe vollständig im Canvas.
   *
   * Der Zoom-Faktor (calendarZoom) steuert die Darstellungsgröße:
   *   - 1.0  = Scheibe füllt genau den Canvas-Durchmesser (rOuter * 2)
   *   - < 1.0 = Scheibe kleiner (mehr Rand sichtbar)
   *   - > 1.0 = Scheibe größer (Ränder werden abgeschnitten)
   *
   * ──────────────────────────────────────────────────────────────────────────
   * FEINEINSTELLUNG ZOOM: Den Wert CALENDAR_DISK_FIT_FACTOR anpassen,
   * um die Scheibe im Canvas vollständig sichtbar zu machen.
   *   - Zu groß (Ränder abgeschnitten) → Wert verkleinern (z.B. 0.90)
   *   - Zu klein (viel Leerraum)        → Wert vergrößern (z.B. 0.98)
   * ──────────────────────────────────────────────────────────────────────────
   */
  drawCalendarDisk(center: { x: number; y: number }, maxRadius: number, rotationAngle: number, state: any): void {
    const ctx        = this.ctx;
    const img        = this.images?.calendarDisk;
    const TWO_PI     = this.config?.TWO_PI ?? Math.PI * 2;

    // ↓↓↓ ZOOM NACHJUSTIEREN: Faktor für vollständige Darstellung im Canvas ↓↓↓
    const CALENDAR_DISK_FIT_FACTOR = 0.93; // 0.93 = leichter Sicherheitsrand
    // ↑↑↑ Erhöhen → Scheibe größer; Verkleinern → mehr Rand sichtbar           ↑↑↑

    // Der calendarZoom aus dem State (Standardwert 1.5) wird auf den Fit-Faktor gemappt:
    // Bei zoom=1.5 (Standard) füllt die Scheibe den Canvas fast vollständig.
    // maxRadius ist bereits rOuter (= c.width * 0.37 * 1.12), daher:
    // radius = Canvas-Hälfte (c.width/2) * CALENDAR_DISK_FIT_FACTOR
    const canvasHalf = this.canvas.width / 2;
    const zoomFactor = state.calendarZoom || 1.5;

    // Die Scheibe soll bei Zoom=1.5 den Canvas-Durchmesser vollständig ausfüllen.
    // Dazu normalisieren wir: bei zoom=1.5 → radius = canvasHalf * FIT_FACTOR
    const radius = canvasHalf * CALENDAR_DISK_FIT_FACTOR * (zoomFactor / 1.5);

    if (img && img.complete && img.naturalWidth > 0) {
      this.withContext(() => {
        ctx.translate(center.x, center.y);
        ctx.rotate(rotationAngle);
        const size = radius * 2;
        ctx.globalAlpha = 1.0;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      });
    } else {
      // Fallback wenn Bild nicht geladen
      this.withContext(() => {
        ctx.translate(center.x, center.y);
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
        const imgH = this.canvas.width * 0.06;
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
    const size = this.canvas.width * 0.05;
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

  drawMoon(radius: number, angle: number, days: number, center: { x: number; y: number }): void {
    const ctx             = this.ctx;
    const dynamicH        = this.canvas.width * 0.04;
    const dynamicW        = dynamicH * (this.config?.moonDimensions?.aspectRatio ?? 1);
    const HALF_PI         = this.config?.HALF_PI ?? Math.PI / 2;

    const getMoonSymbol = (d: number): string => {
      const symbols = ['🌘','🌗','🌖','🌕','🌔','🌓','🌒','🌑'];
      const norm = ((d - 1 + 29.5) % 29.5);
      return symbols[Math.floor(norm / (29.5 / 8))];
    };

    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.rotate(angle);
      const x   = radius;
      const idx = Math.max(0, Math.min(Math.floor(days) - 1, (this.images?.moonPhases?.length ?? 1) - 1));
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
    const size = this.canvas.width * 0.29;
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
    const fontSize   = this.canvas.width * 0.02;
    const rBase      = radius - radius * 0.2;

    this.withContext(() => {
      ctx.translate(center.x, center.y);
      ctx.rotate(rotationAngle);

      for (const name of zodiacData.names) {
        const angle       = zodiacData.angles?.[name];
        if (angle === undefined) continue;

        const img         = this.images?.zodiac?.[name];
        const scale       = zodiacData.scaleFactors?.[name]  ?? 1;
        const radialOff   = zodiacData.radialOffsets?.[name] ?? 0;
        const rPos        = rBase + radius * radialOff;
        const x           = Math.cos(angle) * rPos;
        const y           = Math.sin(angle) * rPos;
        const size        = fontSize * scale;

        ctx.save();
        ctx.translate(x, y);
        // Rotation aufheben damit die Zeichen aufrecht stehen
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
   * Berechnet die Canvas-Größe responsiv und gibt die interne Auflösung zurück.
   * Entspricht updateCanvasSizeAndRedraw() in Renderer.js (vereinfacht ohne DOM-Refs).
   */
  calculateResponsiveSize(availableWidth: number, availableHeight: number): number {
    const size = Math.max(Math.min(availableWidth, availableHeight), 200);
    this.canvas.width  = size;
    this.canvas.height = size;
    return size;
  }

  private _fallbackZodiacData(): any {
    const names = ['widder','stier','zwilling','krebs','loewe','jungfrau',
                   'waage','skorpion','schuetze','steinbock','wassermann','fische'];
    const angles: any  = {};
    const symbols: any = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
    names.forEach((n, i) => { angles[n] = ((i * 30 - 105) * Math.PI) / 180; });
    return { names, angles, symbols: Object.fromEntries(names.map((n,i) => [n, symbols[i]])),
             scaleFactors: {}, radialOffsets: {} };
  }
}
