## Developer Ecosystem workflow (read first)

This repo belongs to a Developer Ecosystem pod (DevEx: MCP, CLI, SDK, Starters including the SAP connector; Marketplace; Mkt Apps; Developer Hub).
New features and changes go through the deveco workflow before any code is written here:

1. Find the work's DSCDX idea and where it is in the flow. No idea yet: write one with the `brief` skill in `contentstack/product-wiki`.
2. The PRD, TRD, test cases, tickets and code come from your own routines (PM, Architect, QA agent, Dev), gate by gate. Do not plan, draft or build them in this session. No routine for a step yet: set it up with the `deveco-aisdlc-onboarding` skill in `contentstack/agent-skills`.
3. The order, gates and intake: https://github.com/contentstack/agent-skills/blob/main/skills/deveco-aisdlc-onboarding/references/run-protocol.md

Bug fixes and support cases keep this repo's usual path. Not sure which applies? Ask before building.

## This repo

Quick Web Lookup: a Marketplace entry sidebar app (Tier 2, UI + proxy). It finds URLs in the entry's content (any field type, nested) and shows a link preview for each, fetched from Peekalink through the app-config proxy (`appSdk.api('/preview')` with the `{{map.API_KEY}}` mapping placeholder, so the customer's key never reaches the browser). The key is entered on `/app-configuration` and stored as server configuration (`peekalink_api_key`). When the app URL carries an `app-token`, it is verified against Contentstack's published public key (`jsrsasign`, `node-forge`). Wiki: `marketplace-apps/quickweblookup/` in `contentstack/product-wiki` if present.

| Task             | Command (Node >=22.12)                                                        |
| ---------------- | ----------------------------------------------------------------------------- |
| Install          | `npm ci`                                                                      |
| Run locally      | `npm run dev` (http://localhost:3000; the app only works inside Contentstack) |
| Lint / typecheck | `npm run lint` · `npm run typecheck`                                          |
| Unit tests       | `npm test` · `npm run test:coverage` (fails under 90%)                        |
| Build            | `npm run build` (output `dist/`, git-ignored)                                 |

- Routing is `BrowserRouter`; the manifest paths are `/entry-sidebar` and `/app-configuration`.
- Tests are Vitest specs next to the code (`*.spec.ts(x)`). Expected values come from the spec, not from running the code. Fixtures build ids and keys with `fakeId(...)`; never put a literal under a key, token, secret or authorization name.
- The in-repo Playwright suite (`e2e/`) needs the `.env.sample` variables and a Contentstack account; it is not part of CI.
- Branches `claude/<type>/<KEY>-<slug>`, conventional commits (commitlint), PRs into `main`.
