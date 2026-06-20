export const AstroConfig = {
    MOON_TO_SUN_RATIO: 6705 / 6940,
    ZODIAC_TO_SUN_RATIO: 366.25 / 365.25,
    MOON_CYCLE_DAYS: 30,
    SPEED_FACTOR: 0.01,
    REFERENCE_FULL_MOON: new Date('2025-11-05T13:19:00Z'),
    REFERENCE_AGE_OFFSET: 15,
    REFERENCE_MOON_OFFSET: Math.PI,
    PI: Math.PI,
    TWO_PI: 2 * Math.PI,
    HALF_PI: Math.PI / 2,
    THREE_QUARTERS_PI: 3 * Math.PI / 2,
    moonDimensions: { height: 35, aspectRatio: 1 },
    romanNumerals: ["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"],
    zodiacData: {
        names: ["widder", "stier", "zwilling", "krebs", "loewe", "jungfrau", "waage", "skorpion", "schlangentraeger", "schuetze", "steinbock", "wassermann", "fische"],
        angles: {
            widder: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 + 18.6 + 33.4 + 27.9 + 24.2 + 37.2 + 24.7 / 2) * Math.PI / 180 + (-1.5 * Math.PI / 180),
            stier: -Math.PI / 2 + (-1 * Math.PI / 180),
            zwilling: -Math.PI / 2 - (36.7 / 2 + 27.9 / 2) * Math.PI / 180 + (-3 * Math.PI / 180),
            krebs: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 / 2) * Math.PI / 180 + (-4.3 * Math.PI / 180),
            loewe: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 / 2) * Math.PI / 180 + (-6.1 * Math.PI / 180),
            jungfrau: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 / 2) * Math.PI / 180,
            waage: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 / 2) * Math.PI / 180 + (4 * Math.PI / 180),
            skorpion: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 / 2) * Math.PI / 180 + (-12 * Math.PI / 180),
            schlangentraeger: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 + 18.6 / 2) * Math.PI / 180 + (-3 * Math.PI / 180),
            schuetze: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 + 18.6 + 33.4 / 2) * Math.PI / 180 + (-2.5 * Math.PI / 180),
            steinbock: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 + 18.6 + 33.4 + 27.9 / 2) * Math.PI / 180 + (2 * Math.PI / 180),
            wassermann: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 + 18.6 + 33.4 + 27.9 + 24.2 / 2) * Math.PI / 180,
            fische: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 + 18.6 + 33.4 + 27.9 + 24.2 + 37.2 / 2) * Math.PI / 180 + (-2.7 * Math.PI / 180),
        },
        // Skalierungsfaktoren für die Bilder
        scaleFactors: {
            zwilling: 7, stier: 10, widder: 6, fische: 10, wassermann: 9,
            steinbock: 6, schuetze: 6, skorpion: 0.01, waage: 8, jungfrau: 7.5,
            loewe: 8, krebs: 6, schlangentraeger: 6
        },
        // "-": rein, "+": raus
        radialOffsets: {
            widder: 0.03, stier: -0.085, zwilling: 0.035, krebs: 0.032, loewe: -0.085,
            jungfrau: 0.035, waage: -0.05, skorpion: 0.0, schlangentraeger: -0.07,
            schuetze: 0.03, steinbock: -0.015, wassermann: -0.05, fische: -0.08
        },
        symbols: {
            widder: "♈︎", stier: "♉︎", zwilling: "♊︎", krebs: "♋︎", loewe: "♌︎",
            jungfrau: "♍︎", waage: "♎︎", skorpion: "♏︎", schlangentraeger: "⛎︎",
            schuetze: "♐︎", steinbock: "♑︎", wassermann: "♒︎", fische: "♓︎"
            
        }
    }
 };
