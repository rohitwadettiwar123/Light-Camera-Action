# 30 — i18n & Persona Rules

## i18n Contract

### Every New User-Facing String Must Exist in All 4 Locales

```
src/i18n/locales/en.ts   ← English (default)
src/i18n/locales/bn.ts   ← Bengali / বাংলা
src/i18n/locales/hi.ts   ← Hindi / हिन्दी
src/i18n/locales/fr.ts   ← French / Français
```

**Process for adding a string:**

1. Add the key to `en.ts` first (English source of truth)
2. Add culturally appropriate translations to `bn.ts`, `hi.ts`, `fr.ts`
   - Do NOT machine-translate — if uncertain, use a clearly marked placeholder and flag in PR
3. Use the `useTranslation()` hook to consume: `const { t } = useTranslation()`
4. Access via `t('section.key')` — never hardcode English strings in JSX

### Typography Safety

- **Bengali (bn)**: Hind Siliguri or Noto Sans Bengali — ensure ligature support
- **Hindi (hi)**: Hind or Noto Sans Devanagari — ensure half-conjuncts render correctly
- **French (fr)**: Standard Latin-1 extended — ensure `é à ü ç` render in chosen font
- Use `Array.from(str)` for grapheme-safe string slicing in TypeWriter — already established pattern
- Never use `str.length` for display character counting; use `[...str].length`

### Directional Safety

All 4 supported languages are LTR. No RTL handling needed currently.

## Persona Adaptation Contract

Every new feature must adapt its appearance and tone to the active relationship persona.

### Persona → World Mapping

| Persona | Emotional World | Color Bias | Particle Style | Music Mood |
|---|---|---|---|---|
| `partner` | Cosmic/romantic | Deep rose, gold | Stars, petals | Soft orchestral |
| `friend` | Playful/electric | Cyan, lime | Confetti, bursts | Upbeat pop |
| `brother` | Goofy/warm | Orange, amber | Emoji trails | Rock/gaming |
| `sister` | Sparkly/sweet | Lavender, pink | Glitter, hearts | Pop ballad |
| `mother` | Lantern/warm | Amber, gold | Fireflies, soft | Ambient warm |
| `father` | Classic/stoic | Navy, bronze | Shooting stars | Jazz/classic |
| `grandfather` | Heritage/legacy | Sepia, cream | Dust motes | Classical |
| `grandmother` | Cozy/nurturing | Rose, cream | Flower petals | Folk/classical |
| `son` | Adventure/toy | Primary colors | Stars, rockets | Playful upbeat |
| `daughter` | Magical/princess | Pastel rainbow | Sparkles, wings | Whimsical |
| `mentor` | Scholarly/inspiring | Deep teal, gold | Geometric | Ambient focus |
| `colleague` | Professional/fun | Blue, white | Minimal confetti | Upbeat neutral |
| `cousin` | Mischievous/fun | Mixed vibrant | Emoji burst | Party mix |
| `friend` | Inclusive/joyful | Rainbow accent | Mixed | Party |

### Implementation Pattern

```ts
import { useBirthdayStore } from '@/features/core/store/useBirthdayStore';

const rel = useBirthdayStore(s => s.config.relationship);

// Derive persona-specific values
const personaParticleStyle = PERSONA_PARTICLE_MAP[rel] ?? PERSONA_PARTICLE_MAP['friend'];
```

### New Features Checklist

For every new interactive element:
- [ ] Text content uses `t('key')` from all 4 locales
- [ ] Visual theme (colors, particles, props) varies by `relationship` config
- [ ] Tone of animations adapts: romantic = slower/smoother; friend = faster/bouncier
- [ ] ARIA labels in English (screen readers use the browser language, not the app language)
- [ ] Font stack explicitly includes Indic fallbacks when `lang === 'bn' || lang === 'hi'`

## No Hardcoded Personal Content

- **Never** hardcode a person's name, age, photo URL, or message in component files
- All personal content flows through `useBirthdayStore` → `config.*`
- Default values must be generic and meaningful (e.g. `"Birthday Star"`, `"Special Someone"`)
- Photo fallbacks must use royalty-free placeholder images or the existing `PLACEHOLDER_PHOTOS` constant
