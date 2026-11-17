# Run 4: back-to-back booking, owner totals, owner cancel (17 Nov, honest log)

Test: `tests/owner_test.md` (written from SPEC.md only). Two Kane runs through the gate, site was correct (no bug planted).

| Step | Run A | Run B |
|---|---|---|
| Book 11:00 haircut ($48.60, deposit $9.72) | passed | passed |
| Book 11:45 blow-dry, starts exactly when the first ends ($32.40, $6.48) | passed | passed |
| Owner totals: 2 bookings, 1.25 h, $81.00, $16.20 | passed | passed |
| Owner cancels the first booking | failed: Kane dismissed the browser's "Cancel booking?" popup (`automation_bug / agent_misstep`) | failed: `test_data_issue` ("Ana Ray not in the list"; Kane's replay had already cancelled her) |
| Cancelled time is free again | skipped | skipped |

**Verdict: no site bug found.** Both failures are Kane/test problems, not the site: after run A the test was changed to say
"accept the popup". For the last two steps we checked by hand against a fresh server (script, not Kane):
cancelling as owner marks the booking cancelled and the totals become 1 booking, 0.5 h, $32.40, $6.48, and 11:00 is
offered again for Noor. So steps 4-5 are verified by script, not by Kane.
