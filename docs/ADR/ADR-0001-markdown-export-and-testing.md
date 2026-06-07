# ADR-0001: Markdown Export and Testing Strategy

- **Date**: 2026-06-07
- **Status**: Accepted
- **Deciders**: Gemini CLI, ayato-labs

## Context
The project required a new feature to export site content in Markdown format. Additionally, as the codebase grows, there was a need for a robust testing and linting strategy to ensure code quality and prevent regressions.

## Decision
1.  **Markdown Export**: Implemented a recursive DOM traversal logic to extract text and numbers, converting them into Markdown-like structures (Headings, Lists, Emphasis, Links).
2.  **Code Separation**: Extracted the Markdown conversion logic into `converter.js` to enable isolated unit testing.
3.  **Testing Framework**: Adopted `Vitest` with `JSDOM` for unit, integration, and system testing. This allows simulating the browser environment in a Node.js context.
4.  **Linting & Formatting**: Integrated `ESLint` (Flat Config) and `Prettier` with a 100-character line limit. Applied a "realistic compromise" where essential logic is strictly checked while ignoring non-essential stylistic rules for HTML/CSS.
5.  **CI/CD**: Updated GitHub Actions to run lint, format, and test steps on every pull request.

## Consequences
### Positive
- Improved maintainability through code separation.
- High confidence in Markdown extraction accuracy via automated tests.
- Consistent code style across the project.
- Faster development cycle with local testing without needing to reload the extension in Chrome constantly.

### Negative / Risks
- Increased dependency count (`vitest`, `eslint`, `prettier`).
- Need to keep the simplified conversion logic in `popup.js` in sync with `converter.js` (or use a build tool like Vite/Webpack to bundle them).

## References
- Issue: Markdown Export Implementation
- PR: #N (current)
