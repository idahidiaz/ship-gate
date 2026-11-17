# ship-gate

A coding agent says "done". Before that counts, Kane CLI opens the site in a real browser and tries it like a customer.
If Kane finds a problem, its report goes straight back to the agent, which must fix it. The agent can only finish
once Kane passes.

Made for the KaneCLI Online Hackathon. Agent: Claude Code. Tester: Kane CLI.

## What is in here

| Part | What it is |
|---|---|
| `server.js`, `lib/`, `public/` | **Bloom & Co.**, a salon booking site (plain Node, no dependencies, no sign-in). Multi-service bookings, stylist price factors, promo codes, tax, deposit, opening hours, overlap rules, 24 h cancel rule, owner day totals. |
| `SPEC.md` | The rules of the site, written as a spec. Every Kane test is written from this file, never from the code. |
| `tests/*_test.md` | Kane tests in plain English (money maths, opening hours, back-to-back bookings and owner totals). |
| `scripts/kane-gate.js` + `.claude/settings.json` | The loop: a Claude Code **Stop hook**. When the agent tries to finish, it starts the site, runs the Kane tests, and on a real failure exits with code 2 and Kane's report, so Claude Code hands the failure back to the agent. Max 3 rounds. |
| `evidence/` | Honest notes of real Kane runs, including what Kane caught. |

## Run the site

```
node server.js
```

Open http://localhost:4173 (needs Node 18+). Pages: `/`, `/book`, `/owner`. No logins.
Set `SHIPGATE_NOW=2026-11-20T09:00:00` to fake the clock for the 24 h cancel rule.

## Run Kane on it yourself

```
npm i -g @testmuai/kane-cli
kane-cli login --oauth
PORT=4180 node server.js      # terminal 1: the tests expect port 4180
kane-cli testmd run tests/money_test.md --agent    # terminal 2
```

(On Windows PowerShell: `$env:PORT=4180; node server.js`.) Each test takes about 3 to 5 minutes.
Replace `money_test.md` with `hours_test.md` or `owner_test.md`.

## Switch on the loop

```
export KANE_GATE=1            # PowerShell: $env:KANE_GATE='1'
export KANE_CLI=kane-cli      # path to kane-cli if it is not on PATH
claude -p "add a Book now button to each stylist card linking to /book" --permission-mode acceptEdits --max-turns 30
```

Optional: `KANE_TESTS=tests/money_test.md` (comma-separated list), `KANE_HEADED=1` to watch the browser.
The gate is off unless `KANE_GATE=1`, so normal work is not slowed. Log: `recordings/gate-log.jsonl`.

## Honest notes

- **One bug was planted on purpose** for the demo (commit `902baaa`: tax charged before the discount, SPEC says after).
  The agent was never told about it. Kane found it from the spec alone and the agent fixed it from Kane's report alone
  (`evidence/rehearsal-1-loop.md`).
- Kane also caught a real slip of ours in the very first, simpler version of the site: the "You're booked!" box was
  visible before booking (`evidence/run1-kane-caught-bug.md`).
- On the full Bloom & Co. site Kane has found no natural bug so far; we only claim what the logs show.
- Kane's first report can be noise (for example an old test URL, or a page-load timeout it labels `environment_issue`).
  The gate retries environment issues once and never blames the site for them.
- Fallback if you cannot run it: the demo video and the logs in `evidence/`.
