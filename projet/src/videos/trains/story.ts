// "Les trains trop larges": shot plan timed to the French voice (Léo, 48.3 s). Word times in seconds from
// ElevenLabs scribe; every reaction lands 2 frames before its word.
export const FPS = 30;
export const TOTAL = 1452; // 48.4 s
export type V3 = [number, number, number];
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
export const W = (s: number) => Math.round(s * FPS) - 2;

// ---------------- sets ----------------
// station: track along x at z = 0, main platform on +z (old edge at z = EDGE, top at PH), building at z = 9.
// section: x = 200, a short platform seen end-on (front view of the track). office: x = -100. salon + stairs: x = -200.
export const EDGE = 1.35, PH = 0.55, HALF = 1.45; // train half-width 1.45 > old platform edge 1.35
export const PLAT = { x0: -12, x1: 46 };
export const SECT = { x: 200, end: 197 };
export const OFFICE = { x: -400 };
export const SALON = { x: -200, stair: -194 };

export type Light = "day" | "dusk" | "room" | "expl";
export type SetId = "station" | "section" | "office" | "salon";
export type ShotDef = { id: number; a: number; b: number; light: Light; set: SetId };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 128, light: "day", set: "station" },       // new trains... the stations had to be planed
  { id: 2, a: 128, b: 260, light: "day", set: "station" },     // 2014, the SNCF waits for its new trains
  { id: 3, a: 260, b: 362, light: "day", set: "station" },     // more modern, more comfortable, a bit wider
  { id: 4, a: 362, b: 466, light: "room", set: "office" },     // an engineer takes out the plans... turns white
  { id: 5, a: 466, b: 504, light: "room", set: "office" },     // in hundreds of stations
  { id: 6, a: 504, b: 552, light: "day", set: "station" },     // the train won't pass along the platform
  { id: 7, a: 552, b: 670, light: "day", set: "station" },     // wait... how do you order a train without checking?
  { id: 8, a: 670, b: 746, light: "expl", set: "office" },     // you see, the measurements came from the network
  { id: 9, a: 746, b: 890, light: "expl", set: "section" },    // old platforms, much closer to the rails
  { id: 10, a: 890, b: 1038, light: "room", set: "salon" },    // sofa: the living-room door... the old staircase
  { id: 11, a: 1038, b: 1164, light: "dusk", set: "station" }, // jackhammers, 1300 platforms one by one
  { id: 12, a: 1164, b: 1318, light: "day", set: "station" },  // perfect... for other stations
  { id: 13, a: 1318, b: TOTAL, light: "day", set: "station" }, // the bill: 80 million. for a few centimetres
];
/** 8-frame dissolves on every shot change (reference: 0-1 hard cuts per video) */
export const XFADE: Record<number, number> = { 2: 6, 3: 6, 4: 8, 5: 6, 6: 8, 7: 6, 8: 8, 9: 8, 10: 8, 11: 8, 12: 8, 13: 6 };
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- story beats (frames) ----------------
export const GARES = W(2.57);       // "gares" (hook pivot)
export const RABOT = W(3.85);       // "raboter"
export const Y2014 = W(4.88);       // "2014"
export const SNCF = W(6.14);
export const NOUV = W(7.61);        // "nouveaux trains"
export const MODERN = W(9.03);
export const CONFORT = W(9.8);
export const LARGES = W(11.55);
export const PLANS = W(13.06);      // "ressort les plans"
export const BLANC = W(15.24);
export const CENT = W(16.01);       // "centaines"
export const PASSE = W(17.37);      // "passera pas"
export const ATTENDS = W(18.53);
export const COMMENT = W(19.3);
export const RENTRE = W(21.48);
export const MESURES = W(23.01);
export const RESEAU = W(24.02);     // "gestionnaire du réseau"
export const VIEILLES = W(25.97);
export const DIZAINES = W(27.85);
export const PRES = W(29.02);       // "plus près des rails"
export const CANAPE = W(30.55);
export const PORTE = W(31.72);
export const SALONW = W(32.28);
export const ESCALIER = W(33.84);
export const MARTEAU = W(35.67);
export const MILLE = W(36.62);
export const RABOTES = W(37.72);
export const PARFAIT = W(40.48);
export const MALHEUR = W(41.11);
export const AUTRES = W(43.18);
export const FACTURE = W(44.22);
export const QUATRE = W(45.24);
export const POUR = W(46.93);
export const CM = W(47.17);

// ---------------- the train (nose x per shot) ----------------
export const trainX = (id: number, f: number): number | null => {
  switch (id) {
    case 1: return -60 + 44 * glide(f / 58);                               // glides in, stops before the platform
    case 3: return -2 + 6 * smooth((f - 260) / 55);
    case 6: { const u = clamp01((f - 504) / (PASSE + 4 - 504)); return -34 + 22.5 * (1 - (1 - u) ** 2); } // brakes into the edge
    case 7: return -11.5;
    case 9: return SECT.end + 2.2;
    case 12: return -16 + 0.42 * (f - 1164);
    case 13: return 20;
    default: return null;
  }
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mixC(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const push = (pos: V3, look: V3, f: number, f0: number, rate: number): V3 => {
  const k = Math.min(0.6, Math.max(0, f - f0) * rate);
  return pos.map((v, i) => v + (look[i] - v) * k) as V3;
};
const P = (pos: V3, look: V3, f: number, f0: number, rate = 0.0022, fov = 40, roll = 0): Shot => ({ pos: push(pos, look, f, f0, rate), look, fov, roll });
const O = OFFICE.x, S = SALON.x, X = SECT.x;

const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: (f) => { const t = trainX(1, f)!; return P([-12, 1.7, -6.2], [Math.min(t - 6, -18), 1.9, 0], f, 0, 0.001, 44); } },
    { f: GARES - 8, dur: 26, s: (f) => P([-4.6, 1.35, -3.0], [-7.2, 0.75, 1.6], f, GARES + 18, 0.003, 42, 0.04) },
  ],
  2: [
    { f: 128, s: (f) => P([8.0, 1.75, 6.6], [-1.5, 1.45, 3.0], f, 128, 0.0018, 42) },
    { f: NOUV - 6, dur: 20, s: (f) => P([5.0, 1.5, 6.0], [-3.0, 1.4, 2.6], f, NOUV + 14, 0.002, 40) },
  ],
  3: [
    { f: 260, s: (f) => P([-6.5, 1.5, -6.2], [-9.5, 2.2, 0], f, 260, 0.0016, 44) },
    { f: W(10.5), dur: 20, s: (f) => P([13.5, 2.2, -1.4], [4.0, 2.1, 0], f, W(10.5) + 20, 0.0025, 42) },
  ],
  4: [
    { f: 362, s: (f) => P([O + 0.2, 1.55, 2.6], [O, 1.3, -1.2], f, 362, 0.0018, 40) },
    { f: BLANC - 6, dur: 10, s: (f) => P([O + 0.05, 1.6, 1.3], [O, 1.45, -1.6], f, BLANC + 4, 0.003, 38, -0.05) },
  ],
  5: [{ f: 466, s: (f) => P([O + 3.0, 1.85, 0.8], [O + 3.0, 1.8, -3], f, 466, 0.004, 40) }],
  6: [
    { f: 504, s: (f) => P([-3.0, 1.9, -7.6], [-12.0, 1.3, 1.2], f, 504, 0.0012, 46) },
    { f: PASSE + 2, dur: 6, s: (f) => P([-4.2, 1.75, -6.6], [-12.0, 1.2, 1.2], f, PASSE + 8, 0.0015, 44, -0.05) },
  ],
  7: [{ f: 552, s: (f) => P([-4.4, 1.7, 5.6], [-9.3, 1.45, 1.8], f, 552, 0.0026, 42) }],
  8: [{ f: 670, s: (f) => P([O - 0.55, 1.6, 4.3], [O - 0.55, 1.2, -1.3], f, 670, 0.0018, 44) }],
  9: [
    { f: 746, s: (f) => P([X + 9.0, 2.7, 0.9], [SECT.end, 0.8, 1.0], f, 746, 0.0016, 42) },
    { f: DIZAINES - 20, dur: 30, s: (f) => P([X + 6.4, 1.6, 1.3], [SECT.end + 1.0, 0.6, 1.5], f, DIZAINES + 10, 0.0015, 40) },
  ],
  10: [
    { f: 890, s: (f) => P([S + 0.4, 1.8, 6.4], [S, 1.1, -1.0], f, 890, 0.0018, 44) },
    { f: W(32.9), cut: true, s: (f) => P([SALON.stair, 1.25, 3.0], [SALON.stair, 1.45, -1.6], f, W(32.9) + 22, 0.003, 44, 0.05) },
  ],
  11: [
    { f: 1038, s: (f) => { const k = (f - 1038) * 0.11; return { pos: [-11 + k, 1.25, -3.4], look: [-5 + k, 0.75, 1.6], fov: 44 }; } },
    { f: MILLE - 4, dur: 14, s: (f) => { const k = (f - 1038) * 0.11; return { pos: [-11 + k, 2.0, -4.6], look: [-4 + k, 1.4, 1.6], fov: 46 }; } },
  ],
  12: [
    { f: 1164, s: (f) => P([7.0, 1.6, 6.6], [1.8, 1.6, 1.4], f, 1164, 0.0018, 44) },
    { f: MALHEUR - 4, dur: 16, s: (f) => P([4.8, 1.55, 5.2], [2.0, 1.55, 2.6], f, MALHEUR + 12, 0.003, 40) },
  ],
  13: [
    { f: 1318, s: (f) => P([5.4, 1.6, 6.6], [2.6, 1.6, 2.5], f, 1318, 0.0018, 44) },
    { f: POUR - 4, dur: 26, s: (f) => P([5.7, 0.95, 2.35], [4.5, 0.6, 1.3], f, POUR + 22, 0.003, 40, 0.06) },
  ],
};
export const camAt = (id: number, f: number): Cam => run(CAMS[id], f);

/** lens blur per shot (px at 1080 wide); 0 = sharp */
export const dofAt = (f: number): { cInf: number; focus?: (f: number) => V3 } => {
  const id = shotAt(f).id;
  const blur: Record<number, number> = { 1: 8, 2: 10, 3: 6, 4: 10, 5: 8, 6: 6, 7: 10, 8: 10, 9: 6, 10: 9, 11: 8, 12: 10, 13: 10 };
  return { cInf: blur[id] ?? 0 };
};
