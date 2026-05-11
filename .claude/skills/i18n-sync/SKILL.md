---
name: i18n-sync
description: Use this skill to enforce structural parity AND translation accuracy between i18n locale JSON files. Reads `src/i18n/locales/en.json` as the source of truth, then for every other `*.json` locale file in the same directory (1) adds missing keys, (2) removes extra keys, (3) reorders keys to match English, and (4) audits each existing translation against the English value, fixing any that are inaccurate, awkward, untranslated, machine-mangled, or that drop/garble interpolation tokens. Triggers on requests like "sync translations", "check i18n parity", "audit translations", "verify translation accuracy", "translate missing keys", "audit locale files", or any work involving `src/i18n/locales/`.
---

# i18n locale parity + translation accuracy sync

You are syncing locale JSON files against an English source of truth. Your job has two halves:

1. **Structural parity:** every locale file has exactly the same key set, nesting structure, and key order as `en.json`.
2. **Translation accuracy:** every value in every locale file is an accurate, idiomatic translation of the corresponding English value — not just a key that happens to exist.

## Source of truth

- **English source:** `src/i18n/locales/en.json`
- **Target locales:** every other `*.json` file in `src/i18n/locales/` (bg, cs, da, de, el, es, fr, hr, hu, it, nl, pl, pt, ro, ru, sr, sv, tr, uk, plus any newly added).
- Locales registered in `src/i18n/config.ts` must remain registered; if you discover a `.json` file that is not registered, mention it but do not silently change `config.ts`.

## Rules

1. **Structural parity is mandatory.** After sync, `Object.keys` walked recursively on any locale file MUST equal the same walk on `en.json`. Same keys, same nesting depth, same order.
2. **Preserve existing translations.** If a key already exists in the target locale with a non-empty string value, keep that value verbatim — do not retranslate or "improve" it.
3. **Translate missing keys** into the target language. Use natural, idiomatic phrasing appropriate to the locale (not literal word-for-word). Match the tone of existing entries in that file.
4. **Preserve interpolation tokens exactly.** Tokens like `{{label}}`, `{{count}}`, `{{name}}` must appear unchanged in the translated value. Do not translate the token contents.
5. **Preserve placeholders, punctuation, and casing intent.** Trailing `...`, `:`, `?`, `!`, surrounding quotes, and ALL-CAPS markers (e.g. `"LIVE"`) should map to the locale's equivalent convention. Acronyms and proper nouns (e.g. `Zencoder`, `OpenAI`, `GPT`) stay untranslated.
6. **Remove extra keys** that exist in the target locale but not in `en.json`. They are dead and will cause drift.
7. **Match key order** to `en.json` so diffs are clean and reviewable.
8. **Do not touch `en.json`.** It is the source of truth — read-only for this skill.
9. **JSON validity.** Every output file must parse as valid JSON, end with a trailing newline, and use 2-space indentation (match the existing files).

## Process

Run two passes per locale: **(A) structural sync**, then **(B) translation audit**.

### Pass A — structural sync

For each non-English locale file:

1. **Read both files** (`en.json` and the target).
2. **Diff the key trees.** Compute three sets:
   - `missing`: keys present in `en.json` but absent in target.
   - `extra`: keys present in target but absent in `en.json`.
   - `kept`: keys present in both — these values are preserved (subject to Pass B).
3. **Build the new locale object** by walking `en.json` in order:
   - If the key exists in `kept`, copy the target's existing value.
   - If the key is `missing`, write a new translation of the English value into the target language, preserving all interpolation tokens and formatting.
   - Nested objects are recursed; primitive values (strings) are translated.
4. **Write the file** with 2-space indentation and a trailing newline.

### Pass B — translation accuracy audit

After structural parity is achieved, walk every leaf string in every non-English locale and compare it against the corresponding English string. For each pair, flag and fix the value if **any** of the following are true:

1. **Untranslated** — the value is identical to the English string (or only differs by case/whitespace) and the English word is NOT a proper noun or universal acronym. Proper nouns and acronyms that legitimately stay in English: `Zencoder`, `OpenAI`, `Anthropic`, `GPT`, `Claude`, `LIVE` (when used as a status badge), product/model names, file extensions, units like `ms`, `MB`. Common UI words like "Submit", "Cancel", "Save", "Loading" must be translated.
2. **Wrong language** — the value is in some third language (e.g. a French string snuck into the German file) or is a mix of languages.
3. **Token loss or corruption** — interpolation tokens (`{{label}}`, `{{count}}`, `{{name}}`, etc.) are missing, renamed, translated, or have altered braces. Token count and exact spelling must match English.
4. **Semantic mistranslation** — the translation conveys a different meaning than the English (e.g. "Submit" rendered as a word meaning "yield/surrender" instead of "send/confirm"; "Run" as "to jog" instead of "execution"). Use the JSON path as context to disambiguate (a key under `common.runs` is "execution count", not "footraces").
5. **Machine-translation artifacts** — awkward literal phrasing, wrong gender/case agreement, broken plural forms, dropped articles, or word-for-word renderings that no native speaker would write.
6. **Placeholder text** — values like `"TODO"`, `"???"`, `"FIXME"`, empty strings, or copies of the key name.
7. **Punctuation/format drift** — trailing `...`, `:`, `?`, `!`, surrounding quotes, ALL-CAPS markers, or sentence vs. fragment capitalization that diverge from English without a locale-specific reason. (Some locales legitimately differ — e.g. French uses `:` with a non-breaking space — apply locale conventions, do not blindly mirror English.)

For each fix, **replace** the bad translation with a correct, idiomatic one. Match the tone and register of the rest of the file (sentence case vs. title case, formal vs. informal "you", etc.). Preserve all interpolation tokens verbatim.

When deciding whether a translation is "wrong enough" to fix, prefer fixing over leaving — but do not rewrite a perfectly serviceable translation just to match your stylistic preference. The bar is "a native speaker reading this would notice it's off."

### Reporting

Per file, report on one line: `<locale>: kept=N added=N removed=N reordered=Y/N retranslated=N`. End with a totals line. If retranslated > 0 for any file, also list the JSON paths that were changed (so the user can spot-check).

## Verification

After writing all files, verify parity by re-reading each file and confirming its recursive key set AND key order matches `en.json`. Spot-check at least three randomly chosen retranslated entries per locale to confirm they read naturally. If any mismatch remains, fix it before reporting completion.

If a translation is genuinely ambiguous (e.g. a single English word with multiple valid target-language meanings depending on UI context), pick the most likely meaning based on the surrounding keys in the JSON path (e.g. a key under `navigation.subsections` is a sidebar label) and proceed — do not block on clarification for routine UI strings.

## Out of scope

- Do not rewrite `src/i18n/config.ts` unless the user explicitly asks.
- Do not add new top-level features or keys beyond what exists in `en.json`.
- Do not run the app, start dev servers, or open browsers — this is a pure file-sync task.
