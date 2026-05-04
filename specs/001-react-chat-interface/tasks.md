# Tasks: React Chat Interface

**Input**: Design documents from `specs/001-react-chat-interface/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include if explicitly requested. Unit tests for hooks and components are recommended for robustness.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Web app: `Frontend/src/`, `Backend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Update FastAPI `Backend/main.py` `CORSMiddleware` to allow origin `http://localhost:5173`
- [ ] T002 Initialize Vite React app in the `Frontend/` directory
- [ ] T003 [P] Install dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `react-markdown` in `Frontend/`
- [ ] T004 [P] Configure `Frontend/tailwind.config.js` and `Frontend/src/index.css` with primary color variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and utilities required for all user stories

- [ ] T005 Implement storage utility in `Frontend/src/hooks/useSessionStorage.js` with `try/catch` wrappers
- [ ] T006 Implement API service in `Frontend/src/services/api.js` to handle `/api/ask` and `/api/health` calls
- [ ] T007 Implement core chat state logic in `Frontend/src/hooks/useChat.js` (history, loading, error states)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Real-time Chat Interaction (Priority: P1) 🎯 MVP

**Goal**: Users can send messages and receive AI responses in a ChatGPT-like interface.

**Independent Test**: Type a message, click send, verify message appears on right and AI response appears on left.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Build `Frontend/src/components/MessageItem.jsx` for user/model message rendering
- [ ] T009 [P] [US1] Build `Frontend/src/components/InputBar.jsx` with basic send functionality
- [ ] T010 [US1] Build `Frontend/src/components/MessageList.jsx` to render the message stream
- [ ] T011 [US1] Build `Frontend/src/components/ChatWindow.jsx` to assemble `MessageList` and `InputBar`
- [ ] T012 [US1] Integrate `ChatWindow` into `Frontend/src/App.jsx` and verify end-to-end flow

**Checkpoint**: MVP Functional - Basic chat interaction works.

---

## Phase 4: User Story 2 - Responsive Mobile Experience (Priority: P2)

**Goal**: The interface works flawlessly on mobile devices with full-screen layout.

**Independent Test**: Resize browser to 320px width, verify layout is centered and input remains fixed at bottom.

### Implementation for User Story 2

- [ ] T013 [US2] Update `Frontend/src/App.jsx` layout to ensure 100vh viewport height on mobile browsers
- [ ] T014 [US2] Apply Tailwind responsive classes to `Frontend/src/components/ChatWindow.jsx` for centered mobile layout
- [ ] T015 [US2] Implement auto-expanding textarea logic in `Frontend/src/components/InputBar.jsx` for better mobile UX

**Checkpoint**: Mobile Optimized - UI is fully responsive.

---

## Phase 5: User Story 3 - Robust Error Handling & Feedback (Priority: P3)

**Goal**: Users see clear feedback for loading states and network errors.

**Independent Test**: Turn off backend, send message, verify error banner appears. Verify "thinking" indicator shows during requests.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Build "Thinking/Typing" animated indicator in `Frontend/src/components/UI/TypingIndicator.jsx`
- [ ] T017 [P] [US3] Build Error Toast/Banner in `Frontend/src/components/UI/ErrorDisplay.jsx`
- [ ] T018 [US3] Integrate loading and error UI into `Frontend/src/components/ChatWindow.jsx`
- [ ] T019 [US3] Implement auto-scroll to bottom functionality in `Frontend/src/components/MessageList.jsx` using `useRef`

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and feature completeness.

- [ ] T020 [P] Implement Markdown rendering in `Frontend/src/components/MessageItem.jsx` using `react-markdown`
- [ ] T021 [P] Implement Shift+Enter for new lines in `Frontend/src/components/InputBar.jsx`
- [ ] T022 [P] Configure environment variables in `Frontend/.env` and `Frontend/src/services/api.js`
- [ ] T023 Final accessibility audit: Verify keyboard navigation and ARIA labels

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Prerequisite for everything.
- **Foundational (Phase 2)**: Prerequisite for all user stories.
- **User Story 1 (Phase 3)**: MVP - High priority.
- **User Story 2 & 3**: Can run in parallel after US1 foundation, but recommended in priority order.

### Parallel Opportunities
- T003, T004 (Setup)
- T008, T009 (US1 Components)
- T016, T017 (Error/Loading UI)
- All Phase N tasks

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Setup project (Phase 1)
2. Implement core logic (Phase 2)
3. Implement basic UI (Phase 3)
4. **VALIDATE**: Ensure basic chat works before polishing.

### Incremental Delivery
- Add responsive layout (Phase 4)
- Add error handling and indicators (Phase 5)
- Add Markdown and final polish (Phase N)
