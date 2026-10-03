# Workflow: Verify

**Purpose**: Confirm that a feature or the entire codebase is production-ready.

---

## Step 1 — Type Check

```bash
npm run typecheck
```

Expected: zero errors. Fix all TypeScript errors before proceeding.

## Step 2 — Lint

```bash
npm run lint
```

Expected: zero errors. Warnings may be reviewed but not ignored for new code.

## Step 3 — Tests

```bash
npm test
```

Expected: all tests pass. Coverage regressions in existing tests are a blocker.

## Step 4 — Build

```bash
npm run build
```

Expected: build completes. Then inspect chunk report:

```bash
# After build, check chunk sizes
Get-ChildItem dist/assets -Filter "*.js" | Sort-Object -Property Length -Descending | Select-Object -First 20 | Format-Table Name, @{N='KB';E={[math]::Round($_.Length/1024,1)}}
```

Blockers:
- Any single JS chunk > 500 KB gzipped
- Any new 3D chunk that adds > 150 KB gzipped above baseline

## Step 5 — Manual Smoke Tests

### Mobile (375 px)
Open DevTools → Device: iPhone SE (375×667). Run through:
- [ ] Splash screen loads, tap starts audio
- [ ] Passcode gate works (if enabled)
- [ ] Intro sequence completes without layout overflow
- [ ] Main: hero visible, cake interactive, gallery loads
- [ ] New feature: visible and interactive at 375 px

### Desktop (1440 px)
- [ ] Same checklist as mobile
- [ ] New feature: layout correct at 1440 px

### Reduced-Motion
In DevTools → Rendering → Emulate CSS media → `prefers-reduced-motion: reduce`:
- [ ] Splash screen still functional (no animation required to proceed)
- [ ] Intro completes (typewriter still works; no spring physics)
- [ ] All new 3D scenes show static fallback
- [ ] No flashing or motion above 3 Hz

### WebGL Off
In Chrome: `chrome://flags/#enable-webgl` → Disabled (or use `--disable-webgl` flag):
- [ ] App loads without blank screen
- [ ] CSS/SVG fallback renders in place of every 3D element
- [ ] All text content and interactive features remain accessible

### All 4 Languages
Test via URL params:
- [ ] `?lang=en` — English text correct
- [ ] `?lang=bn` — Bengali text renders (Hind Siliguri / Noto Bengali)
- [ ] `?lang=hi` — Hindi text renders (Devanagari)
- [ ] `?lang=fr` — French text renders (accented chars correct)

## Step 6 — Summary

Create or update the **Walkthrough artifact** at `docs/WALKTHROUGH.md`:

```markdown
## Verify Run — <date>

### Bundle Report
| Chunk | Size (gzip) | Delta |
|---|---|---|

### Test Results
- Total: X passing, 0 failing

### Manual Check Results
| Test | Mobile 375 | Desktop 1440 |
|---|---|---|
| Splash | ✅ | ✅ |
| Intro | ✅ | ✅ |
| Main | ✅ | ✅ |
| <Feature> | ✅ | ✅ |
| Reduced-Motion | ✅ | ✅ |
| No-WebGL | ✅ | ✅ |
| lang=bn | ✅ | ✅ |
| lang=hi | ✅ | ✅ |
| lang=fr | ✅ | ✅ |

### Issues Found
- none / list any
```
