import React from 'react';

declare module "@/components/LightRays" {
  interface LightRaysProps {
    raysOrigin?: 'top-left' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-center';
    raysColor?: string;
    raysSpeed?: number;
    lightSpread?: number;
    rayLength?: number;
    pulsating?: boolean;
    fadeDistance?: number;
    saturation?: number;
    followMouse?: boolean;
    mouseInfluence?: number;
    noiseAmount?: number;
    distortion?: number;
    className?: string;
  }
  const LightRays: React.ComponentType<LightRaysProps>;
  export default LightRays;
}
