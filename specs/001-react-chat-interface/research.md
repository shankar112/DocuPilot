# Research: React Chat Interface

## Decision: Vite as the Build Tool
- **Rationale**: Vite provides a significantly faster development experience and modern bundling compared to Create React App. It is the current industry standard for React SPAs.
- **Alternatives considered**: Create React App (deprecated/unmaintained), Next.js (overkill for a single-page chat interface).

## Decision: `react-markdown` for AI Responses
- **Rationale**: Required by FR-005. `react-markdown` is the standard library for rendering markdown safely in React, supporting bold, lists, and code blocks out of the box.
- **Alternatives considered**: `marked` (requires manual DOM purification), `dangerouslySetInnerHTML` (security risk).

## Decision: `sessionStorage` for Local Persistence
- **Rationale**: User explicitly requested `sessionStorage` with a 50-message limit. This keeps the implementation lightweight and avoids complex backend syncing for the MVP while still providing session-level robustness.
- **Alternatives considered**: `localStorage` (persists across sessions, which wasn't requested), Backend database (Phase 2 scope).

## Decision: CSS Variables + Tailwind for Theming
- **Rationale**: Facilitates easy adjustment of the "primary color" background mentioned in the spec without searching/replacing utility classes.
- **Alternatives considered**: Hardcoded Tailwind colors.

## Decision: `lucide-react` for Icons
- **Rationale**: Lightweight, tree-shakable, and matches the style of the prototype.
- **Alternatives considered**: FontAwesome (heavy), Material Icons (different aesthetic).
