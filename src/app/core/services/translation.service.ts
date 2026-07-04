// src/app/core/services/translation.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'de' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  /**
   * Das aktuelle Sprach-Signal — wird sofort mit der erkannten
   * Browsersprache initialisiert (Fix "Sprache automatisch erkennen"),
   * damit auch ohne gespeicherte Präferenz schon die erste gerenderte
   * Ansicht in der richtigen Sprache erscheint.
   */
  readonly currentLang = signal<Language>(this._detectBrowserLanguage());

  // Die geladenen Übersetzungs-Objekte
  private translations: Record<Language, Record<string, any>> = {
    de: {},
    en: {},
  };

  // true solange die Sprach-JSONs noch nicht geladen sind
  private loaded = false;

  constructor(private http: HttpClient) {}

  /**
   * Lädt beide Sprach-Dateien beim App-Start.
   * Wird in app.config.ts als APP_INITIALIZER aufgerufen.
   */
  async loadAll(): Promise<void> {
    if (this.loaded) return;
    const [de, en] = await Promise.all([
      firstValueFrom(this.http.get<Record<string, any>>('i18n/de.json')),
      firstValueFrom(this.http.get<Record<string, any>>('i18n/en.json')),
    ]);
    this.translations['de'] = de;
    this.translations['en'] = en;
    this.loaded = true;

    // Eine explizite frühere Nutzerwahl hat Vorrang vor der automatischen
    // Browser-Spracherkennung. Ohne gespeicherte Wahl bleibt die bereits
    // im Konstruktor erkannte Browsersprache aktiv.
    const saved = localStorage.getItem('lang') as Language | null;
    if (saved === 'de' || saved === 'en') {
      this.currentLang.set(saved);
    }
  }

  /** Wechselt die Sprache und speichert die Wahl im localStorage */
  toggle(): void {
    const next: Language = this.currentLang() === 'de' ? 'en' : 'de';
    this.currentLang.set(next);
    localStorage.setItem('lang', next);
  }

  /**
   * Gibt den übersetzten Text für einen Punkt-notierten Schlüssel zurück.
   * Beispiel: translate('nav.intro') → 'ℹ️ Einführung' oder 'ℹ️ Introduction'
   *
   * Platzhalter {key} werden durch den values-Parameter ersetzt.
   * Beispiel: translate('luebeck_rule.uniform', { year: '2026', sb: 'D' })
   */
  translate(key: string, values?: Record<string, string>): string {
    const lang   = this.currentLang();
    const parts  = key.split('.');
    let result: any = this.translations[lang];

    for (const part of parts) {
      result = result?.[part];
      if (result === undefined) break;
    }

    if (typeof result !== 'string') {
      // Fallback: Schlüssel anzeigen wenn Text nicht gefunden
      return key;
    }

    // Platzhalter ersetzen: {year} → '2026'
    if (values) {
      return result.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`);
    }

    return result;
  }

  /**
   * Erkennt die bevorzugte Sprache des Browsers.
   * Anforderung: Deutsch -> Deutsch als Start, Englisch ODER jede andere
   * Sprache -> Englisch als Standard (kein weiteres Sprachen-Mapping nötig,
   * da die App ohnehin nur de/en anbietet).
   */
  private _detectBrowserLanguage(): Language {
    if (typeof navigator === 'undefined') return 'en';

    const candidates: readonly string[] =
      (navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language]) ?? [];

    for (const lang of candidates) {
      if (lang && lang.toLowerCase().startsWith('de')) {
        return 'de';
      }
    }
    return 'en';
  }
}
