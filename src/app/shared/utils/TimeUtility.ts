// Ausgelagerte TimeUtility-Klasse (Daten, Formatierung, DOM‑Helfer)
// Numerische Logik ist an AstroCalc ausgelagert.

import {
    configureAstroCalc,
    normalizeAngle,
    isLeapYear as astroIsLeapYear,
    calculateMoonAgeFromDate,
    calculateMoonRotationDifference,
    getDayOfYear,
    calculateZodiacOffsetAngle,
    calculateSunAngle,
    calculateMoonAngle,
    calculateCalendarDiskAngle
} from './AstroCalc';

let CONFIG: any = null;
let DOM_REF: any = null;

/**
 * Injektions-Funktion — muss nach Import aufgerufen werden.
 * @param {object} config - AstroConfig
 * @param {object} dom - DOM-Referenzen
 */
export function configureTimeUtility(config: any, dom: any): void {
    CONFIG = config;
    DOM_REF = dom;
    // AstroCalc ebenfalls konfigurieren
    configureAstroCalc(config);
}

export class TimeUtility {

    // ✅ Statische Eigenschaften müssen in TypeScript explizit typisiert deklariert werden
    static DailyCalendarData: any = {};
    static CalendarData: any = {};
    static EclipseData: any = {};

    static normalizeAngle(angle: number): number {
        return normalizeAngle(angle);
    }

    /**
     * Prüft, ob ein Jahr ein Schaltjahr ist (Gregorianischer Kalender).
     * @param {number} year
     * @returns {boolean}
     */
    static isLeapYear(year: number): boolean {
        return astroIsLeapYear(year);
    }

    static formatDateTime(date: Date): string {
        return date.toLocaleString("de-DE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    // Formatierung für das Kalender-Datum
    static formatDateForInput(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    static updateLiveDateTime(state: any): void {
        if (!DOM_REF || !DOM_REF.liveDateTime) return;
        DOM_REF.liveDateTime.textContent = TimeUtility.formatDateTime(state.simDate);
    }

    static calculateMoonAgeFromDate(targetDate: Date): any {
        return calculateMoonAgeFromDate(targetDate);
    }

    static calculateMoonRotationDifference(targetDate: Date): number {
        return calculateMoonRotationDifference(targetDate);
    }

    static getDayOfYear(date: Date): number {
        return getDayOfYear(date);
    }

    /**
     * Ruft Tagesbuchstabe und Tagesheiligen ab.
     * Unterstützt keyed-Objekt (z.B. {"01. Jan": {...}}) und altes Array-Format.
     * Beachtet den Schalttag am 29. Februar.
     * @param {Date} date
     * @returns {object|null} { letter: string, saint: string }
     */
    static getDailyCalendarInfo(date: Date): any {
        // Neues Format: keyed-Objekt mit deutschen Monatskürzeln wie "01. Jan"
        const day = String(date.getDate()).padStart(2, '0');
        const monthShortMap = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
        const monthKey = monthShortMap[date.getMonth()] || date.toLocaleString('de-DE', { month: 'short' });
        const key = `${day}. ${monthKey}`;

        if (TimeUtility.DailyCalendarData && typeof TimeUtility.DailyCalendarData === 'object' && (TimeUtility.DailyCalendarData as any)[key]) {
            return (TimeUtility.DailyCalendarData as any)[key];
        }

        // Spezieller Fall: 29. Feb in Nicht-Schaltjahr
        if (key === '29. Feb' && !TimeUtility.isLeapYear(date.getFullYear())) {
            return { letter: 'N/A', saint: 'Kein 29. Februar' };
        }

        return { letter: 'N/A', saint: 'Kalenderdaten nicht vorhanden' };
    }

    static calculateZodiacOffsetAngle(simDate: Date, angleSun: number): number {
        return calculateZodiacOffsetAngle(simDate, angleSun);
    }

    static calculateSunAngle(simDate: Date): number {
        return calculateSunAngle(simDate);
    }

    static calculateMoonAngle(sunAngle: number, moonDiffRad: number): number {
        return calculateMoonAngle(sunAngle, moonDiffRad);
    }

    static getCalendarInfo(year: number): any {
        const yearStr = year.toString();
        if (year >= 1911 && year <= 2080 && TimeUtility.CalendarData && (TimeUtility.CalendarData as any)[yearStr]) {
            return (TimeUtility.CalendarData as any)[yearStr];
        }
        return null;
    }

    static getDayOfWeekString(date: Date): string {
        const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
        return weekdays[date.getDay()];
    }

    static getEclipseInfo(year: number): any[] {
        if (year >= 1911 && year <= 2080 && TimeUtility.EclipseData && (TimeUtility.EclipseData as any)[year]) {
            return (TimeUtility.EclipseData as any)[year];
        }
        return [];
    }

    static calculateCalendarDiskAngle(simDate: Date): number {
        return calculateCalendarDiskAngle(simDate);
    }
}
