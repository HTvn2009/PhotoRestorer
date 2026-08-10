# Repository Guidelines

## Project Structure & Module Organization

This is a lightweight photo-restoration web app with no build step. Keep the frontend assets at the repository root:

- `index.html` is the page markup and the entry point served at `/`.
- `style.css` contains all UI styles, themes, and responsive rules.
- `app.js` owns browser-side upload, preview, API request, and download behavior.
- `server.js` is the Node.js HTTP server. It serves the three static files and implements `POST /api/restore` using the OpenAI Images Edits API.
- `README.md` documents local setup and required environment variables.

Avoid adding generated images, API keys, or uploaded source photos to the repository.

## Build, Test, and Development Commands

The project requires a recent Node.js version with built-in `fetch`, `Blob`, and `FormData` support (Node 18+).

```powershell
$env:OPENAI_API_KEY = "your_api_key"
npm start
```

`npm start` runs `node server.js`; open `http://localhost:3000`. Set `$env:PORT = "3001"` before starting to use another port. There is currently no build command, package dependency install, or automated test command.

## Coding Style & Naming Conventions

Use CommonJS and Node built-ins on the server (`require('node:http')`). Use `const` by default and `let` only for state that changes. Follow the existing two-space indentation, single quotes in JavaScript, semicolons, and descriptive camelCase names such as `selectedFile` and `restoreImage`. Keep DOM element IDs and corresponding JavaScript variable names aligned.

Preserve the server’s explicit request validation, file allowlist, image-size limit, and JSON error responses when changing endpoints. Keep user-facing Vietnamese strings clear and consistent with the surrounding UI.

## Testing Guidelines

Manually verify changes in a browser: upload valid JPG, PNG, and WEBP files; confirm files over 10 MB are rejected; submit a restore request; retry; and download the result. For server changes, also check missing `OPENAI_API_KEY`, malformed payloads, and unsupported routes with a local HTTP client. Add focused automated tests if a test framework is introduced.

## Commit & Pull Request Guidelines

Recent history uses concise imperative summaries, for example `Update README with Image Edits endpoint details` and `Add files via upload`. Keep commits narrowly scoped and avoid unrelated formatting changes. Pull requests should explain the user-visible behavior, link related issues when available, include screenshots for UI changes, and state how the change was manually tested. Never include credentials in commits, screenshots, or PR descriptions.
