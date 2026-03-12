# 0083 — Chat Thread Visual Refresh, Compact Header, and Attachment Stub Tooltip

> Upgrade the `/chat/[chatId]` experience with a cleaner, more expressive thread UI, a compact one-line header title, and a stubbed attachment affordance that works on iOS, Android, and Web.

---

## User Stories

1. As a user, I want the chat thread screen to feel more polished so reading and replying in long conversations is easier.
2. As a user, I want a short, consistent one-line screen title so the header remains readable and stable across devices.
3. As a user, I want an attachment button next to the composer so I can discover image/file upload intent even before full upload support exists.
4. As an engineer, I want attachment behavior stubbed behind typed UI state so we can later wire real file/image upload APIs without reworking screen structure.

## Prior State

- Chat thread header title used the full conversation title, often wrapping or becoming visually noisy.
- Composer only had text input and send button; no attachment affordance existed.
- Thread visuals were functional but minimal, with little hierarchy around conversation metadata.
- No tooltip-style discoverability existed for future attachment support.

## Target State

1. Compact header strategy:
- Replace dynamic long header title with a short, stable one-line title (`"Thread"`).
- Move full conversation naming/context into body-level metadata so information is still accessible without bloating navigation header space.

2. Visual polish for chat thread:
- Add a lightweight thread hero/meta card under the header with conversation title and updated timestamp.
- Refine message bubble spacing, shape, and row rhythm for improved scanability.
- Keep styling responsive and theme-aware for iOS, Android, and Web.

3. Attachment stub in composer:
- Add a left-side attachment icon button in the composer row (before the text input).
- Show a small tooltip/callout message indicating image/file uploads are coming soon.
- Implement cross-platform trigger behavior:
  - Web: hover/focus/press interaction
  - iOS/Android: tap/long-press interaction
- Keep the control explicitly stubbed (no upload flow wired yet).

4. Test coverage:
- Add focused screen tests validating compact header behavior and attachment tooltip visibility interactions.
- Preserve existing send/composer behavior.

## Files to Create / Update

### Docs
- `docs/pull_requests/0083-chat-thread-visual-refresh-and-attachment-stub-tooltip.md`
- `docs/pull_requests/0000-task-manager.md`

### Chat UI
- `src/features/chat/screens/ChatThreadScreen.tsx`

### Tests
- `src/features/chat/screens/__tests__/ChatThreadScreen.test.tsx` (new)

## Acceptance Criteria

- `/chat/[chatId]` header title is short and one line (`1–2 words`) rather than full conversation title.
- Conversation-specific context remains visible in-body (title + updated timestamp or equivalent metadata).
- Composer includes a left-side attachment button adjacent to the message input.
- Attachment button shows a tooltip/callout that clearly communicates upload support is stubbed/coming soon.
- Tooltip behavior is usable on iOS, Android, and Web interactions.
- Existing send-message flow still works.
- TypeScript passes with strict typing and no `any` usage introduced.

## Test Plan (Write + Run)

1. Add chat thread screen tests:
- `src/features/chat/screens/__tests__/ChatThreadScreen.test.tsx`
- Validate:
  - compact header uses short title
  - full conversation title appears in thread body metadata card
  - attachment tooltip appears when attachment button is triggered
  - send action remains available with non-empty draft

2. Run targeted tests:
- `npx jest src/features/chat/screens/__tests__/ChatThreadScreen.test.tsx`

3. Run type safety:
- `npx tsc --noEmit`

## Depends On

- **PR 0080** — Global Chat FAB + per-tab chat routes
- **PR 0081** — Chat history topic filters (shared chat history foundation)
