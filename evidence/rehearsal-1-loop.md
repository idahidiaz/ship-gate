# Rehearsal 1: the Kane -> agent loop (17 Nov, honest log)

Setup: a bug was planted ON PURPOSE (commit 902baaa: tax charged before the discount; SPEC.md says after).
A separate headless Claude Code agent (Sonnet) was asked only to add the salon phone number and address to the
home-page footer, with the Stop hook (`scripts/kane-gate.js`) switched on. The agent was never told about the bug.

| Time (UTC) | Gate round | What Kane reported | What happened |
|---|---|---|---|
| 04:06 | 1 | `Replay targets unavailable localhost booking URL` (major) | Noise: Kane's saved test pointed at an old port. Sent to the agent anyway. Fixed afterwards by making the tests and the gate use the same address. |
| 04:10 | 2 | `Review tax ignores the applied discount` (major) | The real planted bug. From Kane's report alone the agent found and fixed the tax line in `lib/logic.js` (commit follows this note). |
| 04:12 | confirm | hours_test: passed | |
| 04:14 | confirm | money_test: passed | All amounts match SPEC.md ($93.64 total, $18.73 deposit, $74.91 at the salon). |

The agent stopped at its 14-turn limit before a final summary; the fix itself is correct and was confirmed by the
passing run above. Raw gate log lines (without the private share links): see `recordings/gate-log.jsonl` on the
author's machine.
