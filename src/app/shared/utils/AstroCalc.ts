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
    const tmp = new Date(date.getTime());
    tmp.setHours(12, 0, 0, 0);
    const start = new Date(tmp.getFullYear(), 0, 1);
    start.setHours(12, 0, 0, 0);
    // ✅ In ts/js müssen Date-Objekt-Differenzen explizit gecastet werden
    const diff = (tmp as any) - (start as any);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
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

export function calculateSunAngle(simDate: Date): number {
    ensureConfig();
    const h = simDate.getHours();
    const m = simDate.getMinutes();
    const frac = (h + m / 60) / 24;
    return frac * CONFIG.TWO_PI - CONFIG.THREE_QUARTERS_PI;
}

export function calculateMoonAngle(sunAngle: number, moonDiffRad: number): number {
    return sunAngle + moonDiffRad;
}

export function calculateCalendarDiskAngle(simDate: Date): number {
    ensureConfig();
    const year = simDate.getFullYear();
    const dayOfYear = getDayOfYear(simDate);
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const fracOfYear = (dayOfYear - 1) / daysInYear;
    return fracOfYear * CONFIG.TWO_PI;
}
