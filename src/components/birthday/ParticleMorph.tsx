import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring } from '@react-spring/three';
import { getTextTargets, getHeartTargets, getCakeTargets } from '@/utils/morphTargets';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { hexToRGB } from '@/utils/colorUtils';
import { useBirthdayStore } from '@/features/core/store/useBirthdayStore';

type MorphShape = 'text' | 'heart' | 'cake';

interface ParticleMorphProps {
  text: string;
  shape: MorphShape;
  colorHex?: string;
}

function MorphingParticles({ text, shape, colorHex = '#FF6B9D' }: ParticleMorphProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { tier, reducedMotion } = useAdaptiveQuality();
  
  // Determine particle count based on GPU tier
  const particleCount = useMemo(() => {
    const envCount = Number.parseInt(import.meta.env.VITE_MORPH_COUNT || '0', 10);
    if (envCount > 0) return envCount;
    if (tier === 'high') return 2000;
    if (tier === 'medium') return 1000;
    return 500;
  }, [tier]);

  // Generate target arrays
  const targets = useMemo(() => {
    return {
      text: getTextTargets(text, particleCount),
      heart: getHeartTargets(particleCount),
      cake: getCakeTargets(particleCount)
    };
  }, [text, particleCount]);

  // Initial positions
  const initialPositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 10; // start scattered
    }
    return pos;
  }, [particleCount]);

  const geometryRef = useRef<THREE.BufferGeometry>(null!);

  // Animation spring for the transition progress
  const { progress } = useSpring({
    progress: shape === 'text' ? 0 : shape === 'heart' ? 1 : 2,
    config: { mass: 2, tension: 120, friction: 14 },
  });

  const colorRGB = useMemo(() => {
    const rgb = hexToRGB(colorHex);
    return new THREE.Color(rgb.r / 255, rgb.g / 255, rgb.b / 255);
  }, [colorHex]);

  useFrame(() => {
    if (!geometryRef.current || reducedMotion) return;
    
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const currentProgress = progress.get();
    
    // Determine which two shapes we are interpolating between
    let source: Float32Array;
    let target: Float32Array;
    let localProgress: number;

    if (currentProgress <= 1) {
      source = targets.text;
      target = targets.heart;
      localProgress = currentProgress;
    } else {
      source = targets.heart;
      target = targets.cake;
      localProgress = currentProgress - 1;
    }

    // Interpolate particle positions
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = THREE.MathUtils.lerp(source[i], target[i], localProgress);
    }
    
    geometryRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={colorRGB}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Public Wrapper Component ───────────────────────────────────────────────────

interface MorphWrapperProps {
  text: string;
  onComplete?: () => void;
}

export function ParticleMorphSequence({ text, onComplete }: MorphWrapperProps) {
  const [shape, setShape] = useState<MorphShape>('text');
  const { tier, reducedMotion } = useAdaptiveQuality();
  const config = useBirthdayStore((s) => s.config);

  useEffect(() => {
    if (reducedMotion || tier === 'low') {
      // Skip sequence if low power/reduced motion
      const t = setTimeout(() => onComplete?.(), 3000);
      return () => clearTimeout(t);
    }

    // Sequence: Text (0-2s) -> Heart (2-4s) -> Cake (4-6s)
    const t1 = setTimeout(() => setShape('heart'), 2500);
    const t2 = setTimeout(() => setShape('cake'), 4500);
    const t3 = setTimeout(() => onComplete?.(), 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reducedMotion, tier, onComplete]);

  // Fallback for low-tier or reduced motion
  if (reducedMotion || tier === 'low') {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <h2 className="font-script text-6xl sm:text-8xl md:text-9xl lg:text-[13rem] font-bold text-gradient-romantic text-glow-rose break-words leading-tight animate-in fade-in zoom-in duration-1000">
          {text}
        </h2>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
      <Canvas
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0, 10], fov: 50 }}
      >
        <MorphingParticles 
          text={text} 
          shape={shape} 
          colorHex={config.favoriteColor} 
        />
      </Canvas>
    </div>
  );
}
