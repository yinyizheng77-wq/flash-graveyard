# Hooks

Kiro hooks (v1 JSON format, see https://kiro.dev/docs/hooks/) live here.
They fire automatically in Kiro IDE 1.0+ and Kiro CLI V3 (this repo was
built with Kiro CLI 3.4.0).

| File | Trigger | What it does |
| --- | --- | --- |
| `test-on-save.json` | `PostFileSave` on `src/**/*.js` or `tests/**/*.js` | Runs `npm test` (the full `node --test` suite) every time the agent saves a source or test file. |
| `verify-on-stop.json` | `Stop` | Prompts the agent to run `npm test` and verify the active spec's `tasks.md` boxes are honest before ending the session. |

Notes:
- File triggers only fire on changes **made by the agent**, not on manual
  editor saves (Kiro docs behavior).
- These hooks run commands automatically, so review them like code before
  accepting them from a pull request.
