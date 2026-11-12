// Burnt-in French captions (2-3 words, white bold, soft shadow, centred just below the middle) and the sound track.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import { CAPS } from "./captions";
import { FPS } from "./story";

export const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const c = CAPS.find(([, a, b]) => t >= a && t < b);
  if (!c) return null;
  const k = Math.min(1, (t - c[1]) / 0.08); // quick 2-frame pop
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div style={{
        position: "absolute", top: "56%", width: "86%", textAlign: "center",
        fontFamily: "'Arial Black', 'Montserrat', Arial, sans-serif", fontWeight: 900, fontSize: 84, lineHeight: 1.1, color: "#ffffff",
        textShadow: "0 0 14px rgba(0,0,0,0.75), 0 4px 10px rgba(0,0,0,0.6), 0 0 3px rgba(0,0,0,0.9)",
        transform: `scale(${0.9 + 0.1 * k})`, opacity: k,
      }}>{c[0]}</div>
    </AbsoluteFill>
  );
};

export const SoundTrack: React.FC = () => {
  const on = (getInputProps() as { audio?: boolean }).audio === true;
  if (!on) return null;
  return (
    <>
      <Audio src={staticFile("trains/voice.mp3")} />
      <Audio src={staticFile("trains/sfx.wav")} />
    </>
  );
};
