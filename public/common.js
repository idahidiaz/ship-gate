// Small helpers shared by every page.
const $ = (s, r = document) => r.querySelector(s);
const money = (c) => '$' + (c / 100).toFixed(2);
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad2 = (n) => String(n).padStart(2, '0');
const minText = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`);
const prettyDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function call(url, body) {
  const res = await fetch(url, body === undefined ? undefined : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
function header(active) {
  document.body.insertAdjacentHTML('afterbegin', `<header class="top"><div class="wrap">
    <a class="brand" href="/">Bloom <em>&amp;</em> Co.</a>
    <nav><a class="hide-sm" href="/#menu">Menu</a><a class="hide-sm" href="/#team">Stylists</a><a class="hide-sm" href="/#hours">Hours</a>
    <a href="/booking/" ${active === 'booking' ? 'aria-current="page"' : ''}>My booking</a>
    <a href="/owner" ${active === 'owner' ? 'aria-current="page"' : ''}>Owner view</a><a class="btn" href="/book">Book a visit</a></nav></div></header>`);
  // Test runs freeze the salon's clock; say so on every page so testers judge times against it.
  fetch('/api/info').then((r) => r.json()).then((i) => {
    if (!i.testClock) return;
    const [d, t] = i.testClock.split('T');
    document.querySelector('header.top').insertAdjacentHTML('afterend',
      `<p class="test-clock">Test clock: the salon's time now is ${prettyDate(d)}, ${t.slice(0, 5)}. Times on this site count from this moment.</p>`);
  }).catch(() => {});
}
// Two-step confirm without a browser pop-up: the first click asks, the second click does it.
function armed(btn, askLabel) {
  if (btn.dataset.armed) return true;
  btn.dataset.armed = '1'; btn.dataset.label = btn.textContent; btn.textContent = askLabel;
  setTimeout(() => { if (btn.isConnected && btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = btn.dataset.label; } }, 8000);
  return false;
}
const moneyLines = (q) => `
  <li><span>Services</span><span>${money(q.servicesCents)}</span></li>
  ${q.discountCents ? `<li><span>Discount (${esc(q.promoCode)})</span><span>-${money(q.discountCents)}</span></li>` : ''}
  <li><span>Tax (8%)</span><span>${money(q.taxCents)}</span></li>
  <li class="sep total"><span>Total</span><span>${money(q.totalCents)}</span></li>
  <li class="muted"><span>Deposit due now (20%)</span><span>${money(q.depositCents)}</span></li>
  <li class="muted"><span>Pay at the salon</span><span>${money(q.payAtSalonCents)}</span></li>`;
