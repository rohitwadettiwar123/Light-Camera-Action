# Workflow: Add Env Key

**Purpose**: Correctly add a new environment variable and/or URL parameter to Birthday Bloom.

---

## Checklist

### 1. Choose a Key Name

- Must start with `VITE_` to be accessible in the browser via `import.meta.env`
- Use `UPPER_SNAKE_CASE`
- Group by topic prefix: `VITE_BIRTHDAY_*`, `VITE_SHOW_*`, `VITE_ANIMATION_*`, etc.
- Choose a primary URL alias (short, lower-case, matches existing pattern)

### 2. Add to `.env.example`

Add in the appropriate section with a comment block:

```env
# Short description of what this controls.
# Alias: VITE_ALT_NAME (if applicable)
# URL param: ?alias=value
VITE_YOUR_KEY=default_value
# VITE_ALT_NAME=default_value
```

Keep the default value non-empty and safe for zero-config usage.

### 3. Add to the Zustand Store

In `src/features/core/store/useBirthdayStore.ts`:

1. Add the field to the `BirthdayConfig` interface
2. Parse the env var in the store initialization:
   ```ts
   yourKey: import.meta.env.VITE_YOUR_KEY ?? 'default',
   ```
3. Apply URL override (URL takes precedence over env):
   ```ts
   // In the urlParams merge block:
   if (urlParams.yourAlias) config.yourKey = urlParams.yourAlias;
   ```

### 4. Add to URL Params Parser

In `src/features/core/store/urlParams.ts`:

```ts
yourAlias: params.get('yourAlias') ?? params.get('ya') ?? undefined,
```

### 5. Document in ENV_GUIDE.md

Add a table row to the appropriate section in `obsidian-docs/ENV_GUIDE.md`:

```markdown
| `VITE_YOUR_KEY` | `string` | `'default'` | Description of what it does. Alias: `VITE_ALT`. |
```

### 6. Document in URL-Parameters.md

Add a table row to `obsidian-docs/URL-Parameters.md`:

```markdown
| `yourAlias` | `ya` | `string` | `''` | Description. | `?yourAlias=value` |
```

### 7. Add Tests

In the feature's test file or a new `src/test/env_<feature>.test.ts`:

```ts
it('reads VITE_YOUR_KEY from env', () => {
  // mock import.meta.env
  // assert config.yourKey === expected
});

it('URL param ?yourAlias overrides env', () => {
  // mock URL search params
  // assert override applied
});
```

### 8. Verify

Run `npm run verify` and confirm the key works end-to-end:
- With the env default (zero-config)
- With a custom `.env.local` value
- With the URL param override
