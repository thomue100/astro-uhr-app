// ClockRenderer.ts — Maximale Flexibilität: Bevorzugt echte Config-Faktoren, schützt vor Abstürzen

export class ClockRenderer {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private images: any;
    private config: any;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imageManager: any, config: any = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.images = imageManager?.images || imageManager;

        // Versuche die Config aus allen denkbaren Quellen zu lesen
        this.config = config || imageManager?.config || (window as any).AstroConfig || {};
    }

    withContext(fn: () => void): void {
        this.ctx.save(); fn(); this.ctx.restore();
    }

    drawClock(state: any): void {
        const ctx = this.ctx; const c = this.canvas;
        ctx.clearRect(0, 0, c.width, c.height);

        const center = { x: c.width / 2, y: c.height / 2 };
        const rLarge = c.width * 0.37;
        const rOuter = c.width * 0.37 * 1.12;
        const rSmall = c.width * 0.32, rMoon = (rLarge + rSmall) / 2;

        const parseAngle = (val: any) => (typeof val === 'number' && !isNaN(val)) ? val : 0;

        const angleZodiac = parseAngle(state.angleZodiac);
        const bgInitialAngle = parseAngle(state.bgInitialAngle);
        const combinedAngle = angleZodiac + bgInitialAngle;
        const angleSun = parseAngle(state.angleSun);
        const angleMoon = parseAngle(state.angleMoon);
        const moonAge = parseAngle(state.mondAlter);

        if (state.showCalendarDisk) {
            this.drawCalendarDisk(center, rOuter, parseAngle(state.angleCalendarDisk), state);
        } else {
            this.fillRingBetween(rLarge * 1.005, rOuter, '#6d87a5', center);
            this.drawGoldenRings(rLarge * 1.005, rOuter, center);
            this.draw24HourDial(rLarge, center);
            this.drawBackgroundImage(rLarge, combinedAngle, center);
            this.drawZodiacSigns(rSmall, combinedAngle, center);
            this.drawPointer(angleSun, 0, rLarge * 0.96, 'gold', center);
            this.drawSun(rLarge, angleSun, center);
            this.drawMoon(rMoon, angleMoon, moonAge, center);
            this.drawPointer(angleMoon, 0, rMoon * 0.95, 'gold', center);
            this.drawHeilandImage(center);
        }
    }

    _drawRadialAsset(center: { x: number, y: number }, angle: number, radius: number, image: HTMLImageElement | null, size: number, fallbackFn: any = null): void {
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

    fillRingBetween(rInner: number, rOuter: number, color: string, center: { x: number, y: number }): void {
        const ctx = this.ctx;
        const twoPi = this.config?.TWO_PI ?? (Math.PI * 2);
        this.withContext(() => {
            ctx.translate(center.x, center.y);
            ctx.beginPath();
            ctx.arc(0, 0, rOuter, 0, twoPi, false);
            ctx.arc(0, 0, rInner, 0, twoPi, true);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        });
    }

    drawGoldenRings(rInner: number, rOuter: number, center: { x: number, y: number }): void {
        const ctx = this.ctx;
        const twoPi = this.config?.TWO_PI ?? (Math.PI * 2);
        this.withContext(() => {
            ctx.translate(center.x, center.y);
            ctx.strokeStyle = 'gold';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, rOuter, 0, twoPi); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, rInner, 0, twoPi); ctx.stroke();
        });
    }

    draw24HourDial(rOuter: number, center: { x: number, y: number }): void {
        const ctx = this.ctx;
        const img = this.images?.zifferring;
        const size = rOuter * 2 * 1.2;

        if (img && img.complete && img.naturalWidth > 0) {
            this.withContext(() => {
                ctx.translate(center.x, center.y);
                ctx.drawImage(img, -size / 2, -size / 2, size, size);
            });
        } else {
            this.withContext(() => {
                ctx.translate(center.x, center.y);
                ctx.fillStyle = 'gold';
                const pi = this.config?.PI ?? Math.PI;
                const halfPi = this.config?.HALF_PI ?? (Math.PI / 2);
                const romanNumerals = this.config?.romanNumerals || ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                for (let h = 1; h <= 24; h++) {
                    const a = (h * 15 - 105) * pi / 180;
                    const r = rOuter * 1.05;
                    const x = Math.cos(a) * r, y = Math.sin(a) * r;

                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(a + halfPi);
                    ctx.font = `${Math.floor(this.canvas.width * 0.035)}px sans-serif`;
                    ctx.fillText(romanNumerals[(h - 1) % 12], 0, 0);
                    ctx.restore();
                }
            });
        }
    }

    drawDisk(radius: number, angle: number, color: string, center: { x: number, y: number }): void {
        const ctx = this.ctx;
        const twoPi = this.config?.TWO_PI ?? (Math.PI * 2);
        this.withContext(() => {
            ctx.translate(center.x, center.y);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, twoPi);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }

    drawBackgroundImage(radius: number, rotationAngle: number, center: { x: number, y: number }): void {
        const ctx = this.ctx;
        const img = this.images?.bg;
        const fallbackColor = '#12283b';

        if (img && img.complete && img.naturalWidth > 0) {
            this.withContext(() => {
                ctx.translate(center.x, center.y);
                ctx.rotate(rotationAngle);
                const size = radius * 2;
                ctx.drawImage(img, -size / 2, -size / 2, size, size);
            });
        } else {
            this.drawDisk(radius, 0, fallbackColor, center);
            this.drawStarsOnBlueDiskEdge(radius - 5, rotationAngle);
        }
    }

    drawStar(cx: number, cy: number, points: number, outerRadius: number, innerRadius: number, color: string): void {
        const ctx = this.ctx;
        const pi = this.config?.PI ?? Math.PI;

        ctx.save();
        ctx.beginPath();
        ctx.translate(cx, cy);
        ctx.moveTo(0, -outerRadius);

        for (let i = 0; i < points * 2; i++) {
            const angle = (i * pi) / points;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.sin(angle) * r;
            const y = -Math.cos(angle) * r;
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawStarsOnBlueDiskEdge(radius: number, rotationAngle: number): void {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const twoPi = this.config?.TWO_PI ?? (Math.PI * 2);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotationAngle);
        const numStars = 96;
        const starOuterRadius = radius * 0.015;
        const starInnerRadius = starOuterRadius * 0.5;
        const r = radius - starOuterRadius;

        for (let i = 0; i < numStars; i++) {
            const angle = (i * twoPi) / numStars;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            const numPoints = (i + 1) % 4 === 0 ? 8 : 4;
            this.drawStar(x, y, numPoints, starOuterRadius, starInnerRadius, "gold");
        }

        ctx.restore();
    }

    drawCalendarDisk(center: { x: number, y: number }, maxRadius: number, rotationAngle: number, state: any): void {
        const ctx = this.ctx;
        const img = this.images?.calendarDisk;
        const twoPi = this.config?.TWO_PI ?? (Math.PI * 2);

        const zoomFactor = state.calendarZoom || 1.5;
        const radius = maxRadius * zoomFactor;

        if (img && img.complete && img.naturalWidth > 0) {
            this.withContext(() => {
                ctx.translate(center.x, center.y);
                ctx.rotate(rotationAngle);
                const size = radius * 2 * 0.99;
                ctx.globalAlpha = 1.0;
                ctx.drawImage(img, -size / 2, -size / 2, size, size);
            });
        } else {
            this.withContext(() => {
                ctx.translate(center.x, center.y);
                ctx.beginPath();
                ctx.arc(0, 0, maxRadius * 0.99, 0, twoPi);
                ctx.fillStyle = '#1e3a5f';
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '20px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Kalenderscheibe nicht geladen (Kalenderscheibe.png)', 0, 0);
            });
        }
    }

    drawPointer(angle: number, start: number, end: number, color: string, center: { x: number; y: number }): void {
        const ctx = this.ctx;
        this.withContext(() => {
            ctx.translate(center.x, center.y);
            ctx.rotate(angle);
            const length = end - start;
            if (this.images?.pointer && this.images.pointer.complete && this.images.pointer.naturalWidth > 0) {
                const imgH = this.canvas.width * 0.06;
                ctx.drawImage(this.images.pointer, start, -imgH / 2, length, imgH);
            } else {
                ctx.beginPath();
                ctx.moveTo(start, 0);
                ctx.lineTo(end, 0);
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });
    }

    drawSun(radius: number, angle: number, center: { x: number, y: number }): void {
        const size = this.canvas.width * 0.05;

        const fallbackFn = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, config: any) => {
            const twoPi = config?.TWO_PI ?? (Math.PI * 2);
            ctx.beginPath();
            ctx.fillStyle = 'gold';
            ctx.arc(x, y, s / 2, 0, twoPi);
            ctx.fill();
        };

        this._drawRadialAsset(
            center,
            angle,
            radius - size / 2,
            this.images?.sun,
            size,
            fallbackFn
        );
    }

    drawMoon(radius: number, angle: number, days: number, center: { x: number, y: number }): void {
        const ctx = this.ctx;
        const dynamicMoonHeight = this.canvas.width * 0.04;
        const aspect = this.config?.moonDimensions?.aspectRatio ?? 1.0;
        const dynamicMoonWidth = dynamicMoonHeight * aspect;
        const halfPi = this.config?.HALF_PI ?? (Math.PI / 2);

        const getMoonPhaseSymbol = (d: number) => {
            const totalDays = 29.5;
            const normalizedDays = (d - 1 + totalDays) % totalDays;
            const phaseIndex = Math.floor(normalizedDays / (totalDays / 8));
            const symbols = ['🌘', '🌗', '🌖', '🌕', '🌔', '🌓', '🌒', '🌑'];
            return symbols[phaseIndex];
        };

        this.withContext(() => {
            ctx.translate(center.x, center.y);
            ctx.rotate(angle);
            const x = radius, y = 0;

            let img = null;
            if (this.images?.moonPhases && this.images.moonPhases.length > 0) {
                // Konvertiert potenzielle Floats zu validen Integer-Indizes
                const idx = Math.max(0, Math.min(Math.floor(days) - 1, this.images.moonPhases.length - 1));
                img = this.images.moonPhases[idx];
            }

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(halfPi);

            if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, -dynamicMoonWidth / 2, -dynamicMoonHeight / 2, dynamicMoonWidth, dynamicMoonHeight);
            } else {
                const moonSymbol = getMoonPhaseSymbol(days);
                const fontSize = dynamicMoonHeight * 1.5;
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'silver';
                ctx.fillText(moonSymbol, 0, 0);
            }

            ctx.restore();
        });
    }

    drawHeilandImage(center: { x: number, y: number }): void {
        const size = this.canvas.width * 0.29;

        const fallbackFn = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, config: any) => {
            const twoPi = config?.TWO_PI ?? (Math.PI * 2);
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.arc(x, y, s / 2, 0, twoPi);
            ctx.fill();
        };

        this._drawRadialAsset(
            center,
            0,
            0,
            this.images?.heiland,
            size,
            fallbackFn
        );
    }

    drawZodiacSigns(radius: number, rotationAngle: number, center: { x: number, y: number }): void {
        const ctx = this.ctx;
        this.withContext(() => {
            ctx.translate(center.x, center.y);
            ctx.rotate(rotationAngle);

            // Sicheres Extrahieren der zodiacData oder Fallback-Struktur, falls die Config unvollständig ist
            const zodiacData = this.config?.zodiacData || this._getFallbackZodiacData();
            const baseFontSize = this.canvas.width * 0.02;

            // Wenn der Radius falsch zur Sternscheibe wirkt, passe diesen Offset an:
            const rBase = radius - radius * 0.2;

            const loadedNames = Object.keys(this.images?.zodiac || {});
            const namesToUse = loadedNames.length === 12 ? loadedNames : zodiacData.names;

            for (const name of namesToUse) {
                const angle = zodiacData.angles?.[name] || 0;

                const img = this.images?.zodiac?.[name];

                // 🔥 HIER STEHT JETZT DER KORREKTE LIVE-ABGLEICH:
                // Wenn zodiacData.scaleFactors existiert, lies es aus! Falls nicht, nutze 4.5 als sicheren Standard.
                const ratioScale = zodiacData.scaleFactors?.[name] ?? 4.5;
                const radialOffsetFactor = zodiacData.radialOffsets?.[name] ?? 0.0;

                const rPos = rBase + (radius * radialOffsetFactor);
                const x = Math.cos(angle) * rPos;
                const y = Math.sin(angle) * rPos;
                const size = baseFontSize * ratioScale;

                ctx.save();
                ctx.translate(x, y);

                // Rotation korrigieren:
                ctx.rotate(-rotationAngle);

                if (img && img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, -size / 2, -size / 2, size, size);
                } else if (zodiacData.symbols?.[name]) {
                    ctx.font = `${size}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'white';
                    ctx.fillText(zodiacData.symbols[name], 0, 0);
                }

                ctx.restore();
            }
        });
    }

   public calculateResponsiveSize(availableWidth: number, availableHeight: number): number {
       // 1. Berechne die Zielgröße basierend auf dem kleineren Wert des Containers
       const size = Math.min(availableWidth, availableHeight);

       // 2. Setze eine interne Auflösung, die das CSS-Layout unterstützt
       // (Wir nehmen 1000 als festen Wert für scharfes Rendering)
       const resolution = 1000;

       // 3. Setze das interne Pixel-Raster des Canvas
       this.canvas.width = resolution;
       this.canvas.height = resolution;

       return resolution;
   }

    // Liefert eine mathematisch valide Struktur, falls zodiacData unvollständig eingereicht wird
    private _getFallbackZodiacData(): any {
        const names = ['widder', 'stier', 'zwilling', 'krebs', 'loewe', 'jungfrau', 'waage', 'skorpion', 'schuetze', 'steinbock', 'wassermann', 'fische'];
        const angles: any = {};
        const symbols: any = {};
        names.forEach((name, idx) => {
            angles[name] = ((idx * 30 - 105) * Math.PI) / 180;
            symbols[name] = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'][idx];
        });
        return { names, angles, symbols, scaleFactors: {}, radialOffsets: {} };
    }
}
