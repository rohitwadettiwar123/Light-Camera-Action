import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';

// ─── GLSL Shaders ─────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Simplex noise helpers + aurora fragment
const fragmentShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uPhase;       // 0=mystery, 0.5=joy, 1=euphoria
  uniform float uH;           // hue 0-360
  uniform float uS;           // saturation 0-100
  uniform float uL;           // lightness 0-100
  uniform float uIntensity;   // 0-1
  uniform int   uPersona;     // 0=friend, 1=partner, 2=general

  // --- Fast hash ---
  vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                  dot(p, vec2(269.5, 183.3)),
                  dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 43758.5453);
  }

  // --- 2D value noise ---
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash3(i + vec2(0,0)), vec3(f - vec2(0,0), 0.0)),
                   dot(hash3(i + vec2(1,0)), vec3(f - vec2(1,0), 0.0)), u.x),
               mix(dot(hash3(i + vec2(0,1)), vec3(f - vec2(0,1), 0.0)),
                   dot(hash3(i + vec2(1,1)), vec3(f - vec2(1,1), 0.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.2 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  // --- HSL to RGB ---
  vec3 hsl2rgb(float h, float s, float l) {
    h = mod(h, 360.0) / 360.0;
    s /= 100.0;
    l /= 100.0;
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c * 0.5;
    vec3 rgb;
    if      (h < 1.0/6.0) rgb = vec3(c,x,0);
    else if (h < 2.0/6.0) rgb = vec3(x,c,0);
    else if (h < 3.0/6.0) rgb = vec3(0,c,x);
    else if (h < 4.0/6.0) rgb = vec3(0,x,c);
    else if (h < 5.0/6.0) rgb = vec3(x,0,c);
    else                   rgb = vec3(c,0,x);
    return rgb + m;
  }

  void main() {
    vec2 uv = vUv;

    // Speed increases with euphoria phase
    float speed = 0.12 + uPhase * 0.18;
    float t = uTime * speed;

    // === Layer 1: base dark gradient (persona-tinted) ===
    float baseL = mix(8.0, 18.0, uv.y * 0.5);
    vec3 base = hsl2rgb(uH, uS * 0.6, baseL);

    // === Layer 2: aurora ribbons ===
    float ribbonH = uH + 20.0 + fbm(uv * 2.0 + vec2(t * 0.3, 0.0)) * 40.0;
    float ribbonS = uS * 0.9;
    float ribbonL = 30.0 + fbm(uv * 3.5 + vec2(0.0, t * 0.5)) * 25.0;
    vec3 ribbon = hsl2rgb(ribbonH, ribbonS, ribbonL);

    // ribbon mask — wavy band across vertical
    float wave = fbm(vec2(uv.x * 4.0 + t, uv.y * 1.5)) * 0.35;
    float bandCenter = 0.45 + sin(t * 0.4) * 0.1;
    float bandMask = smoothstep(0.3, 0.0, abs(uv.y - bandCenter - wave));
    bandMask *= uIntensity;

    // === Layer 3: bokeh / confetti sparkles (friend persona) ===
    vec3 bokeh = vec3(0.0);
    if (uPersona == 0) { // friend
      for (int i = 0; i < 8; i++) {
        float fi = float(i);
        vec2 center = vec2(
          fract(sin(fi * 127.1 + t * 0.05) * 43758.5),
          fract(sin(fi * 311.7 + t * 0.03) * 43758.5)
        );
        float dist = length(uv - center);
        float spotH = uH + fi * 30.0;
        bokeh += hsl2rgb(spotH, 85.0, 65.0) * smoothstep(0.12, 0.0, dist) * 0.4;
      }
    }

    // === Compose ===
    vec3 color = base;
    color = mix(color, ribbon, bandMask * 0.75);
    color += bokeh * uIntensity;

    // Vignette
    float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 2.0);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── Inner R3F Component ──────────────────────────────────────────────────────

interface AuroraMeshProps {
  accentH: number;
  accentS: number;
  accentL: number;
  phase: number;
  intensity: number;
  persona: number;
  reducedMotion: boolean;
}

function AuroraMesh({ accentH, accentS, accentL, phase, intensity, persona, reducedMotion }: AuroraMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: phase },
      uH: { value: accentH },
      uS: { value: accentS },
      uL: { value: accentL },
      uIntensity: { value: intensity },
      uPersona: { value: persona },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Update dynamic uniforms every frame
  useFrame((_, delta) => {
    if (reducedMotion) return;
    uniforms.uTime.value += delta;
    uniforms.uPhase.value = phase;
    uniforms.uH.value = accentH;
    uniforms.uS.value = accentS;
    uniforms.uL.value = accentL;
    uniforms.uIntensity.value = intensity;
    uniforms.uPersona.value = persona;
  });

  return (
    <mesh ref={meshRef} scale={[size.width, size.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────

interface AuroraBackgroundProps {
  accentH: number;
  accentS: number;
  accentL: number;
  /** 0 = mystery (splash), 0.5 = joy (intro), 1 = euphoria (main) */
  phase: number;
  intensity?: number;
  /** 0 = friend, 1 = partner, 2 = general */
  persona?: number;
}

export function AuroraBackground({
  accentH,
  accentS,
  accentL,
  phase,
  intensity = 0.7,
  persona = 0,
}: AuroraBackgroundProps) {
  const { tier, pixelRatio, reducedMotion } = useAdaptiveQuality();

  // Low tier: no WebGL shader — CSS fallback handled by parent
  if (tier === 'low') return null;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        dpr={pixelRatio}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute('aria-hidden', 'true');
        }}
      >
        <AuroraMesh
          accentH={accentH}
          accentS={accentS}
          accentL={accentL}
          phase={phase}
          intensity={reducedMotion ? 0.3 : intensity}
          persona={persona}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
