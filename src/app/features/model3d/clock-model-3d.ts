// src/app/features/model3d/clock-model-3d.ts
//
// 3D-Funktionsmodell des Planetariums der Astronomischen Uhr St. Marien zu Lübeck
// nach der Räderberechnung von Paul Behrens. Portiert aus dem eigenständigen
// HTML-Prototyp; three.js kommt als lokales npm-Paket (kein CDN), die Bilder
// (Zifferring, Sternscheibe, Sternbilder, Sonne, Heiland) aus public/assets.
import * as THREE from 'three';

export const TAU = Math.PI * 2;
export const DAY = 86_400_000;

/* ---------- Rechnung der Uhr ---------- */
export const K_ZOD = (293 * 60) / (36 * 487);   // = 1465/1461 = 366¼ : 365¼
export const K_MOON = (298 * 45) / (40 * 347);  // = 6705/6940
export const SYNODIC = 1 / (1 - K_MOON);        // Tage
const T0 = Date.UTC(2025, 10, 5, 13, 19);        // Referenz-Vollmond aus der App
const SUN0 = (TAU * (14 + 19 / 60 - 12)) / 24;   // Sonnenzeiger um 14:19 MEZ, Uhrwinkel ab Mittag oben
const ZOD0 = SUN0 + (TAU * (309 - 153)) / 365;   // 5. Nov. gegen 2. Juni (Sonne mitten im Stier)
const MOON0 = SUN0 + Math.PI;                    // Vollmond: Mond steht der Sonne gegenüber

/** Schlüssel der 13 Sternbilder (i18n: model3d.signs.*) und ihre Breite auf der Scheibe in Grad */
const SIGNS: [string, number][] = [
  ['stier', 36.7], ['zwillinge', 27.9], ['krebs', 20.1], ['loewe', 35.7], ['jungfrau', 44.1],
  ['waage', 23.0], ['skorpion', 6.7], ['schlangentraeger', 18.6], ['schuetze', 33.4],
  ['steinbock', 27.9], ['wassermann', 24.2], ['fische', 37.2], ['widder', 24.7],
];
const SIGN_SUM = SIGNS.reduce((s, x) => s + x[1], 0);
SIGNS.forEach((s) => (s[1] *= 360 / SIGN_SUM));

export interface Angles { sun: number; zod: number; moon: number; }

export function angles(t: number): Angles {
  const d = (t - T0) / DAY;
  return { sun: SUN0 + TAU * d, zod: ZOD0 + TAU * d * K_ZOD, moon: MOON0 + TAU * d * K_MOON };
}

export const mod = (a: number, m: number) => ((a % m) + m) % m;

/** Schlüssel des Sternbilds, in dem der Sonnenzeiger gerade steht */
export function signOfSun(a: Angles): string {
  let u = mod(SIGNS[0][1] / 2 - ((a.sun - a.zod) * 360) / TAU, 360);
  for (const s of SIGNS) {
    if (u < s[1]) return s[0];
    u -= s[1];
  }
  return SIGNS[0][0];
}

const PHASES = ['new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full', 'waning_gibbous', 'last_quarter', 'waning_crescent'];

/** Mondphase (i18n-Schlüssel unter model3d.phases.*) und Mondalter in Tagen */
export function moonPhase(a: Angles): { key: string; age: number } {
  const b = mod(a.sun - a.moon, TAU) / TAU;
  return { key: PHASES[Math.round(b * 8) % 8], age: b * SYNODIC };
}

export type ViewKey = 'start' | 'front' | 'side' | 'back';
export type TrainKey = 'drv' | 'sun' | 'csa' | 'zod' | 'csb' | 'moon';

/** Farben der Wellen – auch in der Tabelle der Komponente als Farbpunkt verwendet */
export const TRAIN_COLORS: Record<TrainKey, string> = {
  sun: '#e0b23c', zod: '#3fb0a6', moon: '#cdd6e2', csa: '#cf7a3c', csb: '#9d8be0', drv: '#dc5a50',
};

const IMG_BASE = 'assets/images/';
const IMG: Record<string, string> = {
  zifferring: 'hintergrund/zifferring.png',
  sternhimmel: 'hintergrund/sternhimmel.png',
  christus: 'hintergrund/heiland.png',
  sonne: 'zeiger/sonne.png',
};
for (const n of ['stier', 'zwilling', 'krebs', 'loewe', 'jungfrau', 'waage', 'schlangentraeger',
  'schuetze', 'steinbock', 'wassermann', 'fische', 'widder']) {
  IMG[n] = `tierkreiszeichen/${n}.png`;
}

/* ---------- Geometriehelfer ---------- */
function gearGeo(z: number, R: number, thick: number, spoked: boolean): THREE.BufferGeometry {
  const m = (2 * R) / z, ra = R + m, rf = R - 1.25 * m, p = TAU / z, s = new THREE.Shape();
  for (let i = 0; i < z; i++) {
    const a = i * p, q = [[rf, -0.27], [ra, -0.13], [ra, 0.13], [rf, 0.27]];
    for (let j = 0; j < 4; j++) {
      const r = q[j][0], t = a + q[j][1] * p, x = r * Math.cos(t), y = r * Math.sin(t);
      if (i || j) s.lineTo(x, y); else s.moveTo(x, y);
    }
  }
  s.closePath();
  if (spoked) {
    const n = 8, r1 = 0.5, r2 = rf - 0.2, w = 0.075;
    for (let i = 0; i < n; i++) {
      const a0 = (i * TAU) / n, a1 = ((i + 1) * TAU) / n, di = Math.asin(w / r1), dO = Math.asin(w / r2), h = new THREE.Path();
      h.moveTo(r1 * Math.cos(a0 + di), r1 * Math.sin(a0 + di));
      h.lineTo(r2 * Math.cos(a0 + dO), r2 * Math.sin(a0 + dO));
      h.absarc(0, 0, r2, a0 + dO, a1 - dO, false);
      h.lineTo(r1 * Math.cos(a1 - di), r1 * Math.sin(a1 - di));
      h.absarc(0, 0, r1, a1 - di, a0 + di, true);
      s.holes.push(h);
    }
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 14 });
  g.translate(0, 0, -thick / 2);
  return g;
}

// Kegelrad 45° (Winkelgetriebe 1:1): Spitze des Teilkegels im Ursprung, Radkörper Richtung -z
function bevelGeo(N: number, R: number, F: number): THREE.BufferGeometry {
  const d = Math.PI / 4, So = R / Math.sin(d), Si = So - F, m = (2 * R) / N, p = TAU / N;
  const prof = [[-0.5, -1.25], [-0.28, -1.25], [-0.11, 1], [0.11, 1], [0.28, -1.25]];
  const pt = (sd: number, th: number, h: number): number[] => {
    const hh = (h * m * sd) / So, r = sd * Math.sin(d) + hh * Math.cos(d);
    return [r * Math.cos(th), r * Math.sin(th), -sd * Math.cos(d) + hh * Math.sin(d)];
  };
  const o: number[][] = [], n: number[][] = [];
  for (let i = 0; i < N; i++) for (const q of prof) { o.push(pt(So, (i + q[0]) * p, q[1])); n.push(pt(Si, (i + q[0]) * p, q[1])); }
  const cO = [0, 0, -So * Math.cos(d) - 0.16], cI = [0, 0, -Si * Math.cos(d) + 0.02], v: number[] = [], K = o.length;
  for (let i = 0; i < K; i++) {
    const j = (i + 1) % K;
    v.push(...o[i], ...o[j], ...n[j], ...o[i], ...n[j], ...n[i], ...cO, ...o[j], ...o[i], ...cI, ...n[i], ...n[j]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

// Zahneingriff: Drehwinkel des getriebenen Rades B, wenn A um a gedreht ist und B in Richtung phi liegt
const meshAngle = (a: number, zA: number, zB: number, phi: number) => phi + Math.PI + Math.PI / zB - (zA / zB) * (a - phi);

/* ---------- Maße (Einheit frei, Verhältnisse nach Zähnezahlen und Skizze) ---------- */
const A_A = 4.0, A_B = 3.1;                       // Achsabstände der beiden Vorgelege
const R487 = (A_A * 487) / 547, R60 = (A_A * 60) / 547, R293 = (A_A * 293) / 329, R36 = (A_A * 36) / 329;
const R298 = (A_B * 298) / 338, R40 = (A_B * 40) / 338, R347 = (A_B * 347) / 392, R45 = (A_B * 45) / 392;
const R360 = 3.75, R15 = (R360 * 15) / 360, Y_DRV = R360 + R15;
const ZW = { z487: -1.41, z293: -2.41, z360: -3.24, z298: -4.18, z347: -4.88 };
const Z_DIAL = 0.82, Z_ZOD = 1.47, Z_SUN = 2.1, Z_BALL = 2.75, Z_MOON = 3.22, Z_HEIL = 3.62, R_BEV = 0.3, N_BEV = 20, F_BEV = 0.2;
const RL = 7.05, LS = RL / 0.37;                 // rLarge und logicalSize der App, damit alle Maße der Scheibe übereinstimmen
const R_SUNIMG = 0.368 * LS, R_MOONBALL = 0.345 * LS;
const TAIL_SUN = 0.29 * RL, TAIL_MOON = 0.41 * RL; // Längen der Gegengewichtsarme, am Foto gemessen

const VIEWS: Record<ViewKey, number[]> = {
  start: [0.95, 1.25, 33, 0, -0.4, -2.2],
  front: [0, 1.5708, 30, 0, -0.2, 0],
  side: [1.5708, 1.5708, 27, 0, -0.4, -2.4],
  back: [2.45, 1.15, 22, 0, -0.3, -3.2],
};

// Silberner Namensring um die Mitte (Aufschrift wie an der echten Uhr, daher deutsch)
const RING_NAMES = ['STIER', 'ZWILLINGE', 'KREBS', 'LÖWE', 'JUNGFRAU', 'WAAGE', 'SKORPION', 'SCHLANGENTR.', 'SCHÜTZE', 'STEINBOCK', 'WASSERMANN', 'FISCHE', 'WIDDER'];

interface Tag { el: HTMLDivElement; key: string; pos: THREE.Vector3; obj?: THREE.Object3D; }
interface CamState { az: number; pol: number; r: number; t: THREE.Vector3; }

export class ClockModel3D {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400);
  private readonly loader = new THREE.TextureLoader();
  private readonly M: Record<string, THREE.MeshStandardMaterial>;
  private readonly tags: Tag[] = [];
  private readonly plaques: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly cam: CamState = { az: 0, pol: 1, r: 30, t: new THREE.Vector3() };
  private goal: CamState | null = null;
  private readonly ptr = new Map<number, { x: number; y: number }>();
  private pinch = 0;
  private W = 0;
  private H = 0;
  private showTags = true;
  private glass = false;
  private readonly v = new THREE.Vector3();

  // bewegliche Teile
  private sunG!: THREE.Group; private zodG!: THREE.Group; private moonG!: THREE.Group;
  private ballTrain!: THREE.Group; private heil!: THREE.Group; private cage!: THREE.Group;
  private csA!: THREE.Group; private csB!: THREE.Group; private drv!: THREE.Group;
  private g293!: THREE.Mesh; private g360!: THREE.Mesh; private g298!: THREE.Mesh; private g487!: THREE.Mesh; private g347!: THREE.Mesh;
  private sunDisc!: THREE.Mesh; private moonBall!: THREE.Mesh;
  private dialMat!: THREE.MeshBasicMaterial; private zodMat!: THREE.MeshBasicMaterial;
  private ringMat!: THREE.MeshBasicMaterial; private heilMat!: THREE.MeshBasicMaterial;
  private readonly backMat = new THREE.MeshBasicMaterial({ color: 0x1b2638, transparent: true });

  private readonly listeners: [string, EventListener, AddEventListenerOptions?][] = [];

  /** Wirft, wenn WebGL nicht verfügbar ist. */
  constructor(private readonly canvas: HTMLCanvasElement, private readonly tagLayer: HTMLElement, private readonly label: (key: string) => string) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // three.js rechnet seit r155 mit physikalischen Lichteinheiten: Faktor π entspricht
    // der Helligkeit des r128-Prototyps.
    const P = Math.PI;
    this.scene.add(new THREE.HemisphereLight(0xcfdcff, 0x1a1408, 0.85 * P));
    const l1 = new THREE.DirectionalLight(0xfff1d6, 0.95 * P); l1.position.set(12, 16, 20); this.scene.add(l1);
    const l2 = new THREE.DirectionalLight(0x9fc0ff, 0.55 * P); l2.position.set(-14, 6, -18); this.scene.add(l2);
    const l3 = new THREE.DirectionalLight(0xffffff, 0.35 * P); l3.position.set(16, -8, -10); this.scene.add(l3);

    const metal = (c: string) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.45, roughness: 0.42 });
    this.M = {
      sun: metal(TRAIN_COLORS.sun), zod: metal(TRAIN_COLORS.zod), moon: metal(TRAIN_COLORS.moon),
      csa: metal(TRAIN_COLORS.csa), csb: metal(TRAIN_COLORS.csb), drv: metal(TRAIN_COLORS.drv),
      bev: new THREE.MeshStandardMaterial({ color: 0xcdd6e2, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }),
      bevSun: new THREE.MeshStandardMaterial({ color: 0xe0b23c, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }),
      frame: new THREE.MeshStandardMaterial({ color: 0x3a4558, metalness: 0.3, roughness: 0.6 }),
      bronze: new THREE.MeshStandardMaterial({ color: 0x8c6d3f, metalness: 0.6, roughness: 0.42 }),
      puck: new THREE.MeshStandardMaterial({ color: 0x2d5fb3, metalness: 0.15, roughness: 0.5 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x0b0c10, metalness: 0.3, roughness: 0.3, side: THREE.DoubleSide }),
    };

    this.build();
    this.buildTags();
    this.bindPointer();
    this.setView('start', true);
  }

  /* ---------- Aufbau ---------- */
  private gear(z: number, R: number, thick: number, mat: THREE.Material, zPos: number, spoked: boolean): THREE.Mesh {
    const o = new THREE.Mesh(gearGeo(z, R, thick, spoked), mat);
    o.position.set(0, 0, zPos);
    this.scene.add(o);
    return o;
  }

  private rodZ(r: number, z0: number, z1: number, mat: THREE.Material, parent: THREE.Object3D = this.scene, x = 0, y = 0): THREE.Mesh {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.abs(z1 - z0), 24), mat);
    o.rotation.x = Math.PI / 2;
    o.position.set(x, y, (z0 + z1) / 2);
    parent.add(o);
    return o;
  }

  private rodY(r: number, y0: number, y1: number, mat: THREE.Material, parent: THREE.Object3D, z = 0): THREE.Mesh {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.abs(y1 - y0), 16), mat);
    o.position.set(0, (y0 + y1) / 2, z);
    parent.add(o);
    return o;
  }

  private tex(n: string): THREE.Texture {
    const t = this.loader.load(IMG_BASE + IMG[n]);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }

  private flat(n: string, o: THREE.MeshBasicMaterialParameters = {}): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({ map: this.tex(n), side: THREE.DoubleSide, transparent: true, alphaTest: 0.08, ...o });
  }

  private backOf(R: number, z: number, par: THREE.Object3D): void {
    const b = new THREE.Mesh(new THREE.CircleGeometry(R, 96), this.backMat);
    b.rotation.y = Math.PI;
    b.position.z = z - 0.01;
    par.add(b);
  }

  private puck(par: THREE.Object3D, y: number, z: number): void {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 36), this.M['puck']);
    p.rotation.x = Math.PI / 2;
    p.position.set(0, y, z);
    par.add(p);
  }

  private build(): void {
    const { scene, M } = this;

    /* Gestell: zwei Platinen mit Pfeilern */
    for (const z of [0.25, -6.25]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, 11.4, 0.5), M['frame']);
      b.position.set(0, -0.45, z);
      scene.add(b);
    }
    for (const [x, y] of [[0.55, 5.0], [-0.55, 5.0], [0.55, -5.9], [-0.55, -5.9]]) this.rodZ(0.11, 0, -6, M['frame'], scene, x, y);

    /* Zifferblatt (fest) */
    this.dialMat = this.flat('zifferring', { side: THREE.FrontSide });
    const dial = new THREE.Mesh(new THREE.CircleGeometry(1.2 * RL, 128), this.dialMat);
    dial.position.z = Z_DIAL;
    scene.add(dial);
    this.backOf(1.2 * RL, Z_DIAL, scene);

    /* Sternscheibe mit Namensring und Sternbildern */
    const zodG = (this.zodG = new THREE.Group());
    scene.add(zodG);
    this.zodMat = this.flat('sternhimmel', { side: THREE.FrontSide });
    const zodDisc = new THREE.Mesh(new THREE.CircleGeometry(RL, 128), this.zodMat);
    zodDisc.position.z = Z_ZOD;
    zodG.add(zodDisc);
    this.backOf(RL, Z_ZOD, zodG);
    this.rodZ(0.27, -1.62, Z_ZOD + 0.08, M['zod'], zodG);
    const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 40), M['zod']);
    flange.rotation.x = Math.PI / 2;
    flange.position.z = Z_ZOD - 0.06;
    zodG.add(flange);

    this.ringMat = new THREE.MeshBasicMaterial({ map: this.ringTexture(), transparent: true, alphaTest: 0.05 });
    const nameRing = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 5.8), this.ringMat);
    nameRing.position.z = Z_ZOD + 0.03;
    nameRing.renderOrder = 1;
    zodG.add(nameRing);

    // Reihenfolge, Feinkorrektur (Grad), Größenfaktor und radialer Versatz wie in config.ts der App
    const FIG: [string | null, number, number, number][] = [
      ['stier', -1, 10, -0.085], ['zwilling', -3, 7, 0.035], ['krebs', -4.3, 6, 0.032], ['loewe', -6.1, 8, -0.085],
      ['jungfrau', 0, 7.5, 0.035], ['waage', 4, 8, -0.05], [null, -12, 0, 0], ['schlangentraeger', -3, 6, -0.07],
      ['schuetze', -2.5, 6, 0.03], ['steinbock', 2, 6, -0.015], ['wassermann', 0, 9, -0.05], ['fische', -2.7, 10, -0.08],
      ['widder', -1.5, 6, 0.03],
    ];
    const WID = [36.7, 27.9, 20.1, 35.7, 44.1, 23.0, 6.7, 18.6, 33.4, 27.9, 24.2, 37.2, 24.7];
    let acc = WID[0] / 2;
    FIG.forEach((f, i) => {
      let deg = -90 + f[1];
      if (i) { deg -= acc + WID[i] / 2; acc += WID[i]; }
      if (!f[0]) return; // der Skorpion ist in die Sternscheibe gemalt
      const a = (deg * TAU) / 360, r = 0.32 * LS * (0.8 + f[3]), size = 0.02 * LS * f[2];
      const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), this.flat(f[0]));
      p.position.set(r * Math.cos(a), -r * Math.sin(a), Z_ZOD + 0.06 + i * 0.004);
      p.renderOrder = 2;
      zodG.add(p);
      this.plaques.push(p);
    });
    this.g487 = this.gear(487, R487, 0.12, M['zod'], ZW.z487, true);

    /* Kugellager des Tierkreisrohrs in der vorderen Platine */
    const cage = (this.cage = new THREE.Group());
    cage.position.z = 0.56;
    scene.add(cage);
    for (let i = 0; i < 10; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), M['moon']);
      b.position.set(0.37 * Math.cos((i * TAU) / 10), 0.37 * Math.sin((i * TAU) / 10), 0);
      cage.add(b);
    }
    const race = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.05, 10, 40), M['frame']);
    race.position.z = 0.56;
    scene.add(race);

    /* Sonne: Rohr, drei Räder, Zeiger, Kegelrad für die Mondkugel */
    const sunG = (this.sunG = new THREE.Group());
    scene.add(sunG);
    this.rodZ(0.17, -4.5, Z_BALL - 0.2, M['sun'], sunG);
    this.g293 = this.gear(293, R293, 0.12, M['sun'], ZW.z293, true);
    this.g360 = this.gear(360, R360, 0.12, M['sun'], ZW.z360, true);
    this.g298 = this.gear(298, R298, 0.12, M['sun'], ZW.z298, true);
    {
      const tipY = 0.96 * RL;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, tipY, 12), M['sun']);
      bar.position.set(0, tipY / 2, Z_SUN);
      sunG.add(bar);
      this.rodY(0.05, -TAIL_SUN, 0, M['bronze'], sunG, Z_SUN);
      this.puck(sunG, -TAIL_SUN, Z_SUN);
      const img = new THREE.Mesh(new THREE.PlaneGeometry(0.1 * LS, 0.1 * LS), this.flat('sonne'));
      img.position.set(0, R_SUNIMG, Z_SUN + 0.06);
      img.renderOrder = 3;
      sunG.add(img);
      this.sunDisc = img;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 28), M['sun']);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = Z_SUN;
      sunG.add(hub);
      // Kegelrad auf dem Sonnenrohr, Kegelspitze im Schnittpunkt mit der Mondkugel-Welle
      const bv = new THREE.Mesh(bevelGeo(N_BEV, R_BEV, F_BEV), M['bevSun']);
      bv.position.z = Z_BALL;
      bv.rotation.z = Math.PI / 2;
      sunG.add(bv);
      this.rodZ(0.26, Z_ZOD + 0.12, Z_BALL - R_BEV - 0.12, M['sun'], sunG); // Messinghülse vor der Sternscheibe
    }

    /* Mond: innerste Welle, gekröpfter Zeiger, Kugelwelle mit Rad, Mondkugel */
    const moonG = (this.moonG = new THREE.Group());
    scene.add(moonG);
    this.rodZ(0.09, -6.85, Z_MOON + 0.07, M['moon'], moonG);
    this.g347 = this.gear(347, R347, 0.12, M['moon'], ZW.z347, true);
    const ballTrain = (this.ballTrain = new THREE.Group());
    ballTrain.position.z = Z_BALL;
    moonG.add(ballTrain);
    {
      // Der Mondzeiger ist ein Rohr. In ihm läuft die Welle der Mondkugel; die schwarze Halbschale sitzt fest am Rohrende.
      const Y_T = R_BEV + 0.34;
      this.rodY(0.065, Y_T - 0.04, R_MOONBALL - 0.44, M['bronze'], moonG, Z_BALL);
      const yoke = [[0, 0, Z_MOON], [0, Y_T - 0.2, Z_MOON], [0, Y_T - 0.03, Z_MOON - 0.1], [0, Y_T, Z_BALL + 0.05]].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      moonG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(yoke, false, 'catmullrom', 0.3), 40, 0.05, 8), M['bronze']));
      this.rodY(0.05, -TAIL_MOON, 0, M['bronze'], moonG, Z_MOON);
      this.puck(moonG, -TAIL_MOON, Z_MOON);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 24), M['bronze']);
      hub.rotation.x = Math.PI / 2;
      hub.position.z = Z_MOON;
      moonG.add(hub);
      const cup = new THREE.Mesh(new THREE.SphereGeometry(0.47, 36, 16, 0, TAU, 0, 1.44), M['dark']);
      cup.rotation.x = -Math.PI / 2;
      cup.position.set(0, R_MOONBALL, Z_BALL);
      moonG.add(cup);
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.13), M['dark']);
      lug.position.set(0, R_MOONBALL - 0.475, Z_BALL - 0.07);
      moonG.add(lug);
      this.rodY(0.03, 0.12, R_MOONBALL, M['moon'], ballTrain, 0);
      // Kegelrad auf der Kugelwelle: gleiche Zähnezahl, Achse im rechten Winkel
      const bv = new THREE.Mesh(bevelGeo(N_BEV, R_BEV, F_BEV), M['bev']);
      bv.rotation.set(Math.PI / 2, 0, -Math.PI / 2 + Math.PI / N_BEV, 'XYZ');
      ballTrain.add(bv);
      const lit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf2cf63, metalness: 0.5, roughness: 0.35 }));
      const shade = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0b0c10, metalness: 0.3, roughness: 0.25 }));
      lit.position.y = shade.position.y = R_MOONBALL;
      ballTrain.add(lit, shade);
      this.moonBall = lit;
    }

    /* Christusfigur: steht still vor den Zeigern, getragen von einer festen Achse durch die hohle Mondwelle */
    const heil = (this.heil = new THREE.Group());
    scene.add(heil);
    this.rodZ(0.04, -7.15, Z_HEIL, M['frame'], heil);
    {
      const S = 0.26 * LS;
      this.heilMat = this.flat('christus', { alphaTest: 0.3 });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(S, S), this.heilMat);
      face.position.z = Z_HEIL + 0.02;
      face.renderOrder = 5;
      heil.add(face);
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 6), M['frame']);
      nut.rotation.x = Math.PI / 2;
      nut.position.z = -6.95;
      heil.add(nut);
    }

    /* Vorgelege und Antrieb */
    this.rodZ(0.1, 0.6, -6.6, M['csa'], scene, 0, -A_A);
    const csA = (this.csA = new THREE.Group());
    csA.position.set(0, -A_A, 0);
    scene.add(csA);
    const g60 = new THREE.Mesh(gearGeo(60, R60, 0.45, false), M['csa']); g60.position.z = ZW.z487; csA.add(g60);
    const g36 = new THREE.Mesh(gearGeo(36, R36, 0.45, false), M['csa']); g36.position.z = ZW.z293; csA.add(g36);
    this.rodZ(0.2, ZW.z487, ZW.z293, M['csa'], csA);

    this.rodZ(0.09, -3.72, -6.75, M['csb'], scene, 0, -A_B);
    const csB = (this.csB = new THREE.Group());
    csB.position.set(0, -A_B, 0);
    scene.add(csB);
    const g40 = new THREE.Mesh(gearGeo(40, R40, 0.4, false), M['csb']); g40.position.z = ZW.z298; csB.add(g40);
    const g45 = new THREE.Mesh(gearGeo(45, R45, 0.4, false), M['csb']); g45.position.z = ZW.z347; csB.add(g45);
    this.rodZ(0.18, ZW.z298, ZW.z347, M['csb'], csB);

    const drv = (this.drv = new THREE.Group());
    drv.position.set(0, Y_DRV, 0);
    scene.add(drv);
    this.rodZ(0.075, 0.62, -8.3, M['drv'], drv);
    const g15 = new THREE.Mesh(gearGeo(15, R15, 0.42, false), M['drv']); g15.position.z = ZW.z360; drv.add(g15);
    const crank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.12), M['drv']); crank.position.z = -8.3; drv.add(crank);
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12), M['drv']);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0.25, 0, -8.55);
    drv.add(knob);
  }

  private ringTexture(): THREE.CanvasTexture {
    const S = 1024, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d')!, R = S / 2, u = R / 2.9;
    g.translate(R, R);
    g.fillStyle = '#ecebe6';
    g.beginPath(); g.arc(0, 0, 2.32 * u, 0, TAU); g.arc(0, 0, 1.57 * u, 0, TAU, true); g.fill();
    g.strokeStyle = 'rgba(60,66,80,.55)';
    g.lineWidth = 0.012 * u;
    for (const r of [2.32, 1.57]) { g.beginPath(); g.arc(0, 0, r * u, 0, TAU); g.stroke(); }
    g.fillStyle = '#17181c'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const big = '600 ' + 0.145 * u + 'px "Arial Narrow", Arial, sans-serif';
    const small = '600 ' + 0.115 * u + 'px "Arial Narrow", Arial, sans-serif';
    g.font = big;
    const arc = (txt: string, mid: number, r: number, flip: boolean) => {
      const chars = [...txt], ws = chars.map((ch) => g.measureText(ch).width * 1.12), tot = ws.reduce((x, y) => x + y, 0);
      let a = mid - tot / r / 2;
      chars.forEach((ch, i) => {
        a += ws[i] / r / 2;
        g.save(); g.rotate(flip ? mid * 2 - a : a); g.translate(0, -r);
        if (flip) g.rotate(Math.PI);
        g.fillText(ch, 0, 0); g.restore();
        a += ws[i] / r / 2;
      });
    };
    RING_NAMES.forEach((n, i) => {
      const mid = (-i * TAU) / 13;
      arc(n, mid, 2.13 * u, false);
      g.globalAlpha = 0.8; g.font = small;
      arc(n, mid, 1.76 * u, true);
      g.font = big; g.globalAlpha = 1;
    });
    g.fillStyle = '#e8c765';
    for (let i = 0; i < 20; i++) {
      g.save(); g.rotate(((i + 0.5) * TAU) / 20); g.translate(0, -2.62 * u); g.beginPath();
      for (let k = 0; k < 16; k++) {
        const rr = (k % 2 ? 0.035 : 0.1) * u, t = (k * TAU) / 16;
        if (k) g.lineTo(rr * Math.sin(t), -rr * Math.cos(t)); else g.moveTo(0, -rr);
      }
      g.fill(); g.restore();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }

  /* ---------- Beschriftung ---------- */
  private tag(key: string, pos: THREE.Vector3, obj?: THREE.Object3D, title = false): void {
    const el = document.createElement('div');
    el.className = 'tag' + (title ? ' t' : '');
    this.tagLayer.appendChild(el);
    this.tags.push({ el, key, pos, obj });
  }

  private buildTags(): void {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const rim = (R: number, deg: number, z: number) => V(R * Math.cos((deg * TAU) / 360), R * Math.sin((deg * TAU) / 360), z);
    this.tag('#487', rim(R487, 205, ZW.z487)); this.tag('#293', rim(R293, 190, ZW.z293)); this.tag('#360', rim(R360, 170, ZW.z360));
    this.tag('#298', rim(R298, 155, ZW.z298)); this.tag('#347', rim(R347, 140, ZW.z347));
    this.tag('#60', V(0, -A_A - 0.75, ZW.z487)); this.tag('#36', V(0, -A_A - 0.75, ZW.z293));
    this.tag('#40', V(0.75, -A_B, ZW.z298)); this.tag('#45', V(0.75, -A_B, ZW.z347));
    this.tag('#15', V(0, Y_DRV + 0.5, ZW.z360));
    this.tag('model3d.tags.drive', V(0, Y_DRV + 0.55, -8.3), undefined, true);
    this.tag('model3d.tags.bearing', V(0.9, 0.75, 0.56), undefined, true);
    this.tag('model3d.tags.plates', V(0, -6.5, -3), undefined, true);
    this.tag('model3d.tags.dial', V(0, -9.0, Z_DIAL), undefined, true);
    this.tag('model3d.tags.bevel', V(0.75, 0.35, Z_BALL), undefined, true);
    this.tag('model3d.tags.star_disc', V(0, -7.3, Z_ZOD - 0.5), undefined, true);
    this.tag('model3d.tags.sun', V(0, 1.15, 0.3), this.sunDisc, true);
    this.tag('model3d.tags.moon', V(0, 0.8, 0.3), this.moonBall, true);
    this.updateLabels();
  }

  /** Beschriftungen neu setzen (z. B. nach Sprachwechsel) */
  updateLabels(): void {
    for (const t of this.tags) t.el.textContent = t.key.startsWith('#') ? t.key.slice(1) : this.label(t.key);
  }

  private placeTags(w: number, h: number): void {
    const { camera, v } = this;
    for (const t of this.tags) {
      if (!this.showTags) { t.el.style.display = 'none'; continue; }
      if (t.obj) { t.obj.getWorldPosition(v); v.y += t.pos.y; v.z += t.pos.z; } else v.copy(t.pos);
      if (!this.glass) {
        // hinter den undurchsichtigen Scheiben verdeckt?
        const cz = camera.position.z, k = (Z_DIAL - cz) / (v.z - cz);
        if (k > 0.001 && k < 0.999) {
          const ix = camera.position.x + (v.x - camera.position.x) * k, iy = camera.position.y + (v.y - camera.position.y) * k;
          if (ix * ix + iy * iy < 8.46 * 8.46) { t.el.style.display = 'none'; continue; }
        }
        const k2 = (Z_HEIL - cz) / (v.z - cz);
        if (this.heil.visible && k2 > 0.001 && k2 < 0.999) {
          const ix = camera.position.x + (v.x - camera.position.x) * k2, iy = camera.position.y + (v.y - camera.position.y) * k2;
          if (ix * ix + iy * iy < 1.2 * 1.2) { t.el.style.display = 'none'; continue; }
        }
      }
      v.project(camera);
      if (v.z > 1 || v.z < -1) { t.el.style.display = 'none'; continue; }
      t.el.style.display = '';
      t.el.style.transform = `translate(-50%,-50%) translate(${(((v.x + 1) / 2) * w).toFixed(1)}px,${(((1 - v.y) / 2) * h).toFixed(1)}px)`;
    }
  }

  /* ---------- Kamera ---------- */
  setView(k: ViewKey, now = false): void {
    const p = VIEWS[k];
    this.goal = { az: p[0], pol: p[1], r: p[2], t: new THREE.Vector3(p[3], p[4], p[5]) };
    if (now) {
      Object.assign(this.cam, { az: p[0], pol: p[1], r: p[2] });
      this.cam.t.copy(this.goal.t);
      this.goal = null;
    }
  }

  private applyCam(): void {
    const { cam, goal } = this;
    if (goal) {
      const k = 0.12;
      let da = goal.az - cam.az;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      cam.az += da * k; cam.pol += (goal.pol - cam.pol) * k; cam.r += (goal.r - cam.r) * k; cam.t.lerp(goal.t, k);
      if (Math.abs(da) < 1e-3 && Math.abs(goal.r - cam.r) < 1e-2 && Math.abs(goal.pol - cam.pol) < 1e-3) this.goal = null;
    }
    const s = Math.sin(cam.pol);
    this.camera.position.set(cam.t.x + cam.r * s * Math.sin(cam.az), cam.t.y + cam.r * Math.cos(cam.pol), cam.t.z + cam.r * s * Math.cos(cam.az));
    this.camera.lookAt(cam.t);
  }

  private on(type: string, fn: EventListener, opts?: AddEventListenerOptions): void {
    this.canvas.addEventListener(type, fn, opts);
    this.listeners.push([type, fn, opts]);
  }

  private bindPointer(): void {
    const { canvas, cam, ptr } = this;
    this.on('pointerdown', (ev) => {
      const e = ev as PointerEvent;
      canvas.setPointerCapture(e.pointerId);
      ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.goal = null;
    });
    this.on('pointermove', (ev) => {
      const e = ev as PointerEvent, p = ptr.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (ptr.size === 2) {
        const a = [...ptr.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (this.pinch) cam.r = Math.max(6, Math.min(80, (cam.r * this.pinch) / d));
        this.pinch = d;
        return;
      }
      if (e.shiftKey || e.buttons === 2) {
        const k = cam.r * 0.0012;
        const r = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0), u = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);
        cam.t.addScaledVector(r, -dx * k).addScaledVector(u, dy * k);
      } else {
        cam.az -= dx * 0.006;
        cam.pol = Math.max(0.08, Math.min(Math.PI - 0.08, cam.pol - dy * 0.006));
      }
    });
    const up: EventListener = (ev) => { ptr.delete((ev as PointerEvent).pointerId); this.pinch = 0; };
    this.on('pointerup', up);
    this.on('pointercancel', up);
    this.on('contextmenu', (e) => e.preventDefault());
    this.on('wheel', (ev) => {
      const e = ev as WheelEvent;
      e.preventDefault();
      this.goal = null;
      cam.r = Math.max(6, Math.min(80, cam.r * Math.exp(e.deltaY * 0.0012)));
    }, { passive: false });
  }

  /* ---------- Schalter ---------- */
  setGlass(g: boolean): void {
    this.glass = g;
    const { backMat, dialMat, zodMat, ringMat } = this;
    backMat.opacity = g ? 0.1 : 1; backMat.depthWrite = !g;
    dialMat.opacity = g ? 0.14 : 1; zodMat.opacity = g ? 0.18 : 1;
    dialMat.depthWrite = zodMat.depthWrite = !g;
    dialMat.alphaTest = zodMat.alphaTest = g ? 0 : 0.08;
    dialMat.needsUpdate = zodMat.needsUpdate = true;
    for (const p of this.plaques) { p.material.opacity = g ? 0.4 : 1; p.material.depthWrite = !g; }
    this.heilMat.opacity = g ? 0.3 : 1;
    ringMat.opacity = g ? 0.3 : 1; ringMat.depthWrite = !g;
  }

  setHeil(show: boolean): void { this.heil.visible = show; }

  setTags(show: boolean): void { this.showTags = show; }

  /** Hebt eine Welle hervor (Tabelle „Räderwerk“), null hebt die Hervorhebung auf */
  highlight(k: TrainKey | null): void {
    const keys: TrainKey[] = ['sun', 'zod', 'moon', 'csa', 'csb', 'drv'];
    for (const key of keys) {
      const m = this.M[key];
      m.emissive.setHex(k === key ? 0x664400 : 0);
      m.transparent = k !== null;
      m.opacity = k === null || k === key ? 1 : 0.28;
      m.needsUpdate = true;
    }
  }

  /* ---------- Lauf ---------- */
  private pose(t: number): Angles {
    const a = angles(t), rs = -a.sun; // Uhrsinn = negative Drehung um z
    this.sunG.rotation.z = rs;
    this.g293.rotation.z = this.g360.rotation.z = this.g298.rotation.z = rs;
    this.zodG.rotation.z = -a.zod;
    for (const p of this.plaques) p.rotation.z = a.zod; // Sternbilder bleiben aufrecht wie in der App
    this.moonG.rotation.z = -a.moon;
    const rA = meshAngle(rs, 293, 36, -Math.PI / 2);
    this.csA.rotation.z = rA;
    this.g487.rotation.z = meshAngle(rA, 60, 487, Math.PI / 2);
    const rB = meshAngle(rs, 298, 40, -Math.PI / 2);
    this.csB.rotation.z = rB;
    this.g347.rotation.z = meshAngle(rB, 45, 347, Math.PI / 2);
    this.drv.rotation.z = meshAngle(rs, 360, 15, Math.PI / 2);
    this.cage.rotation.z = -a.zod / 2;
    this.ballTrain.rotation.y = -mod(a.sun - a.moon, TAU); // Kugel rollt auf dem Kegelrad ab
    return a;
  }

  /** Stellt das Modell auf den Zeitpunkt t (ms, UTC) und zeichnet ein Bild in der Größe w×h. */
  render(t: number, w: number, h: number): Angles {
    if (w !== this.W || h !== this.H) {
      this.W = w; this.H = h;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    const a = this.pose(t);
    this.applyCam();
    this.renderer.render(this.scene, this.camera);
    this.placeTags(w, h);
    return a;
  }

  dispose(): void {
    for (const [type, fn, opts] of this.listeners) this.canvas.removeEventListener(type, fn, opts);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        (mat as THREE.MeshBasicMaterial).map?.dispose();
        mat.dispose();
      }
    });
    for (const t of this.tags) t.el.remove();
    this.renderer.dispose();
  }
}
