// src/app/core/services/model3d-state.service.ts
import { Injectable, signal } from '@angular/core';
import { HOUR, ViewKey } from '../../features/model3d/clock-math';

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

  /** Wert des Feldes „Uhr stellen (MEZ)“ */
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

  /** Wert aus dem Feld „Uhr stellen (MEZ)“ übernehmen */
  setWhen(value: string): void {
    const m = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+)/.exec(value);
    if (!m) return;
    const d = new Date(0);
    d.setUTCFullYear(+m[1], +m[2] - 1, +m[3]);
    d.setUTCHours(+m[4], +m[5]);
    this.simT = d.getTime() - HOUR;
  }

  /** Feld „Uhr stellen“ auf die simulierte Zeit (MEZ) setzen */
  syncWhen(): void {
    const d = new Date(this.simT + HOUR), pad = (n: number) => String(n).padStart(2, '0');
    this.whenText.set(
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
    );
  }
}
