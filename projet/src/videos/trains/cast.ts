// Who stands where in every shot of the trains short, as Places (lit cards) and FxPlaces (unlit effect cards),
// plus the moving set pieces (train nose x, sofa, the old platform edge in the section).
import * as THREE from "three";
import { Pen, bodyFront, Outfit, Expr, FrontOpts, INK, SKINS, fxContact, fxPuff, fxBurst } from "../bridge/toon";
import { Place, FxPlace } from "../bridge/cast";
import {
  FPS, W, PH, EDGE, SECT, OFFICE, SALON, smooth, clamp01, trainX, GARES, Y2014, NOUV, MODERN, CONFORT, LARGES, PLANS, BLANC, PASSE,
  COMMENT, RENTRE, MESURES, RESEAU, DIZAINES, PRES, CANAPE, PORTE, SALONW, ESCALIER, MILLE, PARFAIT, MALHEUR, AUTRES, FACTURE, QUATRE, POUR, ATTENDS,
} from "./story";
import { fxText, fxWidth, fxArrowL, fxSpark, fxJack, fxSparks, fxCrac, fxCheck, fxCross, fxDot, fxFolder, fxPlan, fxBill, fxRuler, fxTape, fxQuestion, fxBang, fxSweat, FR } from "./props";

export type CPlace = Place & { sx?: number };
export type Sofa = { x: number; y: number; z: number; ry: number; rz: number };
export type Stage = { places: CPlace[]; fx: FxPlace[]; train: number | null; trainZ: number; shake: number; sofa: Sofa | null; slab: number };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3 };

const q = (v: number, n = 60) => Math.round(v * n) / n;
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

export const CHEF: Outfit = { jacket: "#1f2f5a", pants: "#26304a", boots: INK, hat: "cap", cap: "#c0302a", buttons: "#e8c45a", moustache: "#4a3020", build: "stout", skin: SKINS[0] };
export const WORKER: Outfit = { jacket: "#f07a1a", pants: "#2f4a6a", boots: "#3a2a20", hat: "cap", cap: "#f2c21a", skin: SKINS[1] };
export const WORKER2: Outfit = { ...WORKER, skin: SKINS[3], jacket: "#f28a2a" };
export const ENG: Outfit = { jacket: "#cfe0f2", pants: "#3b3f52", boots: INK, hat: "hair", hair: "#3a2a1a", skin: SKINS[1] };
export const CLERK: Outfit = { jacket: "#5d6470", pants: "#454b56", boots: INK, hat: "hair", hair: "#2a201a", moustache: "#2a201a", skin: SKINS[2] };
export const MOVER: Outfit = { jacket: "#3f6fb5", pants: "#2f4a6a", boots: "#3a2a20", hat: "cap", cap: "#3f6fb5", skin: SKINS[2] };
/** modern passengers (no top hats / bonnets) */
export const folk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const hair = ["#3a2a1a", "#d9a441", "#2a201a", "#8a4a2a", "#1a1a1a", "#c47a3a"];
  return { jacket: coats[v % 6], pants: ["#3b3f52", "#2f4a6a", "#4a3426"][v % 3], boots: "#4a3426", skin: SKINS[v % 4], hat: v % 3 === 2 ? "cap" : "hair", hair: hair[v % 6], cap: "#2a2a2a" };
};
export const MOVER2: Outfit = { ...MOVER, skin: SKINS[3], cap: "#c0302a" };

const tier = (d: number): [number, number, number] => (d < 2.4 ? [1800, 3000, 3.0] : d < 6 ? [1080, 1800, 1.8] : d < 14 ? [480, 800, 0.8] : [240, 400, 0.4]);
const light2D = (cam: CamInfo) => Math.round(Math.atan2(-cam.sun.y, cam.sun.dot(cam.right)) / (Math.PI / 4)) * (Math.PI / 4);
const tmp = new THREE.Vector3();

const LID = [0.5, 1, 1, 0.5];
const lid = (f: number, i: number) => {
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) { const k = f - s; if (k >= 0 && k < 4) return LID[k]; s += Math.round(15 + 54 * hh(i * 31 + n, 13)); }
  return 0;
};

type P = { o: Outfit; i: number; x: number; y: number; z: number; fo: FrontOpts; roll?: number; sx?: number; scale?: number; yaw?: number };
const person = (cam: CamInfo, p: P): CPlace => {
  const d = cam.pos.distanceTo(tmp.set(p.x, p.y + 1.0, p.z));
  const [w, h, k] = tier(d / (p.scale ?? 1));
  const fo: FrontOpts = { ...p.fo, light: light2D(cam), seed: (p.i % 7) + 1 };
  const key = `F|${JSON.stringify(p.o)}|${JSON.stringify(fo, (_k, v) => (typeof v === "number" ? q(v) : v))}`;
  return { key, x: p.x, y: p.y, z: p.z, roll: p.roll, sx: p.sx, scale: p.scale, yaw: p.yaw, draw: (pen: Pen) => bodyFront(pen, p.o, fo), size: [w, h, k] };
};
const blob = (out: Stage, x: number, y: number, z: number, s = 1, col = "#3a3f66") =>
  out.fx.push({ key: `blob|contact|${col}`, cw: 128, ch: 128, draw: (p) => fxContact(p, col), x, y: y + 0.02, z, w: 0.6 * s, h: 0.42 * s, flat: true });
const pop = (f: number, f0: number, n = 6) => clamp01((f - f0) / n) * (1 + 0.25 * Math.sin(clamp01((f - f0) / n) * Math.PI));
const sign = (out: Stage, key: string, draw: (p: Pen) => void, cw: number, ch: number, f: number, f0: number, x: number, y: number, z: number, w: number, h: number, rot = 0) => {
  if (f < f0) return;
  const s = pop(f, f0);
  out.fx.push({ key, cw, ch, draw, x, y, z, w: w * s, h: h * s, rot });
};
const spark = (out: Stage, f: number, f0: number, x: number, y: number, z: number, size = 0.5) => {
  if (f < f0 || f >= f0 + 14) return;
  const u = q((f - f0) / 14, 14);
  out.fx.push({ key: `spark${u}`, cw: 200, ch: 200, draw: (p) => fxSpark(p, u), x, y, z, w: size, h: size });
};
const puff = (out: Stage, f: number, f0: number, per: number, x: number, y: number, z: number, n = 2, size = 0.7) => {
  if (f < f0) return;
  for (let k = 0; k < n; k++) {
    const u = q((((f - f0) / per) + k / n) % 1, 12);
    out.fx.push({ key: `puff${u}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, u), x: x + (k - (n - 1) / 2) * 0.25, y: y + 0.2 + 0.25 * u, z, w: size * (0.6 + 0.6 * u), h: size * (0.6 + 0.6 * u), soft: true });
  }
};
/** a worker with a jackhammer at the platform edge (x, edge z) */
const jackWorker = (out: Stage, cam: CamInfo, f: number, i: number, x: number, o: Outfit, y = PH) => {
  const j = Math.sin(f * 2.7 + i) * 0.012;
  out.places.push(person(cam, { o, i, x: x + j, y: y + Math.abs(j), z: EDGE + 0.75, fo: { mode: "stand", expr: i % 2 ? "nervous" : "stern", blink: lid(f, i) } }));
  out.fx.push({ key: "jack", cw: 160, ch: 400, draw: fxJack, x: x + 0.05 + j * 2, y: y + 0.52, z: EDGE + 0.35, w: 0.36, h: 0.9 });
  puff(out, f, i * 3, 16, x + 0.05, y - 0.15, EDGE + 0.15, 2, 0.75);
};

export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [], train: trainX(id, f), trainZ: 0, shake: 0, sofa: null, slab: 1.8 };
  const O = OFFICE.x, S = SALON.x, ST = SALON.stair, E = SECT.end;
  switch (id) {
    case 1: {
      jackWorker(out, cam, f, 3, -7.2, WORKER);
      out.places.push(person(cam, { o: CHEF, i: 1, x: -3.6, y: PH, z: 3.6, fo: { mode: "stand", expr: f > GARES ? "nervous" : "neutral", look: -1, blink: lid(f, 1), prop: f > GARES + 10 ? "chin" : null } }));
      blob(out, -3.6, PH, 3.6);
      break;
    }
    case 2: {
      const wait = f >= NOUV;
      for (let i = 0; i < 6; i++) {
        const x = -4.6 + i * 0.95 + (hh(i) - 0.5) * 0.3, z = 2.5 + (i % 3) * 0.9 + hh(i, 2) * 0.3;
        const expr: Expr = wait ? (i % 2 ? "smile" : "grin") : (["neutral", "stern", "smile"] as Expr[])[i % 3];
        out.places.push(person(cam, { o: folk(i), i: 20 + i, x, y: PH, z, scale: i % 3 === 1 ? 0.95 : 1, fo: { mode: "stand", expr, blink: lid(f, 20 + i), look: wait ? 1 : 0 } }));
        blob(out, x, PH, z);
      }
      out.places.push(person(cam, { o: CHEF, i: 1, x: 1.6, y: PH, z: 2.4, fo: { mode: "stand", expr: wait ? "grin" : "stern", blink: lid(f, 1), look: 1, wave: wait ? q(Math.sin(f * 0.45), 20) : undefined } }));
      blob(out, 1.6, PH, 2.4);
      sign(out, "y2014", fxText("2014", 600, 260, "#1f3f7a"), 600, 260, f, Y2014, -1.4, 3.35, 3.4, 1.7, 0.74);
      break;
    }
    case 3: {
      const t = out.train!;
      spark(out, f, MODERN, t - 7.0, 2.9, -1.6, 0.7); spark(out, f, MODERN + 5, t - 11.5, 2.2, -1.6, 0.5);
      spark(out, f, CONFORT, t - 15, 2.6, -1.6, 0.7); spark(out, f, CONFORT + 4, t - 4, 3.2, -1.6, 0.5);
      if (f >= LARGES) { const s = pop(f, LARGES); out.fx.push({ key: "width", cw: 600, ch: 200, draw: fxWidth, x: t + 0.4, y: 2.45, z: 0, w: 3.7 * (0.6 + 0.4 * s), h: 1.0 * s }); }
      break;
    }
    case 4: {
      const white = f >= BLANC;
      const o: Outfit = white ? { ...ENG, skin: "#f7f7f2" } : ENG;
      out.places.push(person(cam, { o, i: 5, x: O, y: 0, z: -1.7, fo: { mode: "stand", expr: white ? "shock" : f >= PLANS + 20 ? "nervous" : "neutral", blink: white ? 0 : lid(f, 5), look: 0 } }));
      if (f >= PLANS) { const u = smooth((f - PLANS) / 10); out.fx.push({ key: "plan", cw: 600, ch: 400, draw: fxPlan, x: O + 0.02, y: 0.98, z: -1.05, w: 0.9 * (0.15 + 0.85 * u), h: 0.6 }); }
      if (white) sign(out, "bang", fxBang, 300, 300, f, BLANC + 1, O + 0.42, 2.15, -1.6, 0.42, 0.42, 0.2);
      break;
    }
    case 5: {
      // red dots across the map of France (plane 1.5 x 1.6 centred at O + 3, 1.75)
      const DOTS: [number, number][] = [[300, 160], [220, 300], [380, 250], [430, 160], [160, 420], [330, 420], [270, 520], [420, 470], [130, 280], [360, 330], [250, 220], [470, 300], [200, 480], [310, 300], [400, 540], [180, 360]];
      DOTS.forEach(([u, v], k) => {
        const f0 = 468 + k * 2;
        if (f < f0) return;
        const s = pop(f, f0, 4);
        out.fx.push({ key: "dot", cw: 120, ch: 120, draw: fxDot, x: O + 3.0 + ((u - 300) / 600) * 1.5, y: 1.75 + ((320 - v) / 640) * 1.6, z: -2.93, w: 0.08 * s, h: 0.08 * s });
      });
      void FR;
      break;
    }
    case 6: {
      const hit = PASSE + 4;
      if (f >= hit) {
        out.shake = Math.exp(-(f - hit) / 7) * Math.sin((f - hit) * 1.9);
        if (f < hit + 16) { const u = q((f - hit) / 16, 16); out.fx.push({ key: `sparks${u}`, cw: 400, ch: 300, draw: (p) => fxSparks(p, u), x: -10.9, y: 0.75, z: 1.1, w: 1.4, h: 1.05 }); }
        puff(out, f, hit, 24, -10.9, 0.4, 0.9, 2, 1.0);
        sign(out, "crac", fxCrac, 500, 340, f, hit + 1, -10.4, 2.9, -1.8, 1.9, 1.3, -0.12);
      }
      out.places.push(person(cam, { o: CHEF, i: 1, x: -8.4, y: PH, z: 3.0, fo: { mode: "stand", expr: f >= hit ? "shock" : "neutral", blink: f >= hit ? 0 : lid(f, 1), prop: f >= hit + 2 ? "scared" : null } }));
      blob(out, -8.4, PH, 3.0);
      break;
    }
    case 7: {
      const ask = f >= COMMENT;
      out.places.push(person(cam, { o: CHEF, i: 1, x: -9.2, y: PH, z: 2.1, fo: { mode: "stand", expr: ask ? "nervous" : "dazed", prop: "chin", blink: lid(f, 1), headTilt: f >= RENTRE ? -8 : ask ? 5 : 0, look: f >= RENTRE ? -1 : 0 } }));
      blob(out, -9.2, PH, 2.1);
      if (ask) sign(out, "q", fxQuestion, 300, 300, f, COMMENT, -8.85, PH + 2.3, 2.1, 0.55, 0.55, 0.15);
      if (f >= RENTRE) sign(out, "q2", fxQuestion, 300, 300, f, RENTRE, -9.6, PH + 2.45, 2.1, 0.4, 0.4, -0.2);
      if (f >= ATTENDS + 40) out.fx.push({ key: "sweat", cw: 120, ch: 160, draw: fxSweat, x: -9.48, y: PH + 1.66, z: 2.2, w: 0.09, h: 0.12 });
      break;
    }
    case 8: {
      out.places.push(person(cam, { o: ENG, i: 5, x: O + 0.25, y: 0, z: -1.7, fo: { mode: "stand", expr: f >= MESURES + 12 ? "nervous" : "neutral", blink: lid(f, 5), look: -1 } }));
      out.places.push(person(cam, { o: CLERK, i: 6, x: O - 1.35, y: 0, z: -1.0, fo: { mode: "stand", expr: "smile_closed", blink: lid(f, 6), look: 1 } }));
      blob(out, O - 1.35, 0, -1.0);
      const u = smooth((f - (MESURES - 4)) / 16);
      out.fx.push({ key: "folder", cw: 360, ch: 260, draw: fxFolder, x: O - 1.0 + 1.15 * u, y: 1.05 + 0.08 * Math.sin(u * Math.PI), z: -0.95 - 0.1 * u, w: 0.5, h: 0.36 });
      sign(out, "reseau", fxText("RÉSEAU", 700, 220, "#c8343a"), 700, 220, f, RESEAU, O - 1.35, 2.35, -1.0, 1.15, 0.36);
      break;
    }
    case 9: {
      // the old edge creeps toward the rails on "plus près des rails"
      out.slab = 1.8 - 0.5 * smooth((f - (PRES - 6)) / 12);
      sign(out, "y1950", fxText("1950", 520, 240, "#8a5a3a"), 520, 240, f, DIZAINES, E + 0.4, 2.3, 4.0, 1.2, 0.55);
      if (f >= PRES) sign(out, "arrow", fxArrowL(), 400, 200, f, PRES, E + 0.6, PH + 0.5, 2.0, 0.9, 0.45, Math.PI);
      if (f >= PRES + 14) sign(out, "cross", fxCross, 300, 300, f, PRES + 14, E + 2.6, 0.75, 1.35, 0.55, 0.55);
      break;
    }
    case 10: {
      const stairs = f >= W(32.9);
      if (!stairs) {
        const z = 2.4 - 2.0 * smooth((f - 890) / (PORTE - 6 - 890));
        out.sofa = { x: S, y: 0.6, z, ry: Math.PI / 2, rz: 0 };
        const walk = f < PORTE - 6, ph = (f * 0.1) % 1;
        out.places.push(person(cam, { o: MOVER, i: 7, x: S - 0.78, y: 0, z: z + 0.2, fo: { mode: walk ? "march" : "stand", phase: ph, expr: "stern", blink: lid(f, 7), lift: 40 } }));
        out.places.push(person(cam, { o: MOVER2, i: 8, x: S + 0.78, y: 0, z: z + 0.45, fo: { mode: walk ? "march" : "stand", phase: (ph + 0.5) % 1, expr: f >= SALONW ? "grin" : "neutral", blink: lid(f, 8), lift: 40 } }));
        blob(out, S - 0.78, 0, z + 0.2); blob(out, S + 0.78, 0, z + 0.45);
        if (f >= PORTE) { const u = smooth((f - PORTE) / 8); out.fx.push({ key: "tape", cw: 600, ch: 120, draw: fxTape, x: S - 0.8 + 0.8 * u, y: 1.35, z: -0.85, w: 1.6 * u + 0.01, h: 0.3 }); }
        sign(out, "check", fxCheck, 300, 300, f, SALONW, S, 2.75, -0.9, 0.55, 0.55);
      } else {
        const jam = f >= ESCALIER, k = smooth((f - W(32.9)) / (ESCALIER - W(32.9)));
        const jolt = jam ? Math.exp(-(f - ESCALIER) / 6) * Math.sin((f - ESCALIER) * 2.2) * 0.03 : 0;
        out.sofa = { x: ST, y: 0.9 + 0.45 * k + jolt, z: -0.6 - 0.9 * k, ry: Math.PI / 2, rz: 0.6 };
        out.places.push(person(cam, { o: MOVER, i: 7, x: ST + 0.12, y: 0, z: 0.55 - 0.5 * k, fo: { mode: "stand", expr: jam ? "shock" : "stern", prop: "scared", blink: jam ? 0 : lid(f, 7) } }));
        blob(out, ST + 0.12, 0, 0.55 - 0.5 * k);
        if (jam) {
          if (f < ESCALIER + 12) { const u = q((f - ESCALIER) / 12, 12); out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u), x: ST, y: 2.2, z: -2.15, w: 0.9, h: 0.9 }); }
          sign(out, "bang", fxBang, 300, 300, f, ESCALIER + 2, ST + 0.3, 2.5, -1.6, 0.45, 0.45, 0.2);
        }
      }
      void CANAPE;
      break;
    }
    case 11: {
      const xs = [-8, -3, 2, 7, 12, 17];
      xs.forEach((x, k) => jackWorker(out, cam, f, 30 + k, x, k % 2 ? WORKER2 : WORKER));
      const cx = -11 + 0.11 * (f - 1038);
      sign(out, "n1300", fxText("1 300 QUAIS", 900, 260, "#e8443a"), 900, 260, f, MILLE, cx + 7.5, 2.9, 2.6, 2.6, 0.75);
      break;
    }
    case 12: {
      const sad = f >= MALHEUR;
      out.places.push(person(cam, { o: CHEF, i: 1, x: 1.8, y: PH, z: 2.6, fo: { mode: "stand", expr: sad ? (f >= AUTRES ? "pained" : "dazed") : f >= PARFAIT ? "grin" : "smile", blink: lid(f, 1), wave: !sad && f >= PARFAIT ? q(Math.sin(f * 0.5), 20) : undefined, look: -1 } }));
      blob(out, 1.8, PH, 2.6);
      spark(out, f, PARFAIT, 0.4, 2.9, 1.6, 0.6); spark(out, f, PARFAIT + 4, -1.6, 2.2, 1.6, 0.45); spark(out, f, PARFAIT + 8, 0.9, 1.6, 1.6, 0.5);
      if (f >= AUTRES) out.fx.push({ key: "sweat", cw: 120, ch: 160, draw: fxSweat, x: 1.55, y: PH + 1.66, z: 2.7, w: 0.09, h: 0.12 });
      break;
    }
    case 13: {
      out.trainZ = -0.22;
      const bill = f >= FACTURE;
      out.places.push(person(cam, { o: CHEF, i: 1, x: 2.3, y: PH, z: 2.9, fo: { mode: "stand", expr: f >= QUATRE ? "shock" : bill ? "nervous" : "dazed", blink: f >= QUATRE ? 0 : lid(f, 1), prop: f >= QUATRE + 4 ? "scared" : null } }));
      blob(out, 2.3, PH, 2.9);
      if (bill) {
        const amt = f >= QUATRE;
        const s = pop(f, FACTURE, 8);
        out.fx.push({ key: amt ? "bill1" : "bill0", cw: 520, ch: 700, draw: fxBill(amt), x: 2.95, y: PH + 1.3, z: 2.2, w: 0.9 * s, h: 1.28 * s, rot: -0.06 });
        if (amt && f < QUATRE + 12) { const u = q((f - QUATRE) / 12, 12); out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u, "#ffd84a"), x: 2.95, y: PH + 1.0, z: 2.15, w: 1.2, h: 1.2 }); }
      }
      if (f >= POUR + 10) sign(out, "ruler", fxRuler, 700, 200, f, POUR + 10, 4.55, PH + 0.04, 1.3, 0.5, 0.14, 0);
      break;
    }
  }
  void FPS;
  return out;
};
