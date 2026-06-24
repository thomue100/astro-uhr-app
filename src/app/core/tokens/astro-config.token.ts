import { InjectionToken } from '@angular/core';
import { AstroConfig } from '../../shared/utils/config';

export type AstroConfigType = typeof AstroConfig;

export const ASTRO_CONFIG = new InjectionToken<AstroConfigType>('ASTRO_CONFIG', {
  providedIn: 'root',
  factory: () => AstroConfig,
});
