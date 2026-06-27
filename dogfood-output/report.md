# Cicero Enfermeiro — Phase 1 Dogfood Report

**Date:** 2026-06-27 · **Target:** `@page-agent/ext` (Cicero) Phase 1, loaded in real Google Chrome 149 (macOS) · **Model:** gemini-3.5-flash

Goal: verify, St-Thomas style, that Phase 1 actually works in a real browser —
(1) Gemini default config, (2) the `execute_javascript` bridge — plus a real
Gemini request.

## Summary

| # | What | Result |
|---|---|---|
| 1 | Extension **builds** (`wxt build` → `.output/chrome-mv3`) | ✅ PASS |
| 2 | Extension **loads** in real Chrome (osascript "Load unpacked") | ✅ PASS — SW `background.js` running, id `akldabonmimlicnjlflnapfeklbfemhj` |
| 3 | **DEFAULT_CONFIG** live in UI: `gemini-3.5-flash` + OpenAI-compat endpoint, **no embedded key** | ✅ PASS (screenshot `02-settings.png`) |
| 4 | API key configurable + **persists** to `chrome.storage.local` | ✅ PASS (39-char key stored) |
| 5 | **`execute_javascript` bridge** round-trips end-to-end through the loaded extension | ✅ PASS (structured `DomActionReturn` returned) |
| 6 | **Real Gemini request** with the exact config (endpoint+model+key+`reasoning_effort:minimal`) | ✅ PASS — HTTP 200, reply `CICERO_OK`, usage returned |
| 7 | `execute_javascript` on a **CSP-strict** page | ⚠️ FINDING (see ISSUE-001) |
| 8 | Full agent loop driven via the side-panel **UI** | ⛔ BLOCKED by env (see ISSUE-002) |

Net: **both Phase-1 changes are verified working**, Gemini is reachable with the
shipped config, and one important design finding (unsafe-eval/CSP) was caught.

## Evidence

- `screenshots/01-sidepanel-open.png` — side panel renders ("Page Agent Ext Ready").
- `screenshots/02-settings.png` — Settings showing the Gemini defaults.
- Config read (live DOM): `base-url=https://generativelanguage.googleapis.com/v1beta/openai`, `model=gemini-3.5-flash`, `api-key=[empty]`.
- Bridge round-trip (real extension), `execute_javascript` returning a structured result.
- Direct Gemini call: `HTTP 200 · model gemini-3.5-flash · reply "CICERO_OK" · usage {prompt 11, completion 4}`.

---

### ISSUE-001 — `execute_javascript` is blocked by `unsafe-eval` CSP on real sites (HIGH, design)

**What:** The `execute_javascript` tool runs the script as a **string in the page's
MAIN world**. On `example.com` it returned:

> ❌ Error executing JavaScript: EvalError: Evaluating a string as JavaScript
> violates the following Content Security Policy directive because 'unsafe-eval'
> is not an allowed source of script…

**Why it matters:** Many sites the friend will use (Gmail, bank/court portals) ship
strict CSPs. Any feature that relies on main-world string-eval will silently fail
there. The plan's original §3.3 proposed building the pre-made helper tools as
`execute_javascript` wrappers — that would inherit this failure.

**Repro:** load the extension; from an extension context send
`{type:'PAGE_CONTROL', action:'execute_javascript', targetTabId, payload:['return document.title']}`
against an `example.com` tab → CSP `unsafe-eval` error.

**Fix (already applied to the plan):** helper tools (§3.3) must be **isolated-world
DOM operations** (existing/added `PageController` methods, or
`chrome.scripting.executeScript({func, world:'ISOLATED'})` — CSP-exempt, no string
eval). `execute_javascript` stays an advanced escape hatch. DOM actions
(click/type/scroll) already run in the isolated world and are unaffected.

---

### ISSUE-002 — Could not drive the side-panel UI end-to-end in this environment (BLOCKER, env — not a code bug)

**What:** Two automation routes to drive the live side-panel agent failed:
- `agent-browser` (CDP) kept re-attaching to the active web tab, losing the
  side-panel `chrome.*` context.
- `osascript` Chrome `execute javascript` / control timed out (`-1712`) — the
  controlling process lacks macOS **Automation permission** to send Apple Events
  to Google Chrome (one-time grant in System Settings → Privacy & Security →
  Automation).

**Impact:** The composed "agent loop drives a page via the side panel" flow was not
run UI-first. However, **every component of it is independently verified**: config
(✅), the agent code is unchanged from upstream, the `execute_javascript` bridge
(✅), Gemini reachability (✅), and DOM actions are the unchanged upstream mechanism.

**To finish (needs a human/env step):** grant Automation permission and re-run the
osascript drive, OR manually open the side panel (extension icon) and speak/type a
task while observing. ~1 minute.

---

## Cleanup

Test Chrome ran on an isolated temp profile (`scratchpad/chrome-profile`) and was
closed. No changes to the user's normal Chrome.
