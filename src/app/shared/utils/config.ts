export const AstroConfig = {

    // ─────────────────────────────────────────────────────────────────
    // ÜBERSETZUNGSVERHÄLTNISSE — bestätigt durch Paul Behrens' eigene
    // Rechnung zum Räderwerk (siehe Kapitel "Berechnung des Planetariums",
    // Original-Uhrenbeschreibung Seite 18/19).
    // ─────────────────────────────────────────────────────────────────

    // Sonne:Tierkreis. Behrens nutzt die exakte Bruchzahl 365¼:366¼
    // (statt der alten, ungenauen Uhr, die nur 365:366 verwendete).
    // Umgesetzt über die Zahnräder 293/60 (Sonnenseite) und 487/36
    // (Tierkreisseite) — daraus ergibt sich exakt dieses Verhältnis.
    ZODIAC_TO_SUN_RATIO: 366.25 / 365.25,

    // Mond:Sonne. Behrens leitet dies NICHT aus der groben Näherung
    // "Mond braucht 29½ Tage" ab, sondern aus dem 19-jährigen
    // Mondzyklus (Goldene Zahl): in 19 Jahren wiederholen sich die
    // Mondphasen exakt 235-mal.
    //   19 × 365,25 Tage = 6939,75 Tage
    //   6939,75 − 235 = 6704,75  →  aufgerundet: 6940 : 6705
    // Umgesetzt über die Zahnräder 298/347 (Sonnenseite) und 40/45
    // (Tierkreisseite). Diese Konstante war im Code bereits korrekt
    // hinterlegt, hatte aber keine Herleitung — jetzt dokumentiert.
    MOON_TO_SUN_RATIO: 6705 / 6940,

    // ─────────────────────────────────────────────────────────────────
    // ⚠️ KORREKTUR: Echte Länge des synodischen Monats (Neumond zu
    // Neumond), abgeleitet aus Behrens' eigener 19-Jahres-Rechnung
    // (19 × 365,25 Tage ÷ 235 Mondphasen ≈ 29,530851 Tage).
    //
    // Vorher stand hier "30" — eine grobe Vereinfachung, die pro Zyklus
    // ca. 0,47 Tage zu lang ist. Über den von der App abgedeckten
    // Zeitraum (1911–2080, ca. 2.090 Zyklen) summiert sich das zu
    // Wochen an Abweichung. Behrens' Wert weicht vom astronomisch
    // exakten Mittelwert (29,530589 Tage) dagegen nur um ~17 Sekunden
    // ab — praktisch perfekt.
    //
    // WICHTIG: Es bleiben weiterhin 30 Mondphasen-Bilder (0..29) im
    // Ordner assets/images/mondphasen/ — die Anzahl der Bilder ändert
    // sich nicht, nur die Zykluslänge, über die sie verteilt werden.
    // ─────────────────────────────────────────────────────────────────
    MOON_CYCLE_DAYS: (19 * 365.25) / 235, // ≈ 29.530851063829787

    SPEED_FACTOR: 0.01,

    REFERENCE_FULL_MOON: new Date('2025-11-05T13:19:00Z'),

    // ⚠️ KORREKTUR: Der Referenzzeitpunkt ist ein VOLLMOND, also die
    // Mitte des Zyklus. Vorher stand hier der fixe Wert "15"
    // (ungefähre Mitte von 30). Jetzt wird die Zyklusmitte direkt aus
    // der korrigierten Zykluslänge berechnet, damit beide Werte immer
    // zueinander passen, auch falls MOON_CYCLE_DAYS sich künftig noch
    // einmal ändert.
    REFERENCE_AGE_OFFSET: ((19 * 365.25) / 235) / 2, // ≈ 14.765425...

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
            widder: -Math.PI / 2 - (36.7 / 2 + 27.9 + 20.1 + 35.7 + 44.1 + 23.0 + 6.7 + 18.6 + 33.4 + 27.9 + 24.2 + 37.2 / 2) * Math.PI / 180 + (-1.5 * Math.PI / 180),
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
        scaleFactors: {
            zwilling: 7, stier: 10, widder: 6, fische: 10, wassermann: 9,
            steinbock: 6, schuetze: 6, skorpion: 0.01, waage: 8, jungfrau: 7.5,
            loewe: 8, krebs: 6, schlangentraeger: 6
        },
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
