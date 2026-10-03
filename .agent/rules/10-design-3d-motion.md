# 10 — 3D Design & Motion Engineering Rules

## Performance Budget

- **Target**: 60 fps on mid-range Android phones (Snapdragon 6xx, Mali-G57, ~2019–2022 era)
- **Added gzipped bundle from new 3D features**: ≤ 150 KB total above the current baseline
- **All Three.js / React Three Fiber code**: lazy-loaded via `React.lazy()` + `Suspense` in separate Vite chunks
  - Chunk name convention: `three-<feature>` (e.g. `three-constellation`, `three-aurora`)
  - Chunk registration in `vite.config.ts` `manualChunks` function

## Adaptive Quality System

Every 3D scene must read from (or contribute to) the global `useAdaptiveQuality` hook:

```ts
// Usage in any 3D component
const { tier, pixelRatio, reducedMotion } = useAdaptiveQuality();
// tier: 'low' | 'medium' | 'high'
```

Tier detection cascade (implement in `src/hooks/useAdaptiveQuality.ts`):
1. `VITE_GPU_TIER` env override (`low | medium | high`)
2. `navigator.hardwareConcurrency` < 4 → `low`
3. `devicePixelRatio` < 1.5 → `low`
4. Live FPS monitor: if sustained < 30 fps for 3 s → downgrade tier
5. `prefers-reduced-motion` or `VITE_REDUCED_MOTION=true` → force `low`

Tier→quality table:

| Tier | Pixel Ratio | Particles | Shadows | Post-processing |
|---|---|---|---|---|
| `low` | 1.0 | ≤ 50 | none | none |
| `medium` | min(dpr, 1.5) | ≤ 200 | basic | none |
| `high` | min(dpr, 2.0) | ≤ 800 | soft | bloom + DOF |

## WebGL Safety

- Wrap every `<Canvas>` in an `<ErrorBoundary>` that renders a CSS/SVG fallback
- On WebGL context loss or creation failure, catch `webglcontextlost` event and show fallback
- **WebGL failure must NEVER blank the screen** — every 3D element has a 2D CSS/SVG fallback
- Check `WEBGL_lose_context` extension availability before using it

## Reduced-Motion Contract

- Read `prefers-reduced-motion` **and** `VITE_REDUCED_MOTION` env var
- When either is true:
  - Replace spring animations with instant state (opacity 0→1 only)
  - Replace particle systems with a single static decorative element
  - Replace 3D camera moves with static `lookAt` position
  - Replace canvas fireworks with a simple CSS glow pulse
- Every component that animates MUST have a `reducedMotion` code path

## Motion Language Principles

1. **Spring physics only** — no `ease: 'linear'` for UI animations. Use `spring` or `easeOut` with `damping: 20, stiffness: 80` as defaults
2. **Staggered reveals** — children enter with `staggerChildren: 0.06` at most
3. **Parallax depth** — use `useScroll` + `useTransform` for multi-layer depth in scrollable scenes
4. **Camera moves** — use `@react-three/drei`'s `CameraControls` or manual `lerp` to target; never snap
5. **ONE hero moment per scene** — do not stack multiple climactic animations simultaneously
6. **Shared elements** — use `layoutId` in Framer Motion to carry elements across scenes

## Palette Derivation

```ts
// Always derive from VITE_BIRTHDAY_COLOR as HSL
// Already done by useDynamicTheme → CSS vars:
// --color-primary-h, --color-primary-s, --color-primary-l
// --color-primary: hsl(var(...))
// Shift hue ±30° for secondary/tertiary palette
const accentH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--color-primary-h'));
```

All shaders must accept a `uAccentColor: THREE.Color` uniform driven by `VITE_BIRTHDAY_COLOR`.

## Mobile & Touch

- Touch targets ≥ 44×44 px
- Gyroscope tilt for parallax (request `DeviceOrientationEvent` permission on iOS 13+)
  - Provide tap-drag fallback when permission denied or `DeviceOrientationEvent` not available
- Haptics: `navigator.vibrate()` where available, guarded with `try/catch`
- Test at **375 px** width (iPhone SE) and **390 px** (iPhone 14)

## Accessibility Contract

- Every interactive 3D element has a keyboard-operable 2D equivalent
- Visible focus rings on all focusable elements (`:focus-visible` outline)
- `aria-label` on all icon-only buttons and canvas elements
- AA contrast (≥ 4.5:1) for all text overlays on 3D backgrounds
- No flashing above 3 Hz (WCAG 2.1 §2.3.1) — particle burst max rate gated
- Keyboard shortcut `Escape` dismisses any modal or overlay

## Resource Cleanup

Every component using Three.js resources MUST clean up on unmount:

```ts
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose(); // only if owning the renderer
  };
}, []);
```

Use `useThree` → `gl` to call `gl.dispose()` only when owning the renderer instance.
