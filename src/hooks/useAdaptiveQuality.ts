import { useEffect, useRef, useState, useCallback } from 'react';

export type GpuTier = 'low' | 'medium' | 'high';

interface AdaptiveQualityState {
  tier: GpuTier;
  pixelRatio: number;
  reducedMotion: boolean;
}

const FPS_SAMPLE_WINDOW = 3000; // ms
const LOW_FPS_THRESHOLD = 30;

function detectInitialTier(): GpuTier {
  if (typeof window === 'undefined') return 'medium';

  // Check env override
  const envTier = import.meta.env.VITE_GPU_TIER as string | undefined;
  if (envTier === 'low' || envTier === 'medium' || envTier === 'high') return envTier;

  // Check URL param override
  const urlTier = new URLSearchParams(window.location.search).get('gpu');
  if (urlTier === 'low' || urlTier === 'medium' || urlTier === 'high') return urlTier;

  // Check reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';

  // Heuristic: hardware concurrency
  const cores = navigator.hardwareConcurrency ?? 4;
  const dpr = window.devicePixelRatio ?? 1;

  if (cores <= 2 || dpr < 1.5) return 'low';
  if (cores >= 8 && dpr >= 2) return 'high';
  return 'medium';
}

function getPixelRatio(tier: GpuTier): number {
  const dpr = window.devicePixelRatio ?? 1;
  if (tier === 'low') return 1.0;
  if (tier === 'medium') return Math.min(dpr, 1.5);
  return Math.min(dpr, 2.0);
}

/** Hook that detects GPU quality tier and live-monitors FPS to auto-downgrade. */
export function useAdaptiveQuality(): AdaptiveQualityState {
  const [tier, setTier] = useState<GpuTier>(detectInitialTier);
  const reducedMotion =
    typeof window !== 'undefined' &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      import.meta.env.VITE_REDUCED_MOTION === 'true');

  const rafRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);
  const lastDowngradeRef = useRef<number>(0);

  const measureFps = useCallback(() => {
    const now = performance.now();
    frameTimesRef.current.push(now);

    // Keep only last FPS_SAMPLE_WINDOW ms
    const cutoff = now - FPS_SAMPLE_WINDOW;
    frameTimesRef.current = frameTimesRef.current.filter((t) => t > cutoff);

    const frames = frameTimesRef.current.length;
    const elapsed = now - (frameTimesRef.current[0] ?? now);
    const fps = elapsed > 0 ? (frames / elapsed) * 1000 : 60;

    if (
      fps < LOW_FPS_THRESHOLD &&
      now - lastDowngradeRef.current > 5000 // don't downgrade more than once per 5s
    ) {
      lastDowngradeRef.current = now;
      setTier((prev) => {
        if (prev === 'high') return 'medium';
        if (prev === 'medium') return 'low';
        return 'low';
      });
    }

    rafRef.current = requestAnimationFrame(measureFps);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    rafRef.current = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(rafRef.current);
  }, [measureFps, reducedMotion]);

  return {
    tier,
    pixelRatio: getPixelRatio(tier),
    reducedMotion,
  };
}
