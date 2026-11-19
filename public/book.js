header('book');
const state = { services: [], stylist: 'any', date: '', time: '', info: null, quote: null };

function show(step) {
  [1, 2, 3, 4].forEach((n) => ($('#step' + n).hidden = n !== step));
  [...$('#steps').children].forEach((li, i) => { li.className = i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''; });
  if (step === 4) renderReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function refreshSummary() {
  const box = $('#summary');
  if (!state.services.length) { box.innerHTML = '<p class="note">Nothing chosen yet.</p>'; state.quote = null; return; }
  const body = { services: state.services, stylist: state.stylist, date: state.date, time: state.time, promo: $('#promo') ? $('#promo').value : '' };
  const { ok, data } = await call('/api/quote', body);
  if (!ok) { box.innerHTML = `<p class="error">${esc(data.error)}</p>`; return; }
  state.quote = data;
  const who = state.info.stylists.find((s) => s.id === data.stylist);
  box.innerHTML = `<ul class="lines">
    ${data.services.map((s) => `<li><span>${esc(s.name)} <small class="note">${dur(s.minutes)}</small></span><span>${money(s.cents)}</span></li>`).join('')}
    <li class="sep muted"><span>Length</span><span>${dur(data.minutes)}</span></li>
    ${state.stylist === 'any' && !state.time ? '<li class="muted"><span>Stylist</span><span>Any (price shown for Noor)</span></li>' : `<li class="muted"><span>Stylist</span><span>${esc(who.name)}</span></li>`}
    ${state.date && state.time ? `<li class="muted"><span>When</span><span>${esc(prettyDate(state.date))}, ${state.time}</span></li>` : ''}
    ${moneyLines(data)}</ul>`;
}

async function loadTimes() {
  const box = $('#times');
  state.time = '';
  if (!state.date) { box.innerHTML = '<span class="note">Choose a date to see times.</span>'; return; }
  const { data } = await call('/api/availability', { services: state.services, stylist: state.stylist, date: state.date });
  $('#date-note').textContent = data.note || '';
  box.innerHTML = '';
  for (const t of data.times) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = t.time; b.disabled = !t.stylist;
    b.onclick = () => { state.time = t.time; [...box.children].forEach((x) => x.classList.toggle('picked', x === b)); refreshSummary(); };
    box.append(b);
  }
  if (!data.times.length) box.innerHTML = `<span class="note">${esc(data.note || 'No times.')}</span>`;
  refreshSummary();
}

async function renderReview() {
  await refreshSummary();
  const q = state.quote, who = state.info.stylists.find((s) => s.id === q.stylist);
  $('#review').innerHTML = `<ul class="lines">
    <li><span>When</span><span>${esc(prettyDate(state.date))}, ${state.time}</span></li>
    <li><span>Stylist</span><span>${esc(who.name)}</span></li>
    <li><span>Name</span><span>${esc($('#name').value.trim())}</span></li>
    <li><span>Phone</span><span>${esc($('#phone').value.trim())}</span></li>
    ${q.services.map((s) => `<li class="muted"><span>${esc(s.name)}</span><span>${money(s.cents)}</span></li>`).join('')}
    ${moneyLines(q)}</ul>
    ${q.promoMessage ? `<p class="${q.promoCode ? 'okmsg' : 'error'}">${esc(q.promoMessage)}</p>` : ''}`;
}

(async function init() {
  state.info = (await call('/api/info')).data;
  $('#service-list').innerHTML = state.info.services.map((s) => `<label class="opt"><input type="checkbox" value="${s.id}" name="service">
    <span class="grow"><strong>${esc(s.name)}</strong><small>${esc(s.blurb)}</small></span><span>${dur(s.minutes)}<br><strong>${money(s.cents)}</strong></span></label>`).join('');
  $('#stylist-list').innerHTML = [{ id: 'any', name: 'Any stylist', role: 'First free: Noor, then Ava, then Leo', factor: 1 }, ...state.info.stylists]
    .map((s) => `<label class="opt"><input type="radio" name="stylist" value="${s.id}" ${s.id === 'any' ? 'checked' : ''}>
    <span class="grow"><strong>${esc(s.name)}</strong><small>${esc(s.role)}</small></span><span>${s.id === 'any' ? '' : s.factor === 1 ? 'Menu price' : s.factor > 1 ? '+20%' : '-15%'}</span></label>`).join('');
  $('#steps').firstElementChild.className = 'on';
  $('#date').min = state.info.today; $('#date').max = state.info.maxDate;

  $('#service-list').addEventListener('change', (e) => {
    const picked = [...document.querySelectorAll('[name=service]:checked')].map((x) => x.value);
    if (picked.length > 4) { e.target.checked = false; $('#e1').textContent = 'You can choose up to 4 services.'; return; }
    $('#e1').textContent = ''; state.services = picked; state.time = ''; refreshSummary();
  });
  $('#stylist-list').addEventListener('change', (e) => { state.stylist = e.target.value; loadTimes(); });
  $('#date').addEventListener('change', (e) => { state.date = e.target.value; loadTimes(); });
  $('#promo').addEventListener('input', () => refreshSummary());

  $('#next1').onclick = () => { if (!state.services.length) { $('#e1').textContent = 'Please choose at least one service.'; return; } $('#e1').textContent = ''; show(2); if (state.date) loadTimes(); };
  $('#next2').onclick = () => {
    if (!state.date) { $('#e2').textContent = 'Please choose a date.'; return; }
    if (!state.time) { $('#e2').textContent = 'Please choose a start time.'; return; }
    $('#e2').textContent = ''; show(3);
  };
  $('#next3').onclick = () => {
    const name = $('#name').value.trim(), phone = $('#phone').value.trim(), email = $('#email').value.trim();
    if ((name.match(/\p{L}/gu) || []).length < 2) return ($('#e3').textContent = 'Please enter your name (at least 2 letters).');
    if (!/^\+?[\d\s-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) return ($('#e3').textContent = 'Please enter a valid phone number (7 to 15 digits).');
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return ($('#e3').textContent = 'That email address does not look right.');
    $('#e3').textContent = ''; show(4);
  };
  document.querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => show(Number(b.dataset.back))));

  $('#confirm').onclick = async () => {
    $('#confirm').disabled = true; $('#e4').textContent = '';
    const { ok, data } = await call('/api/bookings', { services: state.services, stylist: state.stylist, date: state.date, time: state.time,
      name: $('#name').value, phone: $('#phone').value, email: $('#email').value, promo: $('#promo').value });
    $('#confirm').disabled = false;
    if (!ok) { $('#e4').textContent = data.error; return; }
    [1, 2, 3, 4].forEach((n) => ($('#step' + n).hidden = true));
    $('#steps').hidden = true; $('#summary-box').hidden = true;
    $('#done').hidden = false;
    $('#code').textContent = data.code;
    const who = state.info.stylists.find((s) => s.id === data.stylist);
    $('#done-lines').innerHTML = `<li><span>When</span><span>${esc(prettyDate(data.date))}, ${data.start} to ${data.end}</span></li>
      <li><span>Stylist</span><span>${esc(who.name)}</span></li>
      ${data.services.map((s) => `<li class="muted"><span>${esc(s.name)}</span><span>${money(s.cents)}</span></li>`).join('')}${moneyLines(data)}`;
    $('#done-note').textContent = 'Keep this code. You will need it and your phone number to view or cancel.';
    $('#manage').href = `/booking/${data.code}`;
    window.scrollTo({ top: 0 });
  };
})();
