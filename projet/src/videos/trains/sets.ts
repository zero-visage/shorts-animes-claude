// Static geometry of the sets: the station (origin), the end-on platform section (x = 200), the office (x = -100) and
// the salon + old staircase (x = -200). Everything goes through Batch + two-tone materials so the ink pass outlines it.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, quad } from "../bridge/build";
import { grassHD, beam, planksHD, roofHD, facadeHD, stoneHD } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { concreteTex, oldStoneTex, ballastTex, edgeTex, trainSideTex, trainFrontTex, buildingSignTex, clockTex, officeWallTex, mapTex, stairWallTex, salonWallTex, blueprintTex } from "./props";
import { EDGE, PH, HALF, PLAT, SECT, OFFICE, SALON, V3 } from "./story";

export type Mats = Record<string, THREE.Material>;
const M4 = (x: number, y: number, z: number, ry = 0, s: V3 = [1, 1, 1], rx = 0, rz = 0) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(...s));

export const makeMats = (): Mats => {
  const M: Mats = {};
  M.grass = lam("grassHD", () => ({ map: grassHD() }));
  M.concrete = lam("concrete", () => ({ map: concreteTex() }));
  M.old = lam("oldPlatform", () => ({ map: oldStoneTex() }));
  M.ballast = lam("ballast", () => ({ map: ballastTex() }));
  M.edge = lam("edgeStripe", () => ({ map: edgeTex() }));
  M.wood = lam("wood", () => ({ map: beam() }));
  M.sleeper = lam("sleeper", () => ({ color: "#6b5a4a" }));
  M.floor = lam("planksHD", () => ({ map: planksHD() }));
  M.roof = lam("roofHD#8a4a3a", () => ({ map: roofHD("#8a4a3a") }));
  M.facade = lam("stationFacade", () => ({ map: facadeHD("gare20x6", 20, 6, { wall: "#e7d6b5", shutter: "#3f6fb5", door: true }) }));
  M.facadeSide = lam("stationSide", () => ({ map: facadeHD("gare8x6", 8, 6, { wall: "#e7d6b5", shutter: "#3f6fb5" }) }));
  M.house = lam("houseFac", () => ({ map: facadeHD("house8x5", 8, 5, { wall: "#f0c99a", shutter: "#5d7a3a", door: true }) }));
  M.plaster = lam("plaster", () => ({ color: "#e7d6b5" }));
  M.leaf = lam("leaf", () => ({ color: "#5aa046" }));
  M.leaf2 = lam("leaf2", () => ({ color: "#4b8c40" }));
  M.bark = lam("bark", () => ({ color: "#7a5236" }));
  M.dark = lam("darkWood", () => ({ color: "#5a3b26" }));
  M.metal = lam("metalGrey", () => ({ color: "#5d6470" }));
  M.post = lam("postGreen", () => ({ color: "#2f5f4a" }));
  M.rail = twoTone(new THREE.MeshPhongMaterial({ color: "#9aa0a8", specular: "#ffffff", shininess: 80 }), 0.2);
  M.body = lam("trainBody", () => ({ color: "#e8ecf1" }));
  M.roofT = lam("trainRoof", () => ({ color: "#9aa3ad" }));
  M.bogie = lam("bogie", () => ({ color: "#2d3038" }));
  M.blue = lam("trainBlue", () => ({ color: "#2b5fa8" }));
  M.side0 = lam("trainSide0", () => ({ map: trainSideTex(0) }));
  M.side1 = lam("trainSide1", () => ({ map: trainSideTex(1) }));
  M.front = lam("trainFront", () => ({ map: trainFrontTex() }));
  M.sign = new THREE.MeshBasicMaterial({ map: buildingSignTex(), color: 0xe0e0e0 });
  M.clock = lam("clockFace", () => ({ map: clockTex() }));
  M.office = lam("officeWall", () => ({ map: officeWallTex() }));
  M.map = lam("mapFR", () => ({ map: mapTex() }));
  M.blueprint = lam("blueprintDesk", () => ({ map: blueprintTex() }));
  M.stair = lam("stairWall", () => ({ map: stairWallTex() }));
  M.salon = lam("salonWall", () => ({ map: salonWallTex() }));
  M.stone = lam("stoneHD", () => ({ map: stoneHD() }));
  M.sofa = lam("sofa", () => ({ color: "#c0563e" }));
  M.cushion = lam("cushion", () => ({ color: "#d9714f" }));
  M.paper = lam("paperW", () => ({ color: "#f3f0e8" }));
  M.win = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.35, 1.5, 1.7) });
  M.lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.3) });
  return M;
};

/** horizontal quad at height y, uv in metres / tile */
export const flat = (x0: number, x1: number, z0: number, z1: number, y: number, tile: number) =>
  quad(V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0), (x1 - x0) / tile, (z1 - z0) / tile);

const tree = (b: Batch, M: Mats, x: number, z: number, s: number, seed: number) => {
  b.add(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, 2.4 * s, 8), M.bark, M4(x, 1.2 * s, z));
  const blobs: [number, number, number, number][] = [[0, 2.9, 0, 1.25], [0.7, 2.5, 0.2, 0.85], [-0.65, 2.6, -0.1, 0.9], [0.1, 3.5, -0.1, 0.8]];
  blobs.forEach(([dx, dy, dz, r], i) => b.add(new THREE.IcosahedronGeometry(r * s, 2), (i + seed) % 2 ? M.leaf : M.leaf2, M4(x + dx * s, dy * s, z + dz * s)));
};
const gable = (b: Batch, M: Mats, x0: number, x1: number, z0: number, z1: number, y: number, rise: number) => {
  const o = 0.4, xm = (x0 + x1) / 2;
  const P = (x: number, yy: number, z: number) => V(x, yy, z);
  b.add(quad(P(x0 - o, y, z1 + o), P(x1 + o, y, z1 + o), P(x1 + o, y + rise, (z0 + z1) / 2), P(x0 - o, y + rise, (z0 + z1) / 2), (x1 - x0) / 3, 1.5), M.roof);
  b.add(quad(P(x1 + o, y, z0 - o), P(x0 - o, y, z0 - o), P(x0 - o, y + rise, (z0 + z1) / 2), P(x1 + o, y + rise, (z0 + z1) / 2), (x1 - x0) / 3, 1.5), M.roof);
  void xm;
};

// ---------------- track + platforms ----------------
const track = (b: Batch, M: Mats, x0: number, x1: number) => {
  b.add(boxGeo(V(x0, -0.05, -2.2), V(x1, 0.08, 2.2), 2), M.ballast);
  for (let x = x0 + 0.3; x < x1; x += 0.65) b.add(new THREE.BoxGeometry(0.26, 0.08, 2.6), M.sleeper, M4(x, 0.11, 0));
  for (const z of [-0.72, 0.72]) b.add(boxGeo(V(x0, 0.15, z - 0.04), V(x1, 0.24, z + 0.04)), M.rail);
};
/** platform block: concrete sides, top, stripe at the edge facing the track (edgeZ), going outward in +s * z */
export const platform = (b: Batch, M: Mats, x0: number, x1: number, edgeZ: number, backZ: number, mat = M.concrete) => {
  const za = Math.min(edgeZ, backZ), zb = Math.max(edgeZ, backZ);
  b.add(boxGeo(V(x0, 0, za), V(x1, PH, zb), 1.5), mat);
  const s = Math.sign(backZ - edgeZ), z0 = edgeZ, z1 = edgeZ + s * 0.55;
  b.add(quad(V(x0, PH + 0.004, Math.max(z0, z1)), V(x1, PH + 0.004, Math.max(z0, z1)), V(x1, PH + 0.004, Math.min(z0, z1)), V(x0, PH + 0.004, Math.min(z0, z1)), (x1 - x0) / 2, 1,
  ), M.edge);
};

export const buildStation = (R: THREE.Object3D, M: Mats) => {
  const b = new Batch();
  b.add(flat(-120, 120, -80, 80, -0.02, 2), M.grass);
  track(b, M, -120, 120);
  platform(b, M, PLAT.x0, PLAT.x1, EDGE, 8.5);
  platform(b, M, PLAT.x0 - 6, PLAT.x1 + 6, -1.6, -7.5);
  // station building
  const bx0 = -8, bx1 = 12, bz0 = 9, bz1 = 15, bh = 6;
  b.add(boxGeo(V(bx0, 0, bz0), V(bx1, bh, bz1)), M.plaster);
  b.add(quad(V(bx1, 0, bz0 - 0.01), V(bx0, 0, bz0 - 0.01), V(bx0, bh, bz0 - 0.01), V(bx1, bh, bz0 - 0.01)), M.facade);
  for (const [x, s] of [[bx0 - 0.01, -1], [bx1 + 0.01, 1]] as const)
    b.add(s < 0 ? quad(V(x, 0, bz0), V(x, 0, bz1), V(x, bh, bz1), V(x, bh, bz0)) : quad(V(x, 0, bz1), V(x, 0, bz0), V(x, bh, bz0), V(x, bh, bz1)), M.facadeSide);
  gable(b, M, bx0, bx1, bz0, bz1, bh, 2.6);
  b.add(new THREE.PlaneGeometry(3.6, 0.9).rotateY(Math.PI), M.sign, M4(2, 4.6, bz0 - 0.06));
  // platform furniture: lamp posts, benches, clock, a small shelter roof
  for (let x = -8; x <= 42; x += 8) {
    b.add(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 8), M.post, M4(x, PH + 1.7, 6.2));
    b.add(boxGeo(V(x - 0.25, PH + 3.3, 5.9), V(x + 0.25, PH + 3.5, 6.5)), M.post);
    b.add(boxGeo(V(x - 0.2, PH + 3.22, 5.95), V(x + 0.2, PH + 3.3, 6.45)), M.lamp);
  }
  for (const x of [-4, 12, 28]) {
    b.add(boxGeo(V(x - 1, PH + 0.42, 6.8), V(x + 1, PH + 0.5, 7.3)), M.wood);
    b.add(boxGeo(V(x - 1, PH + 0.55, 7.3), V(x + 1, PH + 1.0, 7.38)), M.wood);
    for (const s of [-0.9, 0.9]) b.add(boxGeo(V(x + s - 0.05, PH, 6.85), V(x + s + 0.05, PH + 0.42, 7.3)), M.metal);
  }
  b.add(new THREE.CylinderGeometry(0.07, 0.07, 2.9, 8), M.post, M4(6, PH + 1.45, 4.6));
  b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24).rotateX(Math.PI / 2), M.post, M4(6, PH + 3.2, 4.6));
  b.add(new THREE.CircleGeometry(0.38, 32).rotateY(Math.PI), M.clock, M4(6, PH + 3.2, 4.53));
  b.add(new THREE.CircleGeometry(0.38, 32), M.clock, M4(6, PH + 3.2, 4.67));
  // opposite side: fence, grass, trees; behind the building: houses and trees
  for (let x = -40; x <= 60; x += 0.5) b.add(new THREE.BoxGeometry(0.05, 1.1, 0.05), M.post, M4(x, PH + 0.55, -7.4));
  for (const y of [0.35, 1.0]) b.add(new THREE.BoxGeometry(100, 0.05, 0.05), M.post, M4(10, PH + y, -7.4));
  for (const [x, z, s] of [[-30, -12, 1.2], [-18, -14, 1.0], [-6, -11, 1.3], [8, -13, 1.1], [22, -12, 1.25], [36, -14, 1.0], [-24, 13, 1.2], [18, 12, 1.1], [30, 11, 1.3], [-14, 18, 1.0], [-40, 6, 1.3], [-36, -6, 1.1]] as const)
    tree(b, M, x, z, s, Math.round(x));
  for (const [x, z] of [[-26, 22], [20, 24], [34, 20], [-8, 26]] as const) {
    b.add(boxGeo(V(x - 4, 0, z - 3), V(x + 4, 5, z + 3)), M.plaster);
    b.add(quad(V(x + 4, 0, z - 3.01), V(x - 4, 0, z - 3.01), V(x - 4, 5, z - 3.01), V(x + 4, 5, z - 3.01)), M.house);
    gable(b, M, x - 4, x + 4, z - 3, z + 3, 5, 2.4);
  }
  b.build(R);
};

/** end-on section: track coming at the camera, a stone platform whose end face looks at +x */
export const buildSection = (R: THREE.Object3D, M: Mats) => {
  const b = new Batch(), X = SECT.x, E = SECT.end;
  b.add(flat(X - 80, X + 60, -60, 60, -0.02, 2), M.grass);
  track(b, M, X - 80, X + 30);
  platform(b, M, X - 60, E, 1.8, 7, M.old);
  platform(b, M, X - 60, E, -1.8, -7, M.old);
  for (const [x, z, s] of [[X - 14, 10, 1.2], [X - 24, -10, 1.1], [X - 32, 11, 1.3], [X - 8, -11, 1.0], [X + 8, 9, 1.1], [X + 6, -9, 1.2]] as const) tree(b, M, x, z, s, Math.round(x));
  for (let x = X - 56; x <= E - 2; x += 8) b.add(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), M.post, M4(x, PH + 1.6, 5.5));
  b.build(R);
};

export const buildOffice = (R: THREE.Object3D, M: Mats) => {
  const b = new Batch(), X = OFFICE.x;
  b.add(flat(X - 7, X + 7, -3, 4, 0, 2.5), M.floor);
  b.add(quad(V(X - 7, 0, -3), V(X + 7, 0, -3), V(X + 7, 3.2, -3), V(X - 7, 3.2, -3), 14 / 3, 3.2 / 3), M.office);
  b.add(quad(V(X - 7, 0, 4), V(X - 7, 0, -3), V(X - 7, 3.2, -3), V(X - 7, 3.2, 4), 7 / 3, 3.2 / 3), M.office);
  // window (day) behind the engineer, map of France on the right
  b.add(new THREE.PlaneGeometry(1.3, 1.1), M.win, M4(X - 1.6, 1.8, -2.98));
  b.add(boxGeo(V(X - 2.3, 1.2, -3), V(X - 0.9, 1.26, -2.85)), M.dark);
  b.add(new THREE.PlaneGeometry(1.5, 1.6), M.map, M4(X + 3.0, 1.75, -2.97));
  // desk with a blueprint on it
  b.add(boxGeo(V(X - 1.0, 0.75, -1.2), V(X + 1.0, 0.82, -0.5), 1, true), M.wood);
  for (const [x, z] of [[X - 0.94, -1.15], [X + 0.94, -1.15], [X - 0.94, -0.55], [X + 0.94, -0.55]] as const) b.add(boxGeo(V(x - 0.04, 0, z - 0.04), V(x + 0.04, 0.75, z + 0.04)), M.dark);
  b.add(flat(X - 0.6, X + 0.2, -1.1, -0.6, 0.825, 0.8), M.blueprint);
  b.add(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10).rotateZ(Math.PI / 2), M.paper, M4(X + 0.55, 0.87, -0.85));
  // filing cabinet + lamp
  b.add(boxGeo(V(X + 1.4, 0, -2.9), V(X + 2.0, 1.3, -2.3), 1), M.metal);
  b.add(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), M.metal, M4(X - 0.8, 1.02, -1.0));
  b.add(new THREE.ConeGeometry(0.14, 0.14, 12), M.metal, M4(X - 0.8, 1.25, -1.0));
  b.build(R);
};

export const buildSalon = (R: THREE.Object3D, M: Mats) => {
  const b = new Batch(), X = SALON.x, S = SALON.stair;
  b.add(flat(X - 8, X + 12, -8, 6, 0, 2.5), M.floor);
  // salon wall with a wide doorway (x -0.8 .. +0.8)
  const wall = (x0: number, x1: number, y0: number, y1: number) => b.add(quad(V(x0, y0, -1), V(x1, y0, -1), V(x1, y1, -1), V(x0, y1, -1), (x1 - x0) / 3, (y1 - y0) / 3), M.salon);
  wall(X - 6, X - 0.8, 0, 3); wall(X + 0.8, X + 4, 0, 3); wall(X - 0.8, X + 0.8, 2.2, 3);
  b.add(boxGeo(V(X - 0.9, 0, -1.08), V(X - 0.8, 2.25, -0.92)), M.dark); b.add(boxGeo(V(X + 0.8, 0, -1.08), V(X + 0.9, 2.25, -0.92)), M.dark);
  b.add(boxGeo(V(X - 0.9, 2.2, -1.08), V(X + 0.9, 2.3, -0.92)), M.dark);
  b.add(flat(X - 4, X + 4, -6, -1, 0.004, 2.5), M.floor);
  b.add(quad(V(X - 4, 0, -6), V(X + 4, 0, -6), V(X + 4, 3, -6), V(X - 4, 3, -6), 8 / 3, 1), M.salon);
  b.add(new THREE.PlaneGeometry(1.0, 1.2), M.win, M4(X + 1.6, 1.6, -5.98));
  // the old staircase: narrow walls 1.0 m apart, steps climbing toward -z
  for (const s of [-1, 1]) {
    const x = S + s * 0.5;
    b.add(s < 0 ? quad(V(x, 0, 2), V(x, 0, -6), V(x, 5, -6), V(x, 5, 2), 8 / 3, 5 / 3) : quad(V(x, 0, -6), V(x, 0, 2), V(x, 5, 2), V(x, 5, -6), 8 / 3, 5 / 3), M.stair);
  }
  for (let i = 0; i < 16; i++) b.add(boxGeo(V(S - 0.5, 0, -0.3 - (i + 1) * 0.3), V(S + 0.5, 0.2 * (i + 1), -0.3 - i * 0.3)), M.wood);
  b.add(quad(V(S - 0.5, 4.2, -6), V(S + 0.5, 4.2, -6), V(S + 0.5, 5, -6), V(S - 0.5, 5, -6)), M.stair);
  b.add(quad(V(S - 0.5, 2.25, -2.2), V(S + 0.5, 2.25, -2.2), V(S + 0.5, 5, -2.2), V(S - 0.5, 5, -2.2)), M.stair); // low ceiling over the stairs
  b.add(boxGeo(V(S - 0.55, 2.1, -2.32), V(S + 0.55, 2.26, -2.1)), M.dark);
  b.build(R);
};

// ---------------- moving pieces ----------------
/** the train: two 18 m cars, nose at local x = 0 pointing +x, centred on z = 0 */
export const buildTrain = (G: THREE.Object3D, M: Mats) => {
  const b = new Batch(), y0 = 0.35, y1 = 3.9, h = HALF, L = 18, gap = 0.4;
  for (let c = 0; c < 2; c++) {
    const xa = -(c + 1) * L - c * gap, xb = -c * L - c * gap - (c === 0 ? 1.4 : 0);
    const side = c ? M.side1 : M.side0;
    b.add(quad(V(xa, y0, h), V(xb, y0, h), V(xb, y1, h), V(xa, y1, h), (xb - xa) / L, 1), side);
    b.add(quad(V(xb, y0, -h), V(xa, y0, -h), V(xa, y1, -h), V(xb, y1, -h), 0, 1, (xb - xa) / L, 0), side);
    b.add(boxGeo(V(xa, y1 - 0.01, -h + 0.05), V(xb, y1 + 0.12, h - 0.05)), M.roofT);
    b.add(boxGeo(V(xa + 3, y1 + 0.1, -0.6), V(xa + 6, y1 + 0.42, 0.6), 1), M.roofT);
    b.add(boxGeo(V(xa, y0, -h + 0.02), V(xb, y0 + 0.02, h - 0.02)), M.bogie);
    if (c) b.add(boxGeo(V(xb, y0, -h), V(xb + 0.01, y1, h)), M.body);
    b.add(boxGeo(V(xa - 0.01, y0, -h), V(xa, y1, h)), M.body);
    for (const bx of [xa + 2.5, xb - 2.5]) {
      b.add(boxGeo(V(bx - 1.3, 0.22, -1.1), V(bx + 1.3, y0 + 0.02, 1.1)), M.bogie);
      for (const dx of [-0.8, 0.8]) for (const z of [-0.74, 0.74]) b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16).rotateX(Math.PI / 2), M.metal, M4(bx + dx, 0.42, z));
    }
  }
  // the cab nose: lower block + sloped windscreen face
  const xb = -1.4;
  b.add(boxGeo(V(xb, y0, -h), V(0, 1.75, h)), M.blue);
  b.add(quad(V(0, 1.75, h), V(0, 1.75, -h), V(xb, y1, -h), V(xb, y1, h)), M.front);
  for (const s of [-1, 1]) {
    const z = s * h, A = [xb, 1.75, z], B = [0, 1.75, z], C = [xb, y1, z];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute((s > 0 ? [A, B, C] : [A, C, B]).flat(), 3)); g.computeVertexNormals();
    b.add(g, M.body);
  }
  b.add(boxGeo(V(-0.01, 0.95, -1.15), V(0.03, 1.2, -0.7)), M.lamp);
  b.add(boxGeo(V(-0.01, 0.95, 0.7), V(0.03, 1.2, 1.15)), M.lamp);
  b.build(G);
};

/** sofa, local origin at the centre of the seat base, long axis x */
export const buildSofa = (G: THREE.Object3D, M: Mats) => {
  const b = new Batch();
  b.add(boxGeo(V(-1.0, 0, -0.42), V(1.0, 0.42, 0.42), 1, true), M.sofa);
  b.add(boxGeo(V(-1.0, 0.42, -0.42), V(1.0, 0.95, -0.2), 1, true), M.sofa);
  for (const s of [-1, 1]) b.add(boxGeo(V(s > 0 ? 0.8 : -1.0, 0.42, -0.42), V(s > 0 ? 1.0 : -0.8, 0.7, 0.42), 1, true), M.sofa);
  for (const s of [-1, 1]) b.add(boxGeo(V(s > 0 ? 0.02 : -0.78, 0.42, -0.2), V(s > 0 ? 0.78 : -0.02, 0.56, 0.4), 1, true), M.cushion);
  b.build(G);
};
