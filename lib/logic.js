// Booking rules for Bloom & Co. Everything here follows SPEC.md.
const SERVICES = [
  { id: 'cut', name: 'Signature cut', cents: 4500, minutes: 45, blurb: 'Consultation, wash, cut and finish.' },
  { id: 'blow', name: 'Blow-dry', cents: 3000, minutes: 30, blurb: 'Wash and a smooth or bouncy blow-dry.' },
  { id: 'color', name: 'Full colour', cents: 9500, minutes: 120, blurb: 'Root-to-tip colour with a gloss finish.' },
  { id: 'gloss', name: 'Gloss treatment', cents: 4000, minutes: 30, blurb: 'Shine and tone refresh between colours.' },
  { id: 'mani', name: 'Manicure', cents: 2800, minutes: 45, blurb: 'Shape, cuticle care and polish.' },
  { id: 'pedi', name: 'Pedicure', cents: 3800, minutes: 60, blurb: 'Soak, scrub, shape and polish.' },
  { id: 'facial', name: 'Calm facial', cents: 7000, minutes: 60, blurb: 'Cleanse, mask and massage for tired skin.' },
];
const STYLISTS = [
  { id: 'noor', name: 'Noor', role: 'Stylist', factor: 1 },
  { id: 'ava', name: 'Ava', role: 'Senior stylist', factor: 1.2 },
  { id: 'leo', name: 'Leo', role: 'Junior stylist', factor: 0.85 },
];
// Minutes from midnight. Index = day of week (0 = Sunday). null = closed.
const HOURS = { 0: [660, 960], 1: null, 2: [600, 1080], 3: [600, 1080], 4: [600, 1080], 5: [600, 1200], 6: [540, 1020] };
const STEP = 15;
const MAX_DAYS_AHEAD = 30;
const TAX = 0.08;
const DEPOSIT = 0.2;

const now = () => (process.env.SHIPGATE_NOW ? new Date(process.env.SHIPGATE_NOW) : new Date());
const pad = (n) => String(n).padStart(2, '0');
const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const minToTime = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const timeToMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const startMs = (date, min) => { const d = parseDate(date); d.setMinutes(min); return d.getTime(); };
const roundHalfUp = (x) => Math.floor(x + 0.5 + 1e-9);

function addDays(date, n) { const d = parseDate(date); d.setDate(d.getDate() + n); return dateStr(d); }

function quote(serviceIds, stylistId, promo) {
  const ids = [...new Set(serviceIds || [])];
  if (ids.length < 1 || ids.length > 4) return { error: 'Choose between 1 and 4 services.' };
  const chosen = ids.map((id) => SERVICES.find((s) => s.id === id));
  if (chosen.some((s) => !s)) return { error: 'Unknown service.' };
  const stylist = STYLISTS.find((s) => s.id === stylistId);
  if (!stylist) return { error: 'Unknown stylist.' };

  const minutes = chosen.reduce((a, s) => a + s.minutes, 0);
  const servicesRaw = chosen.reduce((a, s) => a + s.cents * stylist.factor, 0);

  let rate = 0, promoMessage = '';
  const code = String(promo || '').trim().toUpperCase();
  if (code === 'WELCOME10') { rate = 0.10; promoMessage = 'WELCOME10 applied: 10% off.'; }
  else if (code === 'PAIR15') {
    if (chosen.length >= 2) { rate = 0.15; promoMessage = 'PAIR15 applied: 15% off.'; }
    else promoMessage = 'PAIR15 needs two or more services.';
  } else if (code) promoMessage = "That code isn't valid.";

  const discountRaw = servicesRaw * rate;
  const taxRaw = (servicesRaw - discountRaw) * TAX;
  const totalRaw = servicesRaw - discountRaw + taxRaw;
  const total = roundHalfUp(totalRaw);
  const deposit = roundHalfUp(total * DEPOSIT);
  return {
    services: chosen.map((s) => ({ id: s.id, name: s.name, minutes: s.minutes, cents: roundHalfUp(s.cents * stylist.factor) })),
    stylist: stylist.id, minutes,
    servicesCents: roundHalfUp(servicesRaw), discountCents: roundHalfUp(discountRaw), taxCents: roundHalfUp(taxRaw),
    totalCents: total, depositCents: deposit, payAtSalonCents: total - deposit,
    promoCode: rate ? code : '', promoMessage,
  };
}

function isFree(stylistId, date, s, e, bookings) {
  return !bookings.some((b) => b.status === 'booked' && b.stylist === stylistId && b.date === date && s < b.endMin && b.startMin < e);
}

function dateProblem(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return 'Please choose a date.';
  const today = dateStr(now());
  if (date < today) return 'That date has passed.';
  if (date > addDays(today, MAX_DAYS_AHEAD)) return `Bookings open up to ${MAX_DAYS_AHEAD} days ahead.`;
  return '';
}

// Free start times for a booking of `minutes` on `date`. stylistId may be 'any'.
function availability(date, minutes, stylistId, bookings) {
  const problem = dateProblem(date);
  if (problem) return { times: [], note: problem };
  const hours = HOURS[parseDate(date).getDay()];
  if (!hours) return { times: [], note: 'The salon is closed on this day.' };
  const n = now();
  const nowMin = date === dateStr(n) ? n.getHours() * 60 + n.getMinutes() : -1;
  const order = stylistId === 'any' ? ['noor', 'ava', 'leo'] : [stylistId];
  const times = [];
  for (let s = hours[0]; s + minutes <= hours[1]; s += STEP) {
    if (s < nowMin) continue;
    const who = order.find((id) => isFree(id, date, s, s + minutes, bookings));
    times.push({ time: minToTime(s), stylist: who || null });
  }
  return { times, note: times.some((t) => t.stylist) ? '' : 'No free times on this day.' };
}

function canCustomerCancel(booking) {
  return startMs(booking.date, booking.startMin) - now().getTime() >= 24 * 3600 * 1000;
}

function dayTotals(date, bookings) {
  const live = bookings.filter((b) => b.date === date && b.status === 'booked');
  return {
    count: live.length,
    hours: live.reduce((a, b) => a + (b.endMin - b.startMin), 0) / 60,
    revenueCents: live.reduce((a, b) => a + b.totalCents, 0),
    depositsCents: live.reduce((a, b) => a + b.depositCents, 0),
  };
}

module.exports = { SERVICES, STYLISTS, HOURS, quote, availability, dateProblem, canCustomerCancel, dayTotals,
  now, dateStr, parseDate, addDays, minToTime, timeToMin, isFree, MAX_DAYS_AHEAD };
