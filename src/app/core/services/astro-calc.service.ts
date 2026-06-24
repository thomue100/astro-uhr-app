import { Injectable, inject } from '@angular/core';
import { ASTRO_CONFIG } from '../tokens/astro-config.token';

@Injectable({ providedIn: 'root' })
export class AstroCalcService {
  // inject() statt Constructor-Parameter — modernes Angular-Pattern
  private readonly config = inject(ASTRO_CONFIG);

  normalizeAngle(angle: number): number {
    return (angle % this.config.TWO_PI + this.config.TWO_PI) % this.config.TWO_PI;
  }

  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  calculateSunAngle(simDate: Date): number {
    const h = simDate.getHours();
    const m = simDate.getMinutes();
    const frac = (h + m / 60) / 24;
    return frac * this.config.TWO_PI - this.config.THREE_QUARTERS_PI;
  }

  calculateMoonAgeFromDate(targetDate: Date): number {
    const diffMs = targetDate.getTime() - this.config.REFERENCE_FULL_MOON.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    let age = (this.config.REFERENCE_AGE_OFFSET + diffDays) % this.config.MOON_CYCLE_DAYS;
    return age < 0 ? age + this.config.MOON_CYCLE_DAYS : age;
  }

  calculateMoonRotationDifference(targetDate: Date): number {
    const diffMs = targetDate.getTime() - this.config.REFERENCE_FULL_MOON.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const extraRotation =
      (diffHours / 24) * this.config.TWO_PI * (this.config.MOON_TO_SUN_RATIO - 1);
    return this.normalizeAngle(this.config.REFERENCE_MOON_OFFSET + extraRotation);
  }

  getDayOfYear(date: Date): number {
    const tmp = new Date(date.getTime());
    tmp.setHours(12, 0, 0, 0);
    const start = new Date(tmp.getFullYear(), 0, 1);
    start.setHours(12, 0, 0, 0);
    return Math.floor(((tmp as any) - (start as any)) / (1000 * 60 * 60 * 24)) + 1;
  }

  calculateMoonAngle(sunAngle: number, moonDiffRad: number): number {
    return sunAngle + moonDiffRad;
  }

  calculateZodiacOffsetAngle(simDate: Date, angleSun: number): number {
    const ref = new Date(`${simDate.getFullYear()}-06-02T00:00:00`);
    const dayDiff = this.getDayOfYear(simDate) - this.getDayOfYear(ref);
    const daysInYear = this.isLeapYear(simDate.getFullYear()) ? 366 : 365;
    return (dayDiff / daysInYear) * this.config.TWO_PI + angleSun + this.config.HALF_PI;
  }

  calculateCalendarDiskAngle(simDate: Date): number {
    const year = simDate.getFullYear();
    const dayOfYear = this.getDayOfYear(simDate);
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    return ((dayOfYear - 1) / daysInYear) * this.config.TWO_PI;
  }
}
