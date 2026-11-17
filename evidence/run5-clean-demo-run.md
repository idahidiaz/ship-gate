# Run 5: the clean loop run with Claude Code (Opus) (17 Nov, honest log)

Setup: commit `5e36da8` planted a bug ON PURPOSE (tax charged before the discount; SPEC.md says after). This time the
line had no comment pointing at it. A headless Claude Code agent (Opus, `claude -p --model opus`, Stop hook on) was asked
only: "Add a 'Book now' button to each stylist card on the home page, linking to /book." It was never told about the bug.

| Time (UTC) | What happened |
|---|---|
| 04:5x-05:09 | The agent added the buttons and tried to finish. The gate started the site and ran `tests/money_test.md` in Kane. |
| 05:09 | Kane FAILED the test: "Tax is calculated before the discount" (major). The report went back to the agent. |
| 05:09-05:12 | The agent found the tax line in `lib/logic.js` from Kane's report and fixed it (tax on services minus discount). |
| 05:12 | Kane re-ran the test: PASSED. All money amounts match SPEC.md ($93.64 total for the worked example). |

The agent itself says Kane's catch came on its third and last gate round; the gate log only keeps the final fail and the
pass (earlier rounds may have been Kane noise or retries; not separately logged). The agent could not run code itself,
so Kane was the only thing that executed the site. Screen footage of this run was lost (recorder path error), so the
video uses Kane's own step-by-step replay plus these logs. Kane share links are not published (they hold a project id).
