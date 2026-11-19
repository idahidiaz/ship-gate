// Test fixtures for the Kane gate: a frozen clock and three ready-made bookings,
// so Kane's cancel tests can check the 24-hour rule on both sides of the line.
// The clock is frozen at 11:00 on the next Wednesday (at least one day ahead).
// Bookings (Noor, Signature cut, Sam Lee, +44 20 7946 0958):
//   BC-LATE23  Thursday 10:00  = 23 h after "now"   (customer may NOT cancel online)
//   BC-CUT24   Thursday 11:00  = exactly 24 h       (customer may cancel)
//   BC-EARLY48 Friday 11:00    = 48 h               (customer may cancel)
// Usage: node scripts/fixtures.js <data-file>   -> writes the file, prints the frozen time.
const fs = require('fs');

function frozenNow(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 11, 0, 0);
  do d.setDate(d.getDate() + 1); while (d.getDay() !== 3);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T11:00:00`;
}

function seed(dataFile, nowStr) {
  process.env.SHIPGATE_NOW = nowStr;
  const L = require('../lib/logic');
  const today = nowStr.slice(0, 10);
  const make = (code, date, time) => {
    const q = L.quote(['cut'], 'noor', '');
    const startMin = L.timeToMin(time);
    return { code, status: 'booked', date, startMin, endMin: startMin + q.minutes, start: time, end: L.minToTime(startMin + q.minutes),
      stylist: 'noor', name: 'Sam Lee', phone: '+44 20 7946 0958', email: '', ...q, createdAt: new Date(nowStr).toISOString() };
  };
  const all = [
    make('BC-LATE23', L.addDays(today, 1), '10:00'),
    make('BC-CUT24', L.addDays(today, 1), '11:00'),
    make('BC-EARLY48', L.addDays(today, 2), '11:00'),
  ];
  fs.writeFileSync(dataFile, JSON.stringify(all, null, 2));
  return all;
}

module.exports = { frozenNow, seed };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node scripts/fixtures.js <data-file>'); process.exit(1); }
  const n = frozenNow();
  seed(file, n);
  console.log(n);
}
