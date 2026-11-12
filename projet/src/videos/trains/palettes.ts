// Palettes reprises du Short "La cloche" (nuit, chambre, coupe). // Light presets for the bell short: storybook night (moonlit blue, never black), day, and a warm room.
import { LIGHTS as BL, LightPreset, LOOK as BLOOK, WorldLook } from "../bridge/lights";
type Light = "night" | "day" | "room" | "cut" | "dusk";

export const LIGHTS: Record<Light, LightPreset> = {
  day: BL.day,
  dusk: { ...BL.golden, fogNear: 30, fogFar: 260 },
  cut: {
    ...BL.day,
    az: 55, el: 40,
    lit: [1.12, 0.96, 0.78], shade: [0.36, 0.3, 0.36], lift: [0.05, 0.04, 0.06], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [0.95, 0.93, 1.0], charShade: 0.86, charGrad: 0.08, bodyGrad: 0.2, sideTint: [0.9, 0.9, 1.0],
    blob: [0.6, 0.58, 0.7], actorShadow: false,
    fog: "#2c3a6e", fogNear: 25, fogFar: 160, sunCol: "#e6ecff", sunI: 2.2, sky: "#9aa8d8", ground: "#3a3040", hemiI: 0.5,
  },
  night: {
    ...BL.day,
    az: 70, el: 38,
    lit: [0.5, 0.58, 0.84], shade: [0.14, 0.16, 0.3], lift: [0.03, 0.05, 0.13], lambert: 0.35, sideK: 0.84, term: 0.18,
    charTint: [0.74, 0.8, 1.0], charShade: 0.84, charGrad: 0.1, bodyGrad: 0.22, sideTint: [0.8, 0.84, 1.0],
    blob: [0.55, 0.58, 0.75], actorShadow: false,
    top: "#101a44", hor: "#3b4f8f", skyCurve: [0, 0.5, 0.6], fog: "#2c3a6e", fogNear: 14, fogFar: 140, sunDisc: "#f4f2dc",
    sunCol: "#cfe0ff", sunI: 2.0, sky: "#7d90d0", ground: "#2c2a40", hemiI: 0.45,
  },
  room: {
    ...BL.golden,
    az: 60, el: 30,
    lit: [1.35, 1.0, 0.68], shade: [0.3, 0.24, 0.3], lift: [0.06, 0.05, 0.08], lambert: 0.4, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.88, 0.74], charShade: 0.86, charGrad: 0.08, bodyGrad: 0.22, sideTint: [0.95, 0.88, 0.9],
    blob: [0.62, 0.55, 0.55], actorShadow: false,
    fog: "#2a2030", fogNear: 40, fogFar: 300,
  },
};

export const LOOK: Record<Light, WorldLook> = {
  dusk: { ...BLOOK.golden, sat: 1.0 },
  cut: { ...BLOOK.day, sky: { c: ["#3b4f8f", "#2f4282", "#243672", "#1a2a5e", "#101a44"], e: [0, 3, 9, 18, 45] }, bounce: [0, 0, 0], sat: 0.95 },
  day: BLOOK.day,
  night: {
    ...BLOOK.day,
    sky: { c: ["#3b4f8f", "#2f4282", "#243672", "#1a2a5e", "#101a44"], e: [0, 3, 9, 18, 45] },
    cloud: { lit: "#8fa0d6", mid: "#6676b0", shade: "#46528a" },
    bounce: [0, 0, 0.02], sat: 0.86,
  },
  room: { ...BLOOK.golden, sky: { c: ["#2a2f5a", "#22284f", "#1c2246", "#161b3c", "#101430"], e: [0, 3, 9, 18, 45] }, bounce: [0.04, 0.02, 0], sat: 1.06 },
};
export const GRADE_OF: Record<Light, "day" | "golden"> = { day: "day", night: "day", room: "golden", cut: "day", dusk: "golden" };
