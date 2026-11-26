// src/app/core/services/model3d-state.service.ts
import { Injectable, signal } from '@angular/core';
import { ViewKey, alsOrtszeitText, ausOrtszeit } from '../../features/model3d/clock-math';

/**
 * Gemeinsamer Zustand des 3D-Funktionsmodells: Das Bedienfeld sitzt in der
 * Sidebar (app-controls), das 3D-Bild im blauen Rahmen der Uhr (app-canvas).
 * Bewusst ohne three.js-Import, damit die Bibliothek erst beim Öffnen lädt.
 */
@Injectable({ providedIn: 'root' })
export class Model3dStateService {
  /** true, solange statt Uhr und Menü das 3D-Modell angezeigt wird */
  readonly active = signal(false);

  /** Simulierte Zeit (ms, UTC) – wird vom 3D-Bild pro Frame fortgeschrieben */
  simT = Date.now();
  /** true, solange der Nutzer im Eingabefeld „Uhr stellen“ tippt */
  editingWhen = false;

  readonly playing = signal(true);
  readonly speed = signal(
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 600,
  );
  readonly glass = signal(false);
  readonly heil = signal(true);
  readonly tags = signal(true);
  /** Gewünschte Kameraansicht; seq sorgt dafür, dass auch dieselbe Ansicht erneut angefahren wird */
  readonly view = signal<{ key: ViewKey; seq: number }>({ key: 'start', seq: 0 });

  /** Wert des Feldes „Uhr stellen“ (Lübecker Ortszeit, im Sommer MESZ) */
  readonly whenText = signal('');

  open(start: Date): void {
    this.simT = start.getTime();
    this.playing.set(true);
    this.view.set({ key: 'start', seq: 0 });
    this.syncWhen();
    this.active.set(true);
  }

  close(): void {
    this.active.set(false);
  }

  setView(key: ViewKey): void {
    this.view.update((v) => ({ key, seq: v.seq + 1 }));
  }

  now(): void {
    this.simT = Date.now();
    this.syncWhen();
  }

  /** Wert aus dem Feld „Uhr stellen“ (Lübecker Ortszeit) übernehmen */
  setWhen(value: string): void {
    const m = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+)/.exec(value);
    if (!m) return;
    this.simT = ausOrtszeit(+m[1], +m[2], +m[3], +m[4], +m[5]);
  }

  /** Feld „Uhr stellen“ auf die simulierte Zeit (Lübecker Ortszeit) setzen */
  syncWhen(): void {
    this.whenText.set(alsOrtszeitText(this.simT));
  }
}
