# 20 — Code Quality Rules

## TypeScript

- **`strict: true`** in `tsconfig.app.json` — never disable it
- No `any` — use `unknown` + type guards or proper generics
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining the invariant
- No `as` type assertions unless narrowing from `unknown` after validation
- Explicit return types on all exported functions and hooks
- `interface` over `type` for object shapes (per style guide)
- Union literal types over enums

## Component Rules

- **Max 250 lines per component file** — if longer, extract sub-components or hooks
- One named export per component file
- Logic lives in hooks (`src/hooks/` or colocated `use*.ts` file)
- Props typed via `interface *Props`
- No direct `import.meta.env` in components — read from `useBirthdayStore`

## ESLint

Follow the flat config in `eslint.config.js`. Key rules already active:
- `react-hooks/rules-of-hooks` — exhaustive deps
- `react-refresh/only-export-components` — HMR safety

New rules to maintain:
- No unused variables (TS compiler catches these)
- Consistent import ordering (auto-fix with `eslint --fix`)

## Testing

- Every new feature file gets a corresponding Vitest test file in `src/test/`
- Reuse existing mocks in `src/test/setup.ts`:
  - `HTMLMediaElement` stub for audio tests
  - `matchMedia` stub for responsive hooks
  - WebGL context mock for Three.js tests
- Tests must not import `import.meta.env` directly — use mocked store values
- Minimum coverage expectations:
  - New hooks: ≥ 80% line coverage
  - New utility functions: 100% branch coverage
  - New React components: smoke render + key interaction paths

## Conventional Commits

```
feat(scene): add photo constellation with gyroscope parallax
fix(cake): resolve memory leak on WebGL context loss
perf(aurora): reduce shader complexity on low-tier GPU
docs(env): document VITE_CONSTELLATION_ENABLE key
test(constellation): add R3F mock render + tilt tests
refactor(adaptive-quality): extract FPS monitor to hook
chore: bump @react-three/fiber to 8.18.1
```

One feature per commit. Keep subject ≤ 72 chars.

## Definition of Done

A feature is done when ALL of the following pass:

1. `npm run verify` exits 0:
   - `npm run typecheck` (tsc --noEmit)
   - `npm run lint` (eslint)
   - `npm test` (vitest run)
   - `npm run build` (vite build, no chunk > 500 KB gzipped)
2. Manual smoke test at **375 px** (mobile) and **1440 px** (desktop)
3. `prefers-reduced-motion: reduce` CSS media override applied → experience still works
4. WebGL disabled (disable hardware acceleration in browser) → CSS/SVG fallback visible
5. All 4 languages tested: `?lang=en`, `?lang=bn`, `?lang=hi`, `?lang=fr`
6. New env keys documented in:
   - `.env.example` (with comment and default)
   - `obsidian-docs/ENV_GUIDE.md` (table row)
   - `obsidian-docs/URL-Parameters.md` (if URL alias exists)
7. `CHANGELOG.md` entry added under `[Unreleased]`
8. Screenshots captured in `docs/screenshots/` (mobile + desktop)

## File Naming

| Entity | Convention | Example |
|---|---|---|
| React component | PascalCase | `PhotoConstellation.tsx` |
| Hook | `use` + PascalCase | `useAdaptiveQuality.ts` |
| Utility | camelCase | `colorUtils.ts` |
| Test file | matches source + `.test.tsx` | `PhotoConstellation.test.tsx` |
| 3D sub-component | PascalCase | `ConstellationStar.tsx` |
