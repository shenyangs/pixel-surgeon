# PixelSurgeon

A local visual CSS patch studio: select a button, inspect a proposal, write a real stylesheet, and undo it with browser evidence.

**X hook:** One precise CSS edit. Real pixels. A real undo.

**Status: PARTIAL — functional preset workflow; AI conversion is not implemented or verified.** This release runs without an API key and labels every proposal `Preset patch / NO AI`. It does not generate model output. The bundled Orbit site is a React fixture; file changes and screenshots are real.

## Run independently

Requires Node.js 22+ and npm on macOS/Linux. No parent workspace files or user credentials are required.

```sh
npm ci --cache .npm-cache
npm run browser:install
npm run dev
```

Open http://127.0.0.1:4203. Vite binds to 127.0.0.1:4203 and Express to 127.0.0.1:5203. Keep both ports free. The screenshot service needs the web server running. The browser installer stores Chromium in this project's `.browsers` directory. An explicitly supplied `PLAYWRIGHT_BROWSERS_PATH` may point to a compatible existing installation. No hardcoded machine paths are required.

`.env.example` documents the current mode; no provider configuration is supported yet. An API key does not activate AI. `npm run build` checks TypeScript and builds both the editor and bundled React fixture. `npm run dev` is the supported local operation command; no hosted production deployment is provided.

## Three-click demo

1. Click **Start creating** in the embedded Orbit canvas. This selects `.hero-cta`.
2. Keep or type **make the CTA rounded and purple**, then click **Generate preset**. Inspect the exact proposed file diff; the page is still unchanged.
3. Click **Apply patch**. The backend captures the original, writes `fixtures/demo-site/src/theme-overrides.css`, and captures the changed browser pixels. The CTA becomes purple and rounded.

Reload to prove persistence. Click **Undo** to restore the previous CSS and produce a third screenshot. Before/after/undo evidence survives editor refresh. The `Pixels, with proof` section displays actual screenshots, not simulated previews.

## Real verification

```sh
npm run build
npm run test
npm run e2e
npm run demo
```

Unit tests reject traversal selectors, JavaScript URLs, script injection, unsupported properties, extra path fields, selector expansion, and oversized CSS values. E2E tests assert the unchanged pre-apply style, actual disk content, changed computed style, different screenshot bytes, persistence after reload, and restored style/content after Undo. API assertions cover foreign origins, invalid proposal IDs and unsupported requests. The demo records that same complete workflow, including screenshot capture and assertions.

Verified result: build passed; 9 unit tests passed; 2 E2E tests passed; 1 recorded demo passed (about 19 seconds). Initial E2E failed because the matching browser was missing. The initial optional headless-shell download was interrupted; the final installer uses full Chromium with `--no-shell` and passed. Both diagnostic logs are retained.

Local evidence (intentionally excluded from Git):

- `artifacts/logs/`: real command output, including the initial E2E failure from a missing matching browser and the successful rerun.
- `artifacts/playwright/e2e/` and `artifacts/playwright/demo/`: genuine Playwright video and test screenshots.
- `artifacts/demo-before.png`, `artifacts/demo-after.png`, `artifacts/demo-undo.png`: full editor screenshots.
- `artifacts/captures/`: backend browser screenshots; `artifacts/captures.json`: current evidence references.
- `status.json`: machine-readable final verification result. Paths are relative to this repository; artifacts are generated locally rather than committed.

## Scope and boundaries

Only `.hero-cta` is selectable. Six properties are allowed: color, background-color, border-radius, padding, font-size, box-shadow. Zod applies strict objects and conservative value grammars; no selectors, scripts, paths, arbitrary commands, URLs or remote pages are executed from requests. The only editable source file is the fixed fixture stylesheet. The previous content is copied to `artifacts/original.css` for one-level persistent Undo. Proposals expire after five minutes and stale CSS is rejected; concurrent apply/undo requests are blocked.

This is a single-user local tool, not a multi-user service. It has no authentication and must remain on loopback. Mutations require JSON and reject foreign browser origins. Screenshot navigation has a 15-second timeout. Images and rollback metadata are written only to the project's artifacts directory. Source modifications are explicit and may appear in `git diff` until undone. Failed screenshot capture after a successful write can leave the stylesheet changed; inspect the canvas and use Undo. Screenshots accumulate locally and can be removed when no longer needed.

The preset recognizes requests containing “round” and “purple”; it is not general language understanding. No live inference, arbitrary website editing, semantic CSS analysis, visual scoring or automatic repair is claimed. MIT licensed.
