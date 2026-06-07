# ADR-0002: Project Structure and Build Process

- **Date**: 2026-06-07
- **Status**: Accepted
- **Deciders**: Gemini CLI, ayato-labs

## Context
As the project evolved with the addition of Markdown export, automated tests, and linting, the root directory became cluttered with configuration files, test scripts, and source code. This made it difficult to identify the essential files required for the Chrome extension packaging.

## Decision
1.  **Introduction of `src` Directory**: Moved all functional extension files (manifest, HTML, JS, CSS, icons) into a dedicated `src` directory. This clearly separates production code from development tooling and tests.
2.  **Automated Build Script**: Implemented a `build` script in `package.json` using `shx` and `bestzip` to ensure cross-platform compatibility.
3.  **Distribution Artifact**: The build process generates a `dist/` directory for staging and a `html_downloader.zip` file at the root for distribution to the Chrome Web Store.

## Consequences
### Positive
- Clear distinction between "source" and "development" files.
- Simplified packaging process for updates.
- Reduced risk of including unnecessary files (like tests or node_modules) in the production zip.

### Negative / Risks
- Requires a build step (`npm run build`) before deployment.
- Testing paths needed adjustment to point into the `src` folder.

## References
- PR: #N (current)
- Folder: `src/`
