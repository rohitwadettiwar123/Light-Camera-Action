import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { useBirthdayStore } from '@/features/core/store/useBirthdayStore';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { useGyroscope } from '@/hooks/useGyroscope';

interface ConstellationProps {
  photos: string[];
  captions: string[];
}

function PhotoNode({ url, position, index, onClick, focused }: any) {
  const texture = useMemo(() => new THREE.TextureLoader().load(url), [url]);
  const meshRef = useRef<THREE.Mesh>(null!);

  const { scale, y } = useSpring({
    scale: focused ? 1.5 : 1,
    y: focused ? position[1] + 0.5 : position[1],
    config: { mass: 1, tension: 170, friction: 26 },
  });

  useFrame((state) => {
    if (!focused && meshRef.current) {
      // Subtle float
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.2;
      // Billboard to camera
      meshRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={[position[0], y, position[2]]}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick(index);
      }}
    >
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
    </animated.mesh>
  );
}

function ConstellationScene({ photos, captions }: ConstellationProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const { camera } = useThree();
  const { orientation, isSupported, permissionGranted, requestAccess } = useGyroscope();
  const { reducedMotion } = useAdaptiveQuality();
  
  const originalCameraPos = useRef(new THREE.Vector3(0, 0, 10));
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 10));

  const positions = useMemo(() => {
    return photos.map((_, i) => {
      // Distribute in a semi-sphere or random cluster
      const angle = (i / photos.length) * Math.PI * 2;
      const radius = 6 + Math.random() * 2;
      return [
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius - 4, // push back slightly
      ];
    });
  }, [photos]);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    if (focusedIndex !== null) {
      // Fly to focused photo
      const pos = positions[focusedIndex];
      targetCameraPos.current.set(pos[0], pos[1], pos[2] + 4);
    } else {
      // Drift or gyro parallax
      if (permissionGranted) {
        // Map gyro to camera position offset
        const gyroX = Math.max(-30, Math.min(30, orientation.gamma)) * 0.1;
        const gyroY = Math.max(-30, Math.min(30, orientation.beta - 45)) * 0.1;
        targetCameraPos.current.set(gyroX, -gyroY, 10);
      } else {
        // Slow ambient drift
        const t = state.clock.elapsedTime * 0.2;
        targetCameraPos.current.set(Math.sin(t) * 2, Math.cos(t * 0.8) * 1.5, 10);
      }
    }

    // Lerp camera
    camera.position.lerp(targetCameraPos.current, delta * 3);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={1} />
      <group onPointerMissed={() => setFocusedIndex(null)}>
        {photos.map((url, i) => (
          <PhotoNode
            key={i}
            url={url}
            position={positions[i]}
            index={i}
            focused={focusedIndex === i}
            onClick={setFocusedIndex}
          />
        ))}
      </group>

      {/* HTML overlay for caption & gyro button */}
      {!permissionGranted && isSupported && focusedIndex === null && (
        <mesh position={[0, -5, 5]}>
          <planeGeometry args={[4, 1]} />
          <meshBasicMaterial color="#000" opacity={0.5} transparent />
        </mesh>
      )}
    </>
  );
}

export function PhotoConstellation() {
  const config = useBirthdayStore((s) => s.config);
  const photos = config.photos?.filter(Boolean) || [];
  const captions = config.photoCaptions || [];
  const { tier } = useAdaptiveQuality();
  const { requestAccess, permissionGranted, isSupported } = useGyroscope();

  if (photos.length === 0) return null;

  return (
    <div className="w-full h-[600px] relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm">
      <Canvas
        gl={{ antialias: tier === 'high', alpha: true }}
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <ConstellationScene photos={photos} captions={captions} />
      </Canvas>
      
      {!permissionGranted && isSupported && (
        <button
          onClick={requestAccess}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-xs backdrop-blur-md transition-all z-10"
        >
          📱 Enable Gyroscope
        </button>
      )}
      
      <div className="absolute top-4 left-4 text-white/50 text-xs uppercase tracking-widest font-display pointer-events-none">
        Drag or Tilt to Explore
      </div>
    </div>
  );
}
