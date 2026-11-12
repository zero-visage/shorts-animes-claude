// Light presets for the trains short: bright day at the station, warm office, blue "explanation" light, golden dusk.
import { LIGHTS as BL, LightPreset, LOOK as BLOOK, WorldLook } from "../bridge/lights";
import { LIGHTS as CL, LOOK as CLOOK } from "./palettes";
import type { Light } from "./story";

export const LIGHTS: Record<Light, LightPreset> = {
  day: { ...BL.day, lit: [1.45, 1.38, 1.22] },
  dusk: { ...BL.golden, az: 40, el: 14, fogNear: 30, fogFar: 260 },
  room: { ...CL.room, lit: [1.45, 1.22, 0.98], fog: "#3a3040" },
  expl: { ...CL.cut, fogNear: 40, fogFar: 220 },
};

export const LOOK: Record<Light, WorldLook> = {
  day: { ...BLOOK.day, sat: 1.22 },
  dusk: { ...BLOOK.golden, sat: 1.15 },
  room: { ...CLOOK.room, sat: 1.18 },
  expl: { ...CLOOK.cut, sat: 1.08 },
};
export const GRADE_OF: Record<Light, "day" | "golden"> = { day: "day", dusk: "golden", room: "golden", expl: "day" };
