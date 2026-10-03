# Birthday Bloom — Agent README

## What Is This?

The `.agent/` directory makes Birthday Bloom agent-ready. It gives any AI coding agent (or human contributor) a compact, opinionated guide to the project's invariants, design rules, and safe workflows — before touching any code.

---

## Directory Structure

```
.agent/
├── rules/
│   ├── 00-project-context.md    ← READ FIRST. Stack, invariants, reading list, key paths.
│   ├── 10-design-3d-motion.md   ← 3D/WebGL engineering rules: perf, adaptive quality, a11y.
│   ├── 20-code-quality.md       ← TypeScript, ESLint, testing, commits, definition of done.
│   └── 30-i18n-and-personas.md  ← i18n contract, typography safety, persona adaptation.
└── workflows/
    ├── innovate.md              ← How to research, plan, get approval, then build a feature.
    ├── verify.md                ← Full CI + manual smoke test checklist.
    ├── new-scene.md             ← How to add a new scene to the state machine safely.
    └── add-env-key.md           ← How to add a VITE_* env var + URL param correctly.
```

---

## Rules Reference

### `00-project-context.md`
The invariants that can never be broken. Contains the tech stack, the reading list every agent must consume before any task, the hard constraints (ENV-FIRST, state machine intact, zero backend), and a map of all key file paths.

### `10-design-3d-motion.md`
Engineering rules for all 3D and motion work:
- 60 fps target on mid-range phones; ≤ 150 KB gzipped new 3D bundle
- All Three.js/R3F code lazy-loaded in separate chunks
- Adaptive quality system (GPU tier → particle count, pixel ratio, post-processing)
- `prefers-reduced-motion` + `VITE_REDUCED_MOTION` static fallbacks
- WebGL failure → CSS/SVG fallback (never blank screen)
- Motion language: spring physics, staggered reveals, parallax depth
- HSL palette derived from `VITE_BIRTHDAY_COLOR`
- Mobile-first: touch, gyroscope tilt (with permission fallback), haptics
- Accessibility: keyboard, ARIA, AA contrast, no 3 Hz+ flashing
- Resource cleanup on unmount (geometry, material, texture)

### `20-code-quality.md`
Code quality rules:
- TypeScript strict: no `any`, no `@ts-ignore`, explicit return types
- Components ≤ 250 lines; logic in hooks
- Follow existing ESLint config
- Every feature gets Vitest tests (reuse existing WebGL/Audio mocks)
- Conventional Commits, one feature per commit
- Definition of done: `npm run verify` passes, docs updated, screenshots captured

### `30-i18n-and-personas.md`
Internationalization and persona rules:
- Every new user-facing string in all 4 locales: `en`, `bn`, `hi`, `fr`
- Grapheme-safe string operations (`Array.from`)
- Proper font stacks for Indic scripts
- Every feature adapts tone, color, and visuals to the 14 relationship personas
- No hardcoded personal content in components

---

## Workflows Reference

### `workflows/innovate.md`
**Use when**: building a new feature from scratch.

Phases:
1. **Research** (read-only) — understand existing code, estimate cost, check browser support
2. **Plan** (write artifact, no code) — Implementation Plan with files, env keys, fallbacks, i18n, persona variations
3. **Approval** — stop, present plan, wait for user OK
4. **Build** — implement on a feature branch, add tests, update docs, run verify

### `workflows/verify.md`
**Use after**: any feature implementation.

Steps:
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. `npm run build` + chunk size report
5. Manual smoke tests: 375 px mobile, 1440 px desktop
6. Reduced-motion check
7. WebGL-off check
8. All 4 languages (`?lang=en`, `?lang=bn`, `?lang=hi`, `?lang=fr`)
9. Write/update Walkthrough artifact

### `workflows/new-scene.md`
**Use when**: adding a new scene to the 4-phase state machine.

Key decisions:
- Does it live within `intro` (sub-scene), within `main` (new section), or as a new top-level phase?
- Most new scenes should be sections within `main`
- Documents the component contract, env key registration, and documentation updates

### `workflows/add-env-key.md`
**Use when**: exposing a new configuration option.

8-step checklist:
1. Name the key (`VITE_*`, uppercase, grouped by topic)
2. Add to `.env.example` with comment + default
3. Add to Zustand store (`BirthdayConfig` interface + parse logic)
4. Add to URL params parser (URL overrides env)
5. Document in `obsidian-docs/ENV_GUIDE.md`
6. Document in `obsidian-docs/URL-Parameters.md` (if URL alias)
7. Add tests (env default + URL override)
8. Verify end-to-end

---

## Quick Commands

```bash
# Start development server
npm run dev

# Full verification (typecheck + lint + test + build)
npm run verify

# Watch-mode tests
npm run test:watch

# TypeScript only
npm run typecheck

# Lint only
npm run lint

# Production build
npm run build
```

---

## Key Docs to Read First

| Document | Purpose |
|---|---|
| `README.md` | Feature matrix, deployment guide, env var table |
| `obsidian-docs/architecture.md` | 4-phase FSM, layer diagram |
| `obsidian-docs/ENV_GUIDE.md` | All 53 env vars |
| `obsidian-docs/URL-Parameters.md` | All URL query params |
| `obsidian-docs/styleguide.md` | Code conventions |
| `obsidian-docs/family-system.md` | 18 relationship archetypes |
| `.env.example` | Canonical env reference with defaults |
| `src/pages/Index.tsx` | State machine entry point |
