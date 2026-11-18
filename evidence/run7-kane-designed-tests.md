# Run 7: Kane CLI designs its own tests from SPEC.md (18 Nov, honest log)

Until now we wrote the Kane tests ourselves, and `tests/money_test.md` spells out the exact expected amounts.
For this round we wrote no tests. Kane CLI 0.10.4 read SPEC.md and designed them.

## 1. Kane reviewed the spec first
`kane-cli context ingest SPEC.md --local --mode agent`, then `kane-cli context extract --mode agent`.
Before writing anything, Kane asked about gaps in our spec. We answered from the site's intent:

| Kane's question | Our answer |
|---|---|
| Does "deposit due now" take a payment online, or only show the amount? | Only show it |
| Is the owner view behind a login? | Not specified (no login in this demo) |
| Wrong code + phone on the booking page: error or unspecified? | Deny with an error |
| Can the same service be picked twice? | No repeats |
| At exactly 24 h before the start, can the customer still cancel? | Yes, exactly 24 h is allowed |
| Does a cancellation refund the deposit? | Not specified |

(The first `--plan` try asked 5 questions; the real run asked 3. Both sets are in the table.)

Kane then listed 6 use-cases: book a visit, look up a booking with code + phone, cancel as customer,
cancel as owner, the owner's day totals, browse services and opening hours. Cost: about 9 credits.

## 2. Kane designed the tests
`kane-cli design tests --use-case uc-1 --max 4 --allow-unreviewed --mode agent` (about 20 credits) gave
21 acceptance criteria and 4 tests, now in `.testmuai/tests/`:

- t-1: the worked example booking (Ava, cut + gloss, PAIR15), every amount and the confirmation
- t-2: PAIR15 with one service must give a clear error and no discount
- t-3: a Tuesday colour booking: no start after 16:00, and no start that overlaps another booking of the same stylist
- t-4: a one-letter name, a 6-digit phone and a bad email must each block the booking

The test values in `.testmuai/variables/assurance.json` are ours (start URL, "Sam Lee", "+44 20 7946 0958").

## 3. First run on the unchanged site (no planted bugs)
`kane-cli testrun run --from-context T-1,T-2,T-3,T-4`

| Test | Result |
|---|---|
| t-1 worked example money | passed |
| t-2 PAIR15 with one service | **failed: a real gap we did not plant** |
| t-3 Tuesday colour, overlap, closing | passed |
| t-4 bad name / phone / email | passed |

The t-2 find: Kane typed PAIR15 on the details step with one service and reported
"PAIR15 was entered, but no ineligible-code error or discount row appeared to verify."
That is true. The running summary next to the form never shows the promo message; it only appears later
on the review screen. SPEC.md asks for "a clear error message". We have left it unfixed so the coding
agent can fix it through the gate on the recorded run.

First runs are slow while Kane authors its steps (t-1 took 25 minutes, t-2 17 minutes). Replays are
faster (t-4 replay: about 4 minutes).
