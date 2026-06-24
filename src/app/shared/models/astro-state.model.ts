 export interface AstroState {
  angleSun: number;
  angleMoon: number;
  angleZodiac: number;
  mondAlter: number;
  mondAlterFractional: number;
  bgInitialAngle: number;
  useBackgroundImage: boolean;
  zodiacDayOffsetAngle: number;
  showCalendarDisk: boolean;
  showHeiland: boolean;
  calendarZoom: number;
  angleCalendarDisk: number;
}

export const INITIAL_ASTRO_STATE: AstroState = {
  angleSun: 0,
  angleMoon: 0,
  angleZodiac: 0,
  mondAlter: 1,
  mondAlterFractional: 0,
  bgInitialAngle: 0,
  useBackgroundImage: true,
  zodiacDayOffsetAngle: 0,
  showCalendarDisk: false,
  showHeiland: true,
  calendarZoom: 1.5,
  angleCalendarDisk: 0,
};
