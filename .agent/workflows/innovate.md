# Workflow: Innovate

**Purpose**: Safely research, plan, get approval, and build a new high-impact feature.

---

## Phase 1 — Research (read-only)

1. **Read the reading list** in `.agent/rules/00-project-context.md` before proceeding
2. Research the idea technically:
   - Search existing implementations (web, npm ecosystem)
   - Check bundle size impact of any new dependency (`bundlephobia.com`)
   - Check browser support (`caniuse.com`) for any new Web API
3. Check the existing codebase for:
   - Existing hooks or utilities that can be reused
   - Components that should be extended rather than replaced
   - Test files that need to be updated
4. Estimate GPU/CPU cost on mid-range mobile (Snapdragon 6xx tier)

## Phase 2 — Plan (write artifact, no code)

Write an **Implementation Plan artifact** containing:

```markdown
## Feature: <name>

### Files Touched
- `src/...` — extend (describe change)
- `src/...` — new file (describe purpose)

### New Env Keys
| Key | URL Alias | Default | Description |
|---|---|---|---|
| `VITE_*` | `?*` | `...` | ... |

### State Machine Integration
How does this plug into splash → unlock → intro → main?

### Performance Budget
- Added bundle size (gzipped estimate)
- GPU cost estimate (particle count, draw calls)
- Adaptive quality degradation plan

### Fallbacks
- Reduced-motion: ...
- No-WebGL: ...
- No-permission (mic, gyro): ...

### i18n Strings
| Key | en | bn | hi | fr |
|---|---|---|---|---|

### Persona Variations
Describe how the feature changes per relationship type.

### Risks
- ...

### Test Plan
- ...
```

## Phase 3 — Approval Checkpoint

**STOP. Present the plan to the user. Do not write code until approved.**

Say: *"Here is the implementation plan for [feature]. Please review and confirm, or let me know what to adjust."*

## Phase 4 — Build

Only after user approval:

1. `git checkout -b feat/<feature-name>` from the current branch
2. Implement following `.agent/rules/10-design-3d-motion.md` and `.agent/rules/20-code-quality.md`
3. Add all 4 i18n strings and persona variations
4. Add Vitest tests
5. Update docs (`.env.example`, `ENV_GUIDE.md`, `URL-Parameters.md`, `CHANGELOG.md`)
6. Run verify workflow (see `workflows/verify.md`)
7. Capture screenshots at 375 px and 1440 px
