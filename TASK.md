# A03 — PixelSurgeon

Build a true visual CSS patcher for a bundled local React demo site. Read ./AGENTS.md. Do not simulate editing or allow arbitrary file writes. Deliver one fully verified before/after flow in 110 minutes.

## Stack and security
- React/Vite editor UI + Express API + Playwright screenshot capture. Zod validation for `DesignPatch {selector, property, value}`. Whitelist ONLY safe properties: color, background-color, border-radius, padding, font-size, box-shadow, with constrained value types. Reject unsafe selectors/values.
- Fixture site lives under `fixtures/demo-site/`; API writes ONLY its specifically allowlisted `src/theme-overrides.css`, after showing and validating diff. Never accept arbitrary filesystem paths, scripts or shell commands from LLM output. Snapshot/copy original for rollback.
- Actual LLM conversion is optional via `OPENAI_API_KEY` (or documented supported provider) and must receive a structured response. Without a key, offer clearly labelled 'Preset patch / NO AI' so UX still works; do not claim AI drove it.

## P0 happy path
1. Embedded or adjacent demo-site iframe shows ugly/broken CTA; selecting a DOM element picks its approved selector.
2. User types 'make the CTA rounded and purple' and presses Generate. If model configured, obtain actual structured patch; otherwise use named preset clearly labelled algorithmic. Show proposal and code diff BEFORE applying.
3. Click Apply; backend physically updates the allowlisted CSS file. Browser screenshot AFTER materially differs from BEFORE. Reload proves change persists.
4. Undo restores original CSS; generate new screenshot; show both in UI.

## Must prove
- Unit tests: rejects `../../`, `url(javascript:...)`, script injection, unsupported properties.
- E2E: select CTA, apply preset, check computed border-radius/background changed, reload and assert persists, undo restores original. Don't settle for visual toast.
- `tests/demo.spec.ts` records the actual before/after/undo and saves screenshots/video.
- README marks AI capability incomplete if no live API call ran; limits changes to bundled demo-site.

## Visual / X
Screen split: selected broken button left, minimal diff in center, corrected UI right. 0–3s circle ugly button, 3–11s 'AI proposes CSS', 11–19s click Apply and pixel-perfect change, 19–24s show exact Git diff.


Execute within this directory only. Run npm install, implement, then build/test/e2e/demo. Preserve real logs and status.json.

This is an authorized independent sprint execution. Start implementing now, no confirmation. Do not spawn subagents. All writes limited to this app directory; use npm install --cache .npm-cache and keep .npm-cache ignored. Existing Playwright browsers may be read from ~/Library/Caches/ms-playwright; if install required use PLAYWRIGHT_BROWSERS_PATH inside this project. Install dependencies, replace starter tests with meaningful behavior tests, run build/test/e2e/demo and preserve actual logs, screenshot and video. Do not read user credentials or other project data. Missing model keys: runnable clearly labelled fixture and PARTIAL status. Add LICENSE. Verify and finish, not merely plan.
