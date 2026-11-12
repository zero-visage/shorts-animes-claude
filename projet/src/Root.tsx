import React from "react";
import { Composition } from "remotion";
import { TrainsShort, TRAINS_FRAMES } from "./videos/trains/Trains";
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TrainsShort" component={TrainsShort} durationInFrames={TRAINS_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
