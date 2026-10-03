# Workflow: New Scene

**Purpose**: Safely add a new scene to the state machine without breaking the existing flow.

---

## Pre-Conditions

- Read `.agent/rules/00-project-context.md` before starting
- Understand the current state machine in `src/pages/Index.tsx`:
  `splash → unlock → intro → main`

## Checklist

### 1. Decide Where the Scene Lives

| Insertion Point | When to use |
|---|---|
| Before `splash` | Almost never — `splash` is always first |
| Between `unlock` and `intro` | A transitional loading or teaser scene |
| Within `intro` (sub-scene of `CinematicIntro`) | Additional storytelling beat inside the intro FSM |
| Within `main` (new section in `MainBirthday`) | A new interactive module in the celebration dashboard |
| After `main` | A finale or epilogue that replaces the main dashboard |

**Most new scenes should be sections within `main`**, not new top-level phases.

### 2. Add a Sub-Phase (if adding within intro)

`CinematicIntro.tsx` uses its own internal `scene` type:
```ts
type Scene = "storytelling" | "fake-chat" | "post-chat" | "reveal-sequence" | "done";
```

To add a new sub-scene:
- Extend the union type
- Add the transition timer in the sequence
- Add a `timersRef` entry to ensure cleanup on unmount
- Test with `?phase=intro` URL param

### 3. Add a New Top-Level Phase (only if truly necessary)

If adding a new top-level phase (e.g., `'constellation'`):
1. Extend `type Phase` in `src/pages/Index.tsx`
2. Add `AnimatePresence` branch for the new phase
3. Add transition trigger from the preceding phase
4. Ensure `?phase=<new>` URL param works for deep-linking
5. Ensure the Skip button still leads to `main`
6. Update `obsidian-docs/architecture.md` FSM diagram

### 4. Create the Scene Component

```
src/components/birthday/<SceneName>.tsx     ← component
src/hooks/use<SceneName>.ts                 ← extracted logic (if needed)
src/test/<SceneName>.test.tsx               ← tests
```

Component contract:
```ts
interface <SceneName>Props {
  onComplete?: () => void;  // if the scene transitions to the next phase
  onSkip?: () => void;      // if skippable
}
```

### 5. Register Env Keys

- Add `VITE_SHOW_<SCENE>` (boolean, default `true`) to `.env.example` and store
- Add any scene-specific config keys following ENV_GUIDE.md table format

### 6. Add i18n Strings

All new text keys in all 4 locales before merging.

### 7. Test the Complete Flow

```
?phase=splash → tap → (unlock if required) → (new scene) → main
?phase=<new-scene>  ← direct link must work
?lang=bn            ← all text renders in Bengali
reduced-motion      ← static fallback shown
WebGL off           ← no blank screen
```

### 8. Update Documentation

- `obsidian-docs/architecture.md` — add to FSM diagram
- `obsidian-docs/Codebase-Map.md` — add file entry
- `CHANGELOG.md` — add to [Unreleased]
