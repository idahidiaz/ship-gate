# Run 6: the final recorded run (17 Nov, honest log)

Setup: commit `bc2c16a` planted the tax bug ON PURPOSE again (no comment, agent not told). A headless Claude Code agent
(Opus, Stop hook on) was asked only to add the salon's opening hours to the home-page footer. The screen was recorded;
the demo video is cut from that footage (Kane's browser driving the booking, the real review screen).

| Time (UTC) | What happened |
|---|---|
| ~05:4x | Agent edits the footer and tries to finish; the gate starts Kane on `tests/money_test.md`. |
| 05:55 | Kane FAILED: "Recorded next-button selector no longer matches" (minor). This was noise, not the tax bug: on screen the review page shows Total $94.86 (wrong; SPEC says $93.64), but Kane's report named the Next button. |
| 05:55-05:59 | The agent did not trust the report. It checked the buttons (fine), compared the money maths with SPEC.md and Kane's earlier finding in the gate log ("tax ignores the discount"), and fixed the tax line in `lib/logic.js`. |
| 05:59 | Kane re-ran the same test: PASSED (Total $93.64, deposit $18.73, as SPEC.md). |

Honest reading: in THIS run the loop caught the failure and the agent fixed the real bug, but the agent used the earlier Kane
result from the log, not only this run's report. The cleaner proof that Kane's own report names the bug is run 5
(`run5-clean-demo-run.md`: "Tax is calculated before the discount", 05:09) and rehearsal 1.
