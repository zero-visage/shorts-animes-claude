// Painted textures and 2D effect drawings for the trains short.
import { ctex } from "../bridge/paint";
import { Pen, INK, mix } from "../bridge/toon";

const speck = (g: CanvasRenderingContext2D, r: () => number, w: number, h: number, cols: string[], n: number, s0: number, s1: number) => {
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[Math.floor(r() * cols.length)];
    const x = r() * w, y = r() * h, s = s0 + r() * (s1 - s0);
    g.beginPath(); g.ellipse(x, y, s, s * (0.5 + r() * 0.5), r() * 3, 0, Math.PI * 2); g.fill();
  }
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, fill: string, stroke = INK, lw = size * 0.12) => {
  g.font = `900 ${size}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  if (lw > 0) { g.lineWidth = lw; g.strokeStyle = stroke; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};

// ---------------- textures ----------------
export const concreteTex = () => ctex("concrete", 512, 512, (g, r) => {
  g.fillStyle = "#c9c3b8"; g.fillRect(0, 0, 512, 512);
  speck(g, r, 512, 512, ["#bdb6aa", "#d3cdc2", "#b4ada0"], 500, 2, 8);
  g.strokeStyle = "#a9a296"; g.lineWidth = 3; for (let x = 0; x <= 512; x += 256) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
});
export const oldStoneTex = () => ctex("oldPlatform", 512, 512, (g, r) => {
  g.fillStyle = "#a38f78"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) for (let x = (y / 64) % 2 ? -64 : 0; x < 512; x += 128) {
    g.fillStyle = mix("#b49e84", "#8f7b66", r()); g.fillRect(x + 4, y + 4, 120, 56);
  }
  speck(g, r, 512, 512, ["#7d6a57", "#c2ad92"], 300, 1, 4);
});
export const ballastTex = () => ctex("ballast", 512, 512, (g, r) => {
  g.fillStyle = "#8b8178"; g.fillRect(0, 0, 512, 512);
  speck(g, r, 512, 512, ["#a39a90", "#6f665e", "#b8afa4", "#7b726a"], 2200, 4, 10);
});
export const edgeTex = () => ctex("edgeStripe", 256, 64, (g) => {
  g.fillStyle = "#f4f1e8"; g.fillRect(0, 0, 256, 64);
  g.fillStyle = "#f2c230"; g.fillRect(0, 38, 256, 26);
  g.fillStyle = "#d9a91c"; for (let x = 6; x < 256; x += 18) for (let y = 43; y < 62; y += 9) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); }
});
/** one car side: 18 m x 3.55 m (y 0.35 .. 3.9), u along x */
export const trainSideTex = (seed: number) => ctex("trainSide" + seed, 2048, 404, (g, r) => {
  const mx = 2048 / 18, my = 404 / 3.55, Y = (y: number) => 404 - (y - 0.35) * my;
  g.fillStyle = "#e8ecf1"; g.fillRect(0, 0, 2048, 404);
  g.fillStyle = "#2b5fa8"; g.fillRect(0, Y(1.05), 2048, Y(0.35) - Y(1.05));       // blue skirt
  g.fillStyle = "#c8343a"; g.fillRect(0, Y(1.15), 2048, 10);                      // red line
  g.fillStyle = "#3a4152"; g.fillRect(0, Y(2.9), 2048, Y(1.75) - Y(2.9));         // window band
  // windows with passengers
  for (let x = 0.6; x < 17.6; x += 1.45) {
    if (Math.abs(x - 4.2) < 1.0 || Math.abs(x - 13.8) < 1.0) continue;
    const X0 = x * mx, X1 = (x + 1.15) * mx;
    g.fillStyle = "#9cc2e2"; rr(g, X0, Y(2.8), X1 - X0, Y(1.85) - Y(2.8), 14); g.fill();
    g.fillStyle = "#c4dcf0"; g.beginPath(); g.moveTo(X0 + 20, Y(2.75)); g.lineTo(X0 + 60, Y(2.75)); g.lineTo(X0 + 30, Y(1.9)); g.lineTo(X0 + 5, Y(1.9)); g.fill();
    if (r() < 0.75) {
      const hx = X0 + 40 + r() * (X1 - X0 - 80), skin = ["#ffe2c2", "#f5c9a0", "#c99067", "#ecd0b6"][Math.floor(r() * 4)];
      g.fillStyle = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#7b5ac9"][Math.floor(r() * 5)];
      rr(g, hx - 34, Y(2.15), 68, Y(1.85) - Y(2.15), 16); g.fill();
      g.fillStyle = skin; g.beginPath(); g.arc(hx, Y(2.35), 24, 0, 7); g.fill();
      g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
      g.fillStyle = INK; g.beginPath(); g.arc(hx - 8, Y(2.37), 3.5, 0, 7); g.arc(hx + 8, Y(2.37), 3.5, 0, 7); g.fill();
    }
    g.strokeStyle = INK; g.lineWidth = 5; rr(g, X0, Y(2.8), X1 - X0, Y(1.85) - Y(2.8), 14); g.stroke();
  }
  // doors
  for (const x of [4.2, 13.8]) {
    const X0 = (x - 0.75) * mx, X1 = (x + 0.75) * mx;
    g.fillStyle = "#f2c230"; g.fillRect(X0, Y(3.1), X1 - X0, Y(0.45) - Y(3.1));
    g.fillStyle = "#9cc2e2"; for (const k of [0, 1]) { const a = X0 + 12 + k * (X1 - X0) / 2; rr(g, a, Y(2.8), (X1 - X0) / 2 - 24, Y(1.6) - Y(2.8), 10); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(X0, Y(3.1), X1 - X0, Y(0.45) - Y(3.1));
    g.beginPath(); g.moveTo((X0 + X1) / 2, Y(3.1)); g.lineTo((X0 + X1) / 2, Y(0.45)); g.stroke();
  }
  text(g, "TER", 9 * mx, Y(1.45), 44, "#ffffff", INK, 6);
  g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(2, 2, 2044, 400);
});
/** cab front: 2.9 m x 2.2 m sloped face (windscreen on top) */
export const trainFrontTex = () => ctex("trainFront", 512, 400, (g) => {
  g.fillStyle = "#e8ecf1"; g.fillRect(0, 0, 512, 400);
  g.fillStyle = "#1f2a3c"; rr(g, 40, 20, 432, 190, 40); g.fill();
  g.fillStyle = "#3d5878"; g.beginPath(); g.moveTo(80, 40); g.lineTo(200, 40); g.lineTo(120, 190); g.lineTo(60, 190); g.fill();
  g.strokeStyle = INK; g.lineWidth = 8; rr(g, 40, 20, 432, 190, 40); g.stroke();
  g.fillStyle = "#2b5fa8"; g.fillRect(0, 290, 512, 110);
  g.fillStyle = "#c8343a"; g.fillRect(0, 276, 512, 12);
  for (const x of [80, 432]) { g.fillStyle = "#fff6c8"; g.beginPath(); g.ellipse(x, 245, 34, 20, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(3, 3, 506, 394);
});
export const buildingSignTex = () => ctex("gareSign", 512, 128, (g) => {
  g.fillStyle = "#1f3f7a"; rr(g, 4, 4, 504, 120, 18); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  text(g, "GARE", 256, 66, 84, "#ffffff", INK, 0);
});
export const clockTex = () => ctex("clockFace", 256, 256, (g) => {
  g.fillStyle = "#fbf8f0"; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.lineWidth = 8; g.beginPath(); g.moveTo(128 + 92 * Math.cos(a), 128 + 92 * Math.sin(a)); g.lineTo(128 + 108 * Math.cos(a), 128 + 108 * Math.sin(a)); g.stroke(); }
  g.lineWidth = 12; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 60); g.stroke(); g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(185, 150); g.stroke();
});
export const officeWallTex = () => ctex("officeWall", 512, 512, (g) => {
  g.fillStyle = "#d6dde3"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#c8d0d8"; for (let x = 0; x < 512; x += 64) g.fillRect(x, 0, 30, 512);
  g.fillStyle = "#9aa6b2"; g.fillRect(0, 440, 512, 72);
});
/** France with red dots: 600 x 600 (the dots are separate fx so they can pop) */
export const FR: [number, number][] = [[300, 40], [370, 70], [470, 110], [520, 170], [500, 260], [470, 330], [500, 400], [520, 470], [450, 520],
  [380, 540], [300, 520], [230, 560], [150, 530], [140, 440], [110, 360], [80, 300], [40, 250], [90, 210], [170, 200], [200, 150], [250, 100]];
export const mapTex = () => ctex("mapFR", 600, 640, (g) => {
  g.fillStyle = "#f3ead2"; g.fillRect(0, 0, 600, 640);
  g.strokeStyle = "#5a4a3a"; g.lineWidth = 16; g.strokeRect(8, 8, 584, 624);
  g.fillStyle = "#9cc48a"; g.beginPath(); FR.forEach(([x, y], i) => (i ? g.lineTo(x, y + 30) : g.moveTo(x, y + 30))); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  g.strokeStyle = "#7a6a5a"; g.lineWidth = 4; g.setLineDash([12, 10]);
  for (const [a, b] of [[[300, 100], [250, 330]], [[300, 100], [450, 220]], [[250, 330], [400, 470]], [[250, 330], [150, 480]], [[300, 100], [120, 260]]] as [[number, number], [number, number]][]) {
    g.beginPath(); g.moveTo(a[0], a[1] + 30); g.lineTo(b[0], b[1] + 30); g.stroke();
  }
  g.setLineDash([]);
});
export const blueprintTex = () => ctex("blueprint", 600, 400, (g) => {
  g.fillStyle = "#2c5fa3"; g.fillRect(0, 0, 600, 400);
  g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2; for (let x = 0; x < 600; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 400); g.stroke(); }
  for (let y = 0; y < 400; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(600, y); g.stroke(); }
  g.strokeStyle = "#ffffff"; g.lineWidth = 6;
  g.strokeRect(150, 70, 170, 230);                                   // train cross-section
  g.beginPath(); g.moveTo(170, 70); g.quadraticCurveTo(235, 30, 300, 70); g.stroke();
  g.strokeRect(330, 230, 220, 70);                                    // platform
  g.beginPath(); g.moveTo(130, 330); g.lineTo(560, 330); g.stroke();  // rails level
  g.strokeStyle = "#ff5a4a"; g.lineWidth = 8; g.beginPath(); g.ellipse(325, 265, 38, 46, 0, 0, 7); g.stroke();
  g.fillStyle = "#ffffff"; g.font = "bold 30px Arial"; g.textAlign = "left"; g.fillText("QUAI", 400, 270);
  g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.strokeRect(6, 6, 588, 388);
});
export const stairWallTex = () => ctex("stairWall", 512, 512, (g, r) => {
  g.fillStyle = "#c9a77a"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#b8956a"; for (let x = 0; x < 512; x += 48) g.fillRect(x, 0, 18, 512);
  speck(g, r, 512, 512, ["rgba(90,60,40,0.18)"], 140, 4, 18);
  g.fillStyle = "#7a5236"; g.fillRect(0, 430, 512, 82);
});
export const salonWallTex = () => ctex("salonWall", 512, 512, (g) => {
  g.fillStyle = "#e9dcc4"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#d9c7a6"; for (let y = 0; y < 512; y += 80) for (let x = (y / 80) % 2 ? 40 : 0; x < 512; x += 80) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
  g.fillStyle = "#8a5a3c"; g.fillRect(0, 470, 512, 42);
});

// ---------------- 2D effects ----------------
/** rounded sign with text, w x h canvas */
export const fxText = (s: string, w: number, h: number, bg: string, fg = "#ffffff", size = h * 0.55) => (p: Pen) => {
  const g = p.g;
  if (bg !== "none") { g.fillStyle = bg; rr(g, 10, 10, w - 20, h - 20, h * 0.18); g.fill(); g.strokeStyle = INK; g.lineWidth = 14; g.stroke(); }
  text(g, s, w / 2, h / 2 + 4, size, fg, INK, bg === "none" ? size * 0.14 : 0);
};
/** double arrow <-> across 600 x 200 */
export const fxWidth = (p: Pen) => {
  const pts: [number, number][] = [[20, 100], [130, 20], [130, 70], [470, 70], [470, 20], [580, 100], [470, 180], [470, 130], [130, 130], [130, 180]];
  p.poly(pts, "#ffd84a", 12);
};
/** arrow pointing left, 400 x 200 */
export const fxArrowL = (col = "#e8443a") => (p: Pen) => {
  p.poly([[20, 100], [160, 15], [160, 65], [380, 65], [380, 135], [160, 135], [160, 185]], col, 12);
};
/** 4-point sparkle, 200 x 200, t 0..1 */
export const fxSpark = (p: Pen, t: number) => {
  const s = Math.sin(Math.min(1, t) * Math.PI), r = 90 * s, k = 18 * s;
  if (r < 2) return;
  p.poly([[100, 100 - r], [100 + k, 100 - k], [100 + r, 100], [100 + k, 100 + k], [100, 100 + r], [100 - k, 100 + k], [100 - r, 100], [100 - k, 100 - k]], "#fff6c0", 8);
};
/** jackhammer standing on its bit, 160 x 400 (bit tip at the bottom centre) */
export const fxJack = (p: Pen) => {
  p.poly([[20, 40], [140, 40], [140, 72], [20, 72]], "#2f2f36", 9);            // handle bar
  p.poly([[50, 70], [110, 70], [116, 250], [44, 250]], "#e2b52a", 10);          // body
  p.poly([[58, 120], [102, 120], [102, 160], [58, 160]], "#2f2f36", 6);
  p.poly([[66, 250], [94, 250], [90, 360], [80, 392], [70, 360]], "#8a8f99", 9); // bit
};
/** sparks fan, 400 x 300, t 0..1 */
export const fxSparks = (p: Pen, t: number) => {
  for (let i = 0; i < 9; i++) {
    const a = (-150 + i * 15) * Math.PI / 180, d0 = 30 + 200 * t, d1 = d0 + 50 * (1 - t);
    p.stroke([[200 + d0 * Math.cos(a), 260 + d0 * Math.sin(a)], [200 + d1 * Math.cos(a), 260 + d1 * Math.sin(a)]], 12 * (1 - t) + 4, i % 2 ? "#ffd84a" : "#ff8a2a");
  }
};
/** comic "CRAC !" burst, 500 x 340 */
export const fxCrac = (p: Pen) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, rr2 = i % 2 ? 150 : 220; pts.push([250 + rr2 * Math.cos(a), 170 + rr2 * 0.66 * Math.sin(a)]); }
  p.poly(pts, "#ffd84a", 12);
  text(p.g, "CRAC !", 250, 176, 92, "#e8443a", INK, 12);
};
export const fxCheck = (p: Pen) => {
  p.ell(150, 150, 130, 130, "#4cbf5a", 14);
  p.stroke([[85, 155], [135, 205], [220, 100]], 34, "#ffffff");
};
export const fxCross = (p: Pen) => {
  p.ell(150, 150, 130, 130, "#e8443a", 14);
  p.stroke([[95, 95], [205, 205]], 34, "#ffffff"); p.stroke([[205, 95], [95, 205]], 34, "#ffffff");
};
export const fxDot = (p: Pen) => { p.ell(60, 60, 44, 44, "#e8443a", 10); };
/** folder with "MESURES", 360 x 260 */
export const fxFolder = (p: Pen) => {
  p.poly([[20, 40], [130, 40], [150, 70], [340, 70], [340, 240], [20, 240]], "#f2c66a", 10);
  text(p.g, "MESURES", 180, 160, 54, "#3a2a1a", INK, 0);
};
/** blueprint held open, 600 x 400 */
export const fxPlan = (p: Pen) => {
  const g = p.g; g.drawImage(blueprintTex().image as CanvasImageSource, 0, 0, 600, 400);
  g.strokeStyle = INK; g.lineWidth = 14; g.strokeRect(7, 7, 586, 386);
};
/** giant bill, 520 x 700 */
export const fxBill = (amount: boolean) => (p: Pen) => {
  const g = p.g;
  p.poly([[20, 20], [500, 20], [500, 640], [460, 680], [420, 640], [380, 680], [340, 640], [300, 680], [260, 640], [220, 680], [180, 640], [140, 680], [100, 640], [60, 680], [20, 640]], "#fbf8f0", 12);
  text(g, "FACTURE", 260, 95, 76, "#1f3f7a", INK, 0);
  g.fillStyle = "#c9c3b8"; for (let y = 180; y < 420; y += 48) g.fillRect(60, y, y % 96 ? 400 : 300, 16);
  g.fillStyle = INK; g.fillRect(50, 470, 420, 8);
  if (amount) text(g, "80 000 000 €", 260, 545, 64, "#e8443a", INK, 0);
};
/** ruler across a gap, 700 x 200 */
export const fxRuler = (p: Pen) => {
  const g = p.g;
  p.poly([[20, 40], [680, 40], [680, 160], [20, 160]], "#ffd84a", 10);
  g.strokeStyle = INK;
  for (let i = 0; i <= 32; i++) { const x = 40 + i * 19.4; g.lineWidth = i % 5 ? 4 : 7; g.beginPath(); g.moveTo(x, 40); g.lineTo(x, i % 5 ? 80 : 105); g.stroke(); }
  text(g, "cm", 600, 128, 44, INK, INK, 0);
};
/** tape measure ribbon (door width), 600 x 120 */
export const fxTape = (p: Pen) => {
  p.poly([[10, 30], [590, 30], [590, 90], [10, 90]], "#f2d24a", 8);
  const g = p.g; g.strokeStyle = INK; for (let i = 0; i < 30; i++) { g.lineWidth = 4; g.beginPath(); g.moveTo(20 + i * 19.5, 30); g.lineTo(20 + i * 19.5, i % 5 ? 50 : 66); g.stroke(); }
  p.poly([[540, 10], [600, 10], [600, 110], [540, 110]], "#c8343a", 8);
};
export const fxQuestion = (p: Pen) => text(p.g, "?", 150, 160, 250, "#ffffff", INK, 22);
export const fxBang = (p: Pen) => text(p.g, "!", 150, 160, 250, "#ffd84a", INK, 22);
export const fxSweat = (p: Pen) => { p.poly([[60, 10], [95, 90], [60, 140], [25, 90]], "#9fd4ff", 7); };
export const glowTex = () => ctex("glowT", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
