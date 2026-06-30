// src/app/shared/pipes/translate.pipe.ts
import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

/**
 * Verwendung im Template:
 *   {{ 'nav.intro' | translate }}
 *   {{ 'luebeck_rule.uniform' | translate : { year: '2026', sb: 'D' } }}
 *
 * Die Pipe ist 'pure: false', damit sie neu ausgewertet wird wenn die
 * Sprache wechselt (auch ohne Änderung am Eingabe-Argument).
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,   // wichtig: reagiert auf Sprachwechsel
})
export class TranslatePipe implements PipeTransform {
  private readonly t = inject(TranslationService);

  transform(key: string, values?: Record<string, string>): string {
    return this.t.translate(key, values);
  }
}
