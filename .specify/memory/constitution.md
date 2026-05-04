<!--
<sync_impact_report>
- Version change: N/A -> 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] -> Code Quality & React Standards
  - [PRINCIPLE_2_NAME] -> Robustness & Error Handling
  - [PRINCIPLE_3_NAME] -> Security & Safety
  - [PRINCIPLE_4_NAME] -> Accessibility (a11y)
- Added sections: Technology Stack, Development Workflow
- Removed sections: [PRINCIPLE_5_NAME]
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated)
  - .specify/templates/spec-template.md (✅ updated)
  - .specify/templates/tasks-template.md (✅ updated)
- Follow-up TODOs: None
</sync_impact_report>
-->

# DocuPilot Constitution

## Core Principles

### Code Quality & React Standards
- Use React functional components and Hooks exclusively. Never use class components.
- Write clean, modular, and DRY (Don't Repeat Yourself) code.
- Never use inline styles. All styling MUST use Tailwind CSS utility classes exclusively.
- Rationale: Ensures a modern, maintainable codebase and consistent design system.

### Robustness & Error Handling
- Never let the application fail silently. All network requests MUST be wrapped in `try/catch` blocks.
- All errors MUST be logged to the console with context and caught gracefully to prevent application crashes.
- Always handle loading states and display user-friendly error messages in the UI when a failure occurs.
- Rationale: Guarantees a stable user experience and facilitates rapid debugging.

### Security & Safety
- Never hardcode sensitive API keys; always use environment variables.
- Always sanitize user input before rendering it to the DOM to prevent XSS (Cross-Site Scripting) attacks.
- Safely wrap browser APIs like `sessionStorage` in `try/catch` blocks in case the user's browser has disabled local storage.
- Rationale: Protects user data and ensures application resilience across different environments.

### Accessibility (a11y)
- Ensure semantic HTML is used throughout the application.
- All interactive elements (buttons, text areas) MUST have appropriate `aria-labels` or associated visual labels.
- The application MUST be fully navigable and usable using only a keyboard.
- Rationale: Ensures the application is inclusive and usable by everyone, regardless of ability.

## Technology Stack
- **Frontend**: React (Functional Components, Hooks), Tailwind CSS.
- **Backend**: FastAPI, Python 3.11+.
- **AI**: Google GenAI (Gemini), LangChain.
- **Database**: ChromaDB (Vector Store).

## Development Workflow
- Follow the Research -> Strategy -> Execution cycle for all features.
- Maintain strict alignment between implementation plans (`plan.md`) and source code.
- Prioritize user stories and ensure each is independently testable.
- All code changes MUST undergo peer review or agent-based validation against these principles.

## Governance
- This constitution supersedes all other development practices within the project.
- Amendments require documentation of rationale and a semantic version increment.
- Compliance is verified during the "Constitution Check" phase of the implementation plan.

**Version**: 1.0.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
