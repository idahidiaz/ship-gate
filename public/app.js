const form = document.getElementById('book');
const dateEl = document.getElementById('date');
const slotsEl = document.getElementById('slots');
const errorEl = document.getElementById('error');
let time = '';

dateEl.min = new Date().toISOString().slice(0, 10);

dateEl.addEventListener('change', async () => {
  time = '';
  if (!dateEl.value) { slotsEl.textContent = 'Pick a date first.'; return; }
  const { slots } = await (await fetch('/api/slots?date=' + dateEl.value)).json();
  slotsEl.innerHTML = '';
  for (const s of slots) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = s.time; b.disabled = !s.free;
    b.title = s.free ? 'Free' : 'Already booked';
    b.onclick = () => { time = s.time; slotsEl.querySelectorAll('button').forEach((x) => x.classList.toggle('picked', x === b)); };
    slotsEl.append(b);
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const data = Object.fromEntries(new FormData(form));
  data.time = time;
  const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const out = await res.json();
  if (!res.ok) { errorEl.textContent = out.error; return; }
  document.getElementById('summary').textContent = `${out.service} on ${out.date} at ${out.time}, for ${out.name}.`;
  document.getElementById('code').textContent = out.code;
  form.hidden = true;
  document.getElementById('done').hidden = false;
});

document.getElementById('again').onclick = () => location.reload();
