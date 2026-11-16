// Ship-gate demo: a tiny salon booking site. No dependencies: `node server.js`.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const DATA = path.join(__dirname, 'data', 'bookings.json');
const PUBLIC = path.join(__dirname, 'public');
const SERVICES = { cut: 'Haircut', color: 'Colour', nails: 'Manicure' };
const SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

const load = () => { try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch { return []; } };
const save = (b) => { fs.mkdirSync(path.dirname(DATA), { recursive: true }); fs.writeFileSync(DATA, JSON.stringify(b, null, 2)); };
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const today = () => new Date().toISOString().slice(0, 10);

function validate(b, all) {
  if (!SERVICES[b.service]) return 'Please choose a service.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '') || b.date < today()) return 'Please choose today or a later date.';
  if (!SLOTS.includes(b.time)) return 'Please choose a time.';
  if (!b.name || b.name.trim().length < 2) return 'Please enter your name.';
  if (!/^\+?[\d\s-]{7,15}$/.test(b.phone || '')) return 'Please enter a valid phone number.';
  if (all.some((x) => x.date === b.date && x.time === b.time)) return 'That time is already booked. Please pick another.';
  return null;
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/slots') {
    const date = url.searchParams.get('date');
    const taken = load().filter((x) => x.date === date).map((x) => x.time);
    return send(res, 200, { slots: SLOTS.map((t) => ({ time: t, free: !taken.includes(t) })) });
  }
  if (url.pathname === '/api/bookings' && req.method === 'GET') return send(res, 200, load());
  if (url.pathname === '/api/bookings' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => (body += c));
    return req.on('end', () => {
      let b; try { b = JSON.parse(body); } catch { return send(res, 400, { error: 'Bad request.' }); }
      const all = load();
      const err = validate(b, all);
      if (err) return send(res, 400, { error: err });
      const booking = { code: 'SG-' + Math.random().toString(36).slice(2, 7).toUpperCase(), service: SERVICES[b.service],
        date: b.date, time: b.time, name: b.name.trim(), phone: b.phone.trim() };
      all.push(booking); save(all);
      send(res, 201, booking);
    });
  }
  const file = path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname === '/owner' ? 'owner.html' : url.pathname);
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[path.extname(file)] || 'text/plain';
  res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Salon booking site on http://localhost:${PORT}`));
