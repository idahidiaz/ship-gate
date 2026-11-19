#!/usr/bin/env node
// Ship-gate: a Claude Code "Stop" hook. When the coding agent says it is done, Kane CLI tests the site
// in a real browser. If Kane finds a problem, this script exits with code 2 and prints what Kane found;
// Claude Code then hands that text back to the agent, which must fix it before it is allowed to stop.
// The loop ends when Kane passes (exit 0) or after MAX_TRIES failed rounds (then a human looks).
//
// Off by default so normal chats are not slowed down: set KANE_GATE=1 to switch it on.
// Optional: KANE_CLI (path to kane-cli), KANE_TESTS (comma list of test files), KANE_HEADED=1 (show the browser).
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

if (process.env.KANE_GATE !== '1') process.exit(0);

const ROOT = path.join(__dirname, '..');
const KANE = process.env.KANE_CLI || 'kane-cli';
const PORT = Number(process.env.KANE_GATE_PORT || 4180);
const MAX_TRIES = 3;
const STATE = path.join(ROOT, '.kane-gate-state.json');
const LOG = path.join(ROOT, 'recordings', 'gate-log.jsonl');

const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { fails: 0 }; } };
const writeState = (s) => fs.writeFileSync(STATE, JSON.stringify(s));
const log = (o) => { fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ...o }) + '\n'); };

function waitForServer(port, tries = 40) {
  return new Promise((resolve, reject) => {
    const ping = (n) => http.get({ port, path: '/api/info' }, (r) => { r.resume(); resolve(); })
      .on('error', () => (n <= 0 ? reject(new Error('site did not start')) : setTimeout(() => ping(n - 1), 250)));
    ping(tries);
  });
}

function runKane(file, url) {
  const args = ['testmd', 'run', JSON.stringify(file), '--url', JSON.stringify(url), '--agent', '--timeout', '900'];
  if (process.env.KANE_HEADED !== '1') args.push('--headless');
  // KANE_NO_HEAL=1: a replayed check that fails stays failed (Kane may not re-author it into a pass).
  if (process.env.KANE_NO_HEAL === '1') args.push('--no-adaptive-heal');
  return new Promise((resolve) => {
    const p = spawn(JSON.stringify(KANE), args, { cwd: ROOT, shell: true });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', () => {});
    p.on('close', (code) => {
      const events = out.split(/\r?\n/).filter((l) => l.startsWith('{')).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      const end = events.find((e) => e.type === 'run_end');
      const verdict = events.find((e) => e.type === 'test_md_bug_verdict');
      const summary = events.find((e) => e.type === 'test_md_summary');
      resolve({ file, code, status: summary ? summary.overall_status : (end ? end.status : 'error'), end, verdict, summary });
    });
  });
}

(async () => {
  const state = readState();
  const dataFile = path.join(os.tmpdir(), `kane-gate-${process.pid}.json`);
  // Frozen clock + ready-made bookings for the cancel and owner tests (see scripts/fixtures.js).
  const fx = require('./fixtures');
  const frozen = fx.frozenNow();
  fx.seed(dataFile, frozen);
  const site = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SHIPGATE_DATA: dataFile, SHIPGATE_NOW: frozen }, stdio: 'ignore' });
  const stopSite = () => { try { site.kill(); } catch {} try { fs.unlinkSync(dataFile); } catch {} };
  try { await waitForServer(PORT); } catch (e) { stopSite(); console.error('Kane gate: ' + e.message); process.exit(0); }

  const tests = (process.env.KANE_TESTS ? process.env.KANE_TESTS.split(',') : fs.readdirSync(path.join(ROOT, 'tests')).filter((f) => f.endsWith('_test.md')).map((f) => 'tests/' + f));
  const failed = [], unsure = [];
  for (const t of tests) {
    let r = await runKane(t, `http://localhost:${PORT}/book`);
    const isEnv = (x) => x.verdict && x.verdict.family === 'environment_issue';
    if (r.status !== 'passed' && isEnv(r)) { log({ test: t, note: 'environment issue, retrying once' }); r = await runKane(t, `http://localhost:${PORT}/book`); }
    log({ test: t, status: r.status, title: r.verdict && r.verdict.bug_title, severity: r.verdict && r.verdict.severity, share: r.summary && r.summary.share_url });
    if (r.status === 'passed') continue;
    (isEnv(r) || !r.end ? unsure : failed).push(r);
  }
  stopSite();

  if (!failed.length) {
    writeState({ fails: 0 });
    const msg = unsure.length ? `Kane gate: no bug found, but ${unsure.length} test(s) could not run (browser/environment problem): ${unsure.map((u) => u.file).join(', ')}.`
      : `Kane gate: all ${tests.length} test(s) passed.`;
    console.log(msg); process.exit(0);
  }
  state.fails = (state.fails || 0) + 1; writeState(state);
  if (state.fails > MAX_TRIES) { writeState({ fails: 0 }); console.error('Kane gate: still failing after ' + MAX_TRIES + ' rounds; stopping so a person can look.'); process.exit(0); }

  const lines = [`KANE CLI FOUND A PROBLEM (round ${state.fails} of ${MAX_TRIES}). Fix it in the code, then finish again and Kane will re-check.`,
    'Kane tests the site against SPEC.md in a real browser. Do not edit the tests or SPEC.md to make a failure go away; fix the site.', ''];
  for (const f of failed) {
    lines.push(`Test: ${f.file}`);
    if (f.verdict) lines.push(`Problem: ${f.verdict.bug_title} (severity ${f.verdict.severity}, ${f.verdict.category})`);
    if (f.end) { lines.push(`Reason: ${f.end.reason || ''}`); lines.push(`Kane's explanation and suggested fix: ${f.end.summary || f.end.one_liner || ''}`); }
    lines.push('');
  }
  console.error(lines.join('\n'));
  process.exit(2);
})();
