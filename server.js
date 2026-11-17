// Bloom & Co. salon booking site. No dependencies: `node server.js`, then open http://localhost:4173
const http = require('http');
const fs = require('fs');
const path = require('path');
const L = require('./lib/logic');

const PORT = process.env.PORT || 4173;
const DATA = process.env.SHIPGATE_DATA || path.join(__dirname, 'data', 'bookings.json');
const PUBLIC = path.join(__dirname, 'public');

const load = () => { try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch { return []; } };
const save = (b) => { fs.mkdirSync(path.dirname(DATA), { recursive: true }); fs.writeFileSync(DATA, JSON.stringify(b, null, 2)); };
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const digits = (s) => String(s || '').replace(/\D/g, '');
const newCode = (all) => { let c; do { c = 'BC-' + Math.random().toString(36).slice(2, 7).toUpperCase(); } while (all.some((b) => b.code === c)); return c; };

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { resolve(null); } });
  });
}

function detailsProblem(b) {
  if (!b.name || b.name.trim().length < 2) return 'Please enter your name (at least 2 letters).';
  if (!/^\+?[\d\s-]{7,15}$/.test(b.phone || '')) return 'Please enter a valid phone number (7 to 15 digits).';
  if (b.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email)) return 'That email address does not look right.';
  return '';
}

const publicBooking = (b) => ({ ...b, canCancel: b.status === 'booked' && L.canCustomerCancel(b) });

async function api(req, res, url) {
  const p = url.pathname;
  const all = load();

  if (p === '/api/info') {
    return send(res, 200, { services: L.SERVICES, stylists: L.STYLISTS, hours: L.HOURS,
      today: L.dateStr(L.now()), maxDate: L.addDays(L.dateStr(L.now()), L.MAX_DAYS_AHEAD) });
  }

  if (p === '/api/availability' && req.method === 'POST') {
    const b = await readBody(req);
    const q = b && L.quote(b.services, b.stylist === 'any' ? 'noor' : b.stylist, '');
    if (!q || q.error) return send(res, 400, { error: (q && q.error) || 'Bad request.' });
    return send(res, 200, L.availability(b.date, q.minutes, b.stylist, all));
  }

  if (p === '/api/quote' && req.method === 'POST') {
    const b = await readBody(req);
    if (!b) return send(res, 400, { error: 'Bad request.' });
    let stylist = b.stylist;
    if (stylist === 'any') {
      const q0 = L.quote(b.services, 'noor', '');
      const slot = q0.error ? null : L.availability(b.date, q0.minutes, 'any', all).times.find((t) => t.time === b.time);
      stylist = (slot && slot.stylist) || 'noor';
    }
    const q = L.quote(b.services, stylist, b.promo);
    return q.error ? send(res, 400, q) : send(res, 200, q);
  }

  if (p === '/api/bookings' && req.method === 'POST') {
    const b = await readBody(req);
    if (!b) return send(res, 400, { error: 'Bad request.' });
    const q0 = L.quote(b.services, b.stylist === 'any' ? 'noor' : b.stylist, '');
    if (q0.error) return send(res, 400, { error: q0.error });
    const av = L.availability(b.date, q0.minutes, b.stylist, all);
    if (av.note && !av.times.length) return send(res, 400, { error: av.note });
    const slot = av.times.find((t) => t.time === b.time);
    if (!slot) return send(res, 400, { error: 'That start time is not available.' });
    if (!slot.stylist) return send(res, 409, { error: 'That time was just taken. Please pick another.' });
    const problem = detailsProblem(b);
    if (problem) return send(res, 400, { error: problem });
    const q = L.quote(b.services, slot.stylist, b.promo);
    const startMin = L.timeToMin(b.time);
    const booking = { code: newCode(all), status: 'booked', date: b.date, startMin, endMin: startMin + q.minutes,
      start: b.time, end: L.minToTime(startMin + q.minutes), stylist: slot.stylist,
      name: b.name.trim(), phone: b.phone.trim(), email: (b.email || '').trim(), ...q, createdAt: L.now().toISOString() };
    all.push(booking); save(all);
    return send(res, 201, publicBooking(booking));
  }

  const m = p.match(/^\/api\/bookings\/([A-Za-z0-9-]+)(\/cancel)?$/);
  if (m) {
    const booking = all.find((x) => x.code === m[1].toUpperCase());
    const phone = url.searchParams.get('phone') || '';
    if (m[2] && req.method === 'POST') {
      const b = (await readBody(req)) || {};
      if (!booking || digits(b.phone) !== digits(booking.phone)) return send(res, 404, { error: 'No booking found for that code and phone.' });
      if (booking.status === 'cancelled') return send(res, 400, { error: 'This booking is already cancelled.' });
      if (!L.canCustomerCancel(booking)) return send(res, 403, { error: 'Please call the salon to cancel within 24 hours.' });
      booking.status = 'cancelled'; save(all);
      return send(res, 200, publicBooking(booking));
    }
    if (!booking || digits(phone) !== digits(booking.phone)) return send(res, 404, { error: 'No booking found for that code and phone.' });
    return send(res, 200, publicBooking(booking));
  }

  if (p === '/api/owner/day') {
    const date = url.searchParams.get('date') || L.dateStr(L.now());
    const list = all.filter((b) => b.date === date).sort((a, b) => a.startMin - b.startMin);
    return send(res, 200, { date, bookings: list, totals: L.dayTotals(date, all) });
  }

  const oc = p.match(/^\/api\/owner\/cancel\/([A-Za-z0-9-]+)$/);
  if (oc && req.method === 'POST') {
    const booking = all.find((x) => x.code === oc[1].toUpperCase());
    if (!booking) return send(res, 404, { error: 'Booking not found.' });
    booking.status = 'cancelled'; save(all);
    return send(res, 200, booking);
  }

  return send(res, 404, { error: 'Not found.' });
}

const PAGES = { '/': 'index.html', '/book': 'book.html', '/owner': 'owner.html' };
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let name = PAGES[url.pathname] || (url.pathname.startsWith('/booking/') ? 'booking.html' : url.pathname.slice(1));
    const file = path.join(PUBLIC, name);
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': (TYPES[path.extname(file)] || 'text/plain') + '; charset=utf-8' });
    fs.createReadStream(file).pipe(res);
  } catch (e) { send(res, 500, { error: 'Something went wrong.' }); }
}).listen(PORT, () => console.log(`Bloom & Co. on http://localhost:${PORT}`));
