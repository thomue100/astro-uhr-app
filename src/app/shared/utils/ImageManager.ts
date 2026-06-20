// ImageManager.ts — verwaltet Laden und Bereitstellen aller Bilder

export interface ZodiacData {
    names: string[];
}

export class ImageManager {
    public images: {
        sun: HTMLImageElement;
        pointer: HTMLImageElement;
        zifferring: HTMLImageElement;
        bg: HTMLImageElement;
        calendarDisk: HTMLImageElement;
        heiland: HTMLImageElement;
        zodiac: { [key: string]: HTMLImageElement };
        moonPhases: HTMLImageElement[];
    };

    private allImagesArray: HTMLImageElement[] = [];

    constructor(zodiacData: ZodiacData, moonCycleDays: number) {
        this.images = {
            sun: new Image(),
            pointer: new Image(),
            zifferring: new Image(),
            bg: new Image(),
            calendarDisk: new Image(),
            heiland: new Image(),
            zodiac: {},
            moonPhases: []
        };

        // 1. Ordner: zeiger
        this.images.sun.src = 'assets/images/zeiger/sonne.png';
        this.images.pointer.src = 'assets/images/zeiger/zeiger.png';

        // 2. Ordner: hintergrund
        this.images.zifferring.src = 'assets/images/hintergrund/zifferring.png';
        this.images.bg.src = 'assets/images/hintergrund/sternhimmel.png';
        this.images.calendarDisk.src = 'assets/images/hintergrund/kalenderscheibe.png';
        this.images.heiland.src = 'assets/images/hintergrund/heiland.png';

        this.images.calendarDisk.onerror = () => console.warn('kalenderscheibe.png konnte nicht geladen werden.');

        // 3. Ordner: tierkreiszeichen
        if (zodiacData && Array.isArray(zodiacData.names)) {
            zodiacData.names.forEach(name => {
                const img = new Image();
                img.src = `assets/images/tierkreiszeichen/${name}.png`;
                img.onerror = () => console.warn(`Zodiac img missing in assets: ${name}`);
                this.images.zodiac[name] = img;
            });
        }

        // 4. Ordner: mondphasen
        this.images.moonPhases = Array.from({ length: moonCycleDays }, (_, i) => {
            const img = new Image();
            img.src = `assets/images/mondphasen/mond_${String(i + 1).padStart(2, '0')}.png`;
            return img;
        });

        // Alle Bilder für das Preloading sammeln
        this.allImagesArray = [
            this.images.sun,
            this.images.pointer,
            this.images.zifferring,
            this.images.bg,
            this.images.calendarDisk,
            this.images.heiland,
            ...this.images.moonPhases,
            ...Object.values(this.images.zodiac)
        ];
    }

    /**
     * Lädt alle Bilder vorab und meldet Vollzug, sobald alle fertig geladen (oder fehlerhaft) sind.
     */
    public preloadImages(): Promise<void[]> {
        return Promise.all(
            this.allImagesArray.map(img => {
                return new Promise<void>((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = () => resolve();
                        img.onerror = () => {
                            // Fehler abfangen, damit die App nicht einfriert, falls ein Bild fehlt
                            resolve();
                        };
                    }
                });
            })
        );
    }
}
