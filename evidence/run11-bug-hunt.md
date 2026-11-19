# Bug hunt: 4 hidden bugs, Kane designs the tests, the agent fixes (recorded run 11, 19 Nov 2026)

## Setup
- Kane CLI read SPEC.md, asked us questions about gaps in it, and designed its own tests (commit a041b15 for the
  first 4, before any bug existed).
- A separate agent then planted 4 one-line bugs in `lib/logic.js` (commit 16f48ba). The list stayed sealed until
  after run 9. The coding agent in the runs was not told which bugs exist. It could see from the git log that some
  were planted.
- Run 9 (18 Nov) caught **0 of 4**. Kane's `cover gaps` report explained most of it: only 1 of the spec's 6
  use-cases had tests (17% coverage).
- We then had Kane design 5 more tests from its own gap list: customer cancel and owner day totals (commit
  9be2af3). This happened **after** the bug list was opened. We did not tell Kane about any bug. We did pick the
  test bookings ourselves (23 h, exactly 24 h and 48 h before the start, on a frozen test clock).
- Three changes made the site testable for Kane (commit 5fd8877, rules untouched):
  - cancel asks with a second click instead of a browser pop-up, which Kane's browser closes by itself;
  - a "My booking" menu link;
  - a "test clock" line on every page.
- The gate runs Kane with `--no-adaptive-heal`. In run 9, Kane's replay correctly failed the double-booking check.
  Kane then re-ran the step, misread the booked time and passed itself. With heal off, a failed replay stays failed.

## Run 11 (recorded, 64 min, 3 gate rounds, 6 tests)
| Planted bug | Kane | Agent | Kane re-check |
|---|---|---|---|
| 1. Leo's price -20% instead of -15% | missed: no test books Leo, and Kane's gap report doesn't list stylist pricing | not touched | — (fixed by hand afterwards, 6c70e81) |
| 2. A new booking may start inside an existing one | missed: t-3 passed | fixed it anyway, spotted while reading the file | not separately proven |
| 3. Customers may cancel online up to 12 h before (spec: 24 h) | **caught** (t-6, major) | fixed | **passed** |
| 4. Owner "expected revenue" sums prices before tax | **caught** (t-8, major) | fixed | **passed** (round 2) |

Kane also kept flagging the name/phone test (t-4). The agent tightened the rules to count letters and digits, as the
spec says. A real phone such as "+92 300 123 4567" was refused before this. Kane itself labelled those reports
"assertion stale" (minor).

**Kane caught 2 of 4 hidden bugs**, the agent fixed both, and Kane confirmed both fixes. In the last two rounds t-4
and t-8 failed again with Kane blaming its own recorded steps ("stale", "test data"), and the agent rightly changed
nothing.

Commits: agent's changes cf5cf0b (as it left them), Leo fixed by hand 6c70e81. Gate log: `recordings/gate-log.jsonl`
(local). The video is kept locally for the demo cut.

## Also learned
- Claude Code showed the gate's exit-code-2 reply as a non-blocking error (run 10: Kane caught 2 bugs, but the agent
  never saw them). The gate now answers with `{"decision":"block","reason":...}` (b04efb3).
- Kane's three longest new tests (t-5, t-7, t-9: 10+ steps across pages) failed on Kane's own steps in two pre-runs,
  so they were left out of the recorded run.
