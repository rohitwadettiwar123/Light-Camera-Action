# 00 — Project Context

## Stack Summary

| Layer | Technology |
|---|---|
| Framework | React 18.3, TypeScript 5.8 (strict) |
| Build | Vite 8 + `@vitejs/plugin-react-swc`, Rolldown chunk splitting |
| 3D / WebGL | Three.js 0.185, React Three Fiber 8, @react-three/drei 9, @react-spring/three 10 |
| Animation | Framer Motion 13 |
| State | Zustand 5 (`useBirthdayStore`) |
| Styling | Tailwind CSS 3.4, dynamic HSL CSS variables via `useDynamicTheme` |
| Testing | Vitest 3, @testing-library/react 16, Playwright |
| i18n | Custom `useTranslation` hook, 4 locale files: `en`, `bn`, `hi`, `fr` |
| Router | React Router DOM 7 |
| Audio | Web Audio API singleton (`SoundManager.tsx`) |

## Reading List (before ANY task)

1. `README.md` — architecture overview, feature matrix, env table
2. `obsidian-docs/architecture.md` — 4-phase state machine, layer diagram
3. `obsidian-docs/Codebase-Map.md` — every significant file
4. `obsidian-docs/ENV_GUIDE.md` — all 53 env vars + aliases
5. `obsidian-docs/URL-Parameters.md` — all URL query params
6. `obsidian-docs/styleguide.md` — naming, TS, CSS, accessibility conventions
7. `obsidian-docs/template-architecture.md` — data flow from env → store → components
8. `obsidian-docs/family-system.md` — 18 relationship archetypes
9. `.env.example` — canonical env var reference with defaults
10. `src/pages/Index.tsx` — state machine entry point
11. `src/features/core/store/useBirthdayStore.ts` — central store
12. `src/features/core/store/urlParams.ts` — URL param parsing

## Hard Invariants (NEVER break)

1. **ENV-FIRST**: every new feature is configurable via `VITE_*` env vars AND URL query params. Document each new key in `.env.example`, the config layer, `obsidian-docs/ENV_GUIDE.md`, `obsidian-docs/URL-Parameters.md`.

2. **State machine intact**: flow is `splash → unlock → intro → main`. New scenes plug into the machine; never bypass it. Use `?phase=<scene>` for deep-linking.

3. **Zero backend, zero telemetry, zero cookies**: the app is a pure static client. No fetch to external APIs (except user-configured media URLs). No `localStorage` writes for tracking.

4. **Extend, don't rewrite**: read a file before editing it. Add or compose; don't delete working behaviour. Keep all existing exports.

5. **MIT license + branding notice intact**: keep `LICENSE` file, the "Birthday Bloom by Naboraj Sarkar" credit in `MainBirthday.tsx` footer.

## Key File Paths

```
src/pages/Index.tsx                          ← state machine (splash|unlock|intro|main)
src/components/birthday/                     ← 35 cinematic components
src/features/core/store/useBirthdayStore.ts  ← Zustand store + env parsing
src/features/core/store/urlParams.ts         ← URL param parser
src/features/core/theme/useDynamicTheme.ts   ← CSS variable injection
src/features/core/seo/useDynamicSEO.ts       ← SEO + structured data
src/features/core/models/familyTemplates.ts  ← 18 relationship archetypes
src/i18n/                                    ← locales (en, bn, hi, fr)
src/config/                                  ← wish templates, letters, audio assets
src/test/                                    ← Vitest test suites (467 tests)
obsidian-docs/                               ← 32-note documentation vault
```
