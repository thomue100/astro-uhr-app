// AstroCalc.ts — reine numerische/astronomische Berechnungen (konfigurierbar)

// Minimalinvasiver Typ für die Konfiguration
let CONFIG: any = null;

/**
 * Konfiguriert AstroCalc mit Projektkonstanten (z.B. TWO_PI, MOON_CYCLE_DAYS, REFERENCE_FULL_MOON, ...)
 * @param {object} config
 */
export function configureAstroCalc(config: any): void {
    CONFIG = config;
}

function ensureConfig(): void {
    if (!CONFIG) throw new Error('AstroCalc: CONFIG nicht konfiguriert. Rufe configureAstroCalc(config) auf.');
}

export function normalizeAngle(angle: number): number {
    ensureConfig();
    return (angle % CONFIG.TWO_PI + CONFIG.TWO_PI) % CONFIG.TWO_PI;
}

export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function calculateMoonAgeFromDate(targetDate: Date): any {
    ensureConfig();
    const refDate = CONFIG.REFERENCE_FULL_MOON;
    const diffMs = targetDate.getTime() - refDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const cycle = CONFIG.MOON_CYCLE_DAYS;
    let totalDays = CONFIG.REFERENCE_AGE_OFFSET + diffDays;
    let age = totalDays % cycle;
    if (age < 0) age += cycle;
    return age;
}

export function calculateMoonRotationDifference(targetDate: Date): number {
    ensureConfig();
    const refDate = CONFIG.REFERENCE_FULL_MOON;
    const diffMs = targetDate.getTime() - refDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const extraRotationFactor = CONFIG.MOON_TO_SUN_RATIO - 1;
    const extraRotation = (diffHours / 24) * CONFIG.TWO_PI * extraRotationFactor;
    let totalMoonDiff = CONFIG.REFERENCE_MOON_OFFSET + extraRotation;
    return normalizeAngle(totalMoonDiff);
}

export function getDayOfYear(date: Date): number {
    // Kalenderdatum (lokal) über UTC vergleichen: Mit lokalen Zeitstempeln
    // fehlte ab der Sommerzeitumstellung eine Stunde, Math.floor lieferte dann
    // vom 29. März bis Ende Oktober einen Tag zu wenig.
    const day   = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const start = Date.UTC(date.getFullYear(), 0, 1);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.round((day - start) / oneDay) + 1;
}

export function calculateZodiacOffsetAngle(simDate: Date, angleSun: number): number {
    ensureConfig();
    const ref = new Date(`${simDate.getFullYear()}-06-02T00:00:00`);
    let dayDiff = getDayOfYear(simDate) - getDayOfYear(ref);
    const y = simDate.getFullYear();
    const isLeap = isLeapYear(y);
    const daysInYear = isLeap ? 366 : 365;
    const zodiacDayOffset = (dayDiff / daysInYear) * CONFIG.TWO_PI;
    return zodiacDayOffset + angleSun + CONFIG.HALF_PI;
}

// Wiederverwendbarer Formatter: EINMAL erstellt, nicht bei jedem Funktionsaufruf.
// Wichtig für die Zeitraffer-Animation, die diese Funktion viele Male pro
// Sekunde aufruft - ein neu erzeugter Intl.DateTimeFormat pro Aufruf wäre
// unnötig teuer.
const luebeckTimeFormatter = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23', // erzwingt "00".."23", nie "24:00"
});

export function calculateSunAngle(simDate: Date): number {
    ensureConfig();

    // Fix: Die Uhrzeit wird fest für "Europe/Berlin" (Standort der echten
    // Uhr in Lübeck) ausgelesen - unabhängig von der Zeitzone, die auf dem
    // Gerät der/des Betrachtenden eingestellt ist.
    //
    // Das gilt bewusst SOWOHL für die "aktuelle Zeit" (live) als auch für
    // die manuelle Zeitreise-Simulation: Im Simulationsmodus ändert sich
    // dadurch nichts Sichtbares (niemand vergleicht mit einer externen
    // Referenz), im Live-Modus verhindert es aber genau den Fall, dass
    // jemand direkt vor der echten Uhr in Lübeck steht, sein Handy auf
    // einer fremden Zeitzone hat, und dadurch eine Abweichung zwischen
    // Simulation und echter Uhr sieht.
    const parts = luebeckTimeFormatter.formatToParts(simDate);

    const h = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
    const m = Number(parts.find(p => p.type === 'minute')?.value ?? 0);

    const frac = (h + m / 60) / 24;
    return frac * CONFIG.TWO_PI - CONFIG.THREE_QUARTERS_PI;
}

export function calculateMoonAngle(sunAngle: number, moonDiffRad: number): number {
    return sunAngle + moonDiffRad;
}

/**
 * Berechnet den Rotationswinkel der Kalenderscheibe so, dass der aktuelle Tag
 * auf der 9-Uhr-Position (links) angezeigt wird.
 *
 * Referenz: Auf dem physischen Bild liegt der 2. Juni auf der 9-Uhr-Position.
 * 9-Uhr-Position entspricht im Canvas-Koordinatensystem dem Winkel -π/2.
 *
 * Die Scheibe dreht sich mit fortschreitenden Tagen gegen den Uhrzeigersinn
 * (da höhere Tage des Jahres einen kleineren Winkel erhalten sollen, damit
 * der aktuelle Tag immer bei -π/2 erscheint).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FEINEINSTELLUNG: Falls die Scheibe nach einer Bildänderung erneut versetzt
 * erscheint, passe den Wert CALENDAR_DISK_OFFSET unten an:
 *   - Scheibe dreht sich zu weit im Uhrzeigersinn  → Wert verkleinern (Richtung 0)
 *   - Scheibe dreht sich zu weit gegen den UZS     → Wert vergrößern (Richtung π)
 *   - Aktuelle Korrektur: +Math.PI (180°), behebt den Spiegelungsversatz des Bildes
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ↓↓↓ HIER NACHJUSTIEREN, falls die Kalenderscheibe versetzt erscheint ↓↓↓
// Entweder PI/6 (30 Grad) hinzufügen oder abziehen
const CALENDAR_DISK_OFFSET = Math.PI / 6;

/**
 * Das Foto der Kalenderscheibe ist nicht perfekt: Die Scheibe sitzt minimal
 * außermittig und ist leicht perspektivisch verzerrt, die Tage sind daher
 * nicht exakt gleichmäßig verteilt. Ohne Korrektur zeigte der Zeiger je nach
 * Jahreszeit bis zu 3 Tage zu früh.
 *
 * Gemessen am Zeiger (am 1. und 15. jedes Monats): [Tag des Jahres, Korrektur in Tagen].
 * Dazwischen wird linear interpoliert (über den Jahreswechsel hinweg).
 */
const CALENDAR_DISK_CORRECTION: ReadonlyArray<readonly [number, number]> = [
    [1, 2.7], [15, 2.5], [32, 2.0], [46, 1.5], [60, 1.0], [74, 1.4],
    [82, 1.3], [91, 1.0], [105, 0.5], [121, 0.1], [135, 0.0], [152, 0.0],
    [166, 0.0], [182, 0.4], [196, 0.8], [213, 1.1], [227, 1.5], [244, 2.0],
    [258, 2.2], [274, 2.6], [288, 3.0], [305, 3.1], [319, 3.1], [335, 3.0], [349, 3.0],
];

function calendarDiskCorrection(dayOfYear: number): number {
    const table = CALENDAR_DISK_CORRECTION;
    const n = table.length;
    for (let i = 0; i < n; i++) {
        const [d0, c0] = table[i];
        const [d1raw, c1] = table[(i + 1) % n];
        const d1 = i + 1 < n ? d1raw : d1raw + 365;
        const d = dayOfYear < table[0][0] ? dayOfYear + 365 : dayOfYear;
        if (d >= d0 && d <= d1) return c0 + ((d - d0) / (d1 - d0)) * (c1 - c0);
    }
    return 0;
}

export function calculateCalendarDiskAngle(simDate: Date): number {
    ensureConfig();

    const year = simDate.getFullYear();
    const isLeap = isLeapYear(year);
    const daysInYear = isLeap ? 366 : 365;
    const dayOfYear = getDayOfYear(simDate); // 1-basiert (1. Jan = 1)

    // Wir wollen den 1. Januar als Tag 0 für die Drehung.
    // dayOfYear - 1: 1. Jan = 0 Tage vergangen, 2. Jan = 1 Tag vergangen, etc.
    // + 0.5: Der Zeiger soll mitten auf die Tageszeile zeigen, nicht auf die
    // Grenze zwischen zwei Tagen (im Foto steht er zwischen 1. und 2. Juni).
    // Korrekturtabelle gilt für 365 Tage; im Schaltjahr ab 1. März um einen Tag versetzt.
    const tableDay = isLeap && dayOfYear > 59 ? dayOfYear - 1 : dayOfYear;
    const daysSinceJan1st = dayOfYear - 1 + 0.5 + calendarDiskCorrection(tableDay);

    // Winkelberechnung:
    // Start bei -Math.PI (9 Uhr)
    // Addition des Anteils am Jahr sorgt für Uhrzeigersinn-Drehung
    const angle = -Math.PI + (daysSinceJan1st / daysInYear) * CONFIG.TWO_PI + CALENDAR_DISK_OFFSET;

    return angle;
}
