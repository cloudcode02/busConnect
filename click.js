// ── API BASE ──
const API = 'http://localhost:3000/api';
let allDrivers = [];

// ── UTILITY FUNCTIONS ──
function stars(rating) {
  const r = Math.round(rating || 0);
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

function getInitials(naam) {
  return naam.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── PAGE NAVIGATION ──
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === page);
  });
}

function updateOptions() {
  const selectedCategory = document.getElementById("category").value;
  const options = document.querySelectorAll(".items option");

  options.forEach(option => {
    const category = option.getAttribute("data-category");
    if (!category) return;
    option.style.display = (category === selectedCategory) ? "block" : "none";
  });
}

// ── FETCH DRIVERS ──
async function loadDrivers() {
  try {
    const response = await fetch(API + '/chauffeurs');
    allDrivers = await response.json();
    filterDrivers();
  } catch(err) {
    console.error('Error loading drivers:', err);
    allDrivers = [];
  }
}

function renderDriverCard(d) {
  return `
    <div class="driver-card" onclick="openModal(${d.id})">
      <div class="driver-card-top">
        <div class="driver-avatar">${getInitials(d.naam)}</div>
        <div>
          <div class="driver-name">${d.naam}</div>
          <div class="driver-since">${d.erv || 0} jaar ervaring</div>
          <div class="badge-row" style="margin-top:0.4rem;">
            <span class="badge badge-green">✓ VOG</span>
            <span class="badge badge-amber">${d.route || 'Route'}</span>
            ${d.extra && d.extra !== 'Geen' ? `<span class="badge badge-gray">${d.extra}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="driver-card-body">
        <div class="driver-info-grid">
          <div class="info-item"><label>School</label><span>${(d.school || '').substring(0,22)}</span></div>
          <div class="info-item"><label>Voertuig</label><span>${(d.voertuig || 'Onbekend').split(' ')[0]}</span></div>
          <div class="info-item"><label>Ochtend</label><span>${d.tijdOch || '--:--'}</span></div>
          <div class="info-item"><label>Middag</label><span>${d.tijdMid || '--:--'}</span></div>
          <div class="info-item"><label>Capaciteit</label><span>${d.capaciteit || 0} kinderen</span></div>
          <div class="info-item"><label>Beoordeling</label><span class="rating"><span class="stars">${stars(d.rating)}</span> ${(d.rating || 0).toFixed(1)} (${d.reviews || 0})</span></div>
        </div>
        <div style="font-size:0.82rem;color:var(--ink-light);line-height:1.5;border-top:1px solid var(--border);padding-top:0.85rem;">"${(d.bio || 'Professionele chauffeur').substring(0,90)}…"</div>
      </div>
      <div class="driver-card-footer">
        <div class="price-display">€${d.prijs || 0} <small>/maand</small></div>
        <button class="btn btn-amber btn-sm">Bekijk profiel →</button>
      </div>
    </div>
  `;
}

function filterDrivers() {
  const search = document.getElementById('f-search')?.value.toLowerCase() || '';
  const school = document.getElementById('f-school')?.value || '';
  const route = document.getElementById('f-route')?.value || '';

  let filtered = allDrivers.filter(d => {
    if(search && !d.naam.toLowerCase().includes(search) && !(d.route || '').toLowerCase().includes(search)) return false;
    if(school && d.school !== school) return false;
    if(route && d.route !== route) return false;
    return true;
  });

  const grid = document.getElementById('driver-grid');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('result-count');

  if (countEl) countEl.textContent = `(${filtered.length} gevonden)`;

  if(filtered.length === 0) {
    if(grid) grid.innerHTML = '';
    if(empty) empty.style.display = 'block';
  } else {
    if(grid) grid.innerHTML = filtered.map(renderDriverCard).join('');
    if(empty) empty.style.display = 'none';
  }
}

function resetFilters() {
  ['f-search','f-school','f-route','f-dag','f-prijs'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  filterDrivers();
}

// ── MODAL ──
function openModal(id) {
  const d = allDrivers.find(x => x.id === id);
  if(!d) return;

  document.getElementById('modal-title').textContent = d.naam;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border);">
      <div class="driver-avatar" style="width:64px;height:64px;font-size:1.6rem;">${getInitials(d.naam)}</div>
      <div>
        <div class="rating"><span class="stars">${stars(d.rating)}</span> <strong>${(d.rating || 0).toFixed(1)}</strong> — ${d.reviews || 0} beoordelingen</div>
        <div class="badge-row" style="margin-top:0.5rem;">
          <span class="badge badge-green">✓ VOG gecertificeerd</span>
          <span class="badge badge-amber">${d.erv || 0} jaar ervaring</span>
          ${d.extra && d.extra !== 'Geen' ? `<span class="badge badge-gray">${d.extra}</span>` : ''}
        </div>
        <div style="font-size:0.85rem;color:var(--ink-light);margin-top:0.5rem;font-style:italic;">"${d.bio || 'Professioneel vervoer.'}"</div>
      </div>
    </div>
    <div class="modal-detail-row"><span class="key">School</span><span class="val">${d.school || '-'}</span></div>
    <div class="modal-detail-row"><span class="key">Route / wijk</span><span class="val">${d.route || '-'}</span></div>
    <div class="modal-detail-row"><span class="key">Vertrektijd ochtend</span><span class="val">${d.tijdOch || '--:--'} uur</span></div>
    <div class="modal-detail-row"><span class="key">Vertrektijd middag</span><span class="val">${d.tijdMid || '--:--'} uur</span></div>
    <div class="modal-detail-row"><span class="key">Voertuig</span><span class="val">${d.voertuig || '-'} (${d.capaciteit || 0} plaatsen)</span></div>
    <div class="modal-detail-row"><span class="key">Extra's</span><span class="val">${d.extra || 'Geen'}</span></div>
    <div class="modal-detail-row"><span class="key">Tarief</span><span class="val" style="color:var(--amber-dark);font-size:1.1rem;">€${d.prijs || 0} / maand</span></div>
  `;
  document.getElementById('modal-actions').innerHTML = `
    <button class="btn btn-amber" style="flex:1;" onclick="contactDriver(${d.id}, '${d.naam.replace(/'/g, "\\'")}')" >📩 Neem contact op</button>
    <button class="btn btn-dark" onclick="closeModalDirect()">Sluiten</button>
  `;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function contactDriver(id, naam) {
  alert('Contactformulier verstuurd naar ' + naam + '!\nU ontvangt binnen 24 uur een reactie.');
  closeModalDirect();
}

function closeModal(e) {
  if(e.target === document.getElementById('modal')) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── DAY TOGGLE ──
function toggleDay(el) {
  el.classList.toggle('on');
}

// ── CHAR COUNT ──
function updateCharCount() {
  const val = document.getElementById('r-bio')?.value.length || 0;
  const count = document.getElementById('char-count');
  if(count) count.textContent = val;
}

// ── CHAUFFEUR REGISTRATION ──
async function submitRegistration() {
  const voornaam = document.getElementById('r-voornaam')?.value.trim() || '';
  const achternaam = document.getElementById('r-achternaam')?.value.trim() || '';
  const email = document.getElementById('r-email')?.value.trim() || '';
  const password = document.getElementById('r-wachtwoord')?.value || '';
  const akkoord = document.getElementById('r-akkoord')?.checked;

  if(!voornaam || !achternaam || !email || !password) {
    alert('Vul alle verplichte velden in.');
    return;
  }
  if(!akkoord) {
    alert('U dient akkoord te gaan met de voorwaarden.');
    return;
  }

  const registerData = {
    voornaam: voornaam,
    achternaam: achternaam,
    email: email,
    password: password,
    telefoon: document.getElementById('r-telefoon')?.value || '',
    bio: document.getElementById('r-bio')?.value || '',
    voertuig: document.getElementById('r-voertuig')?.value || '',
    capaciteit: parseInt(document.getElementById('r-capaciteit')?.value) || 8,
    ervaring: parseInt(document.getElementById('r-ervaring')?.value) || 0,
    kenteken: document.getElementById('r-kenteken')?.value || '',
    extra: document.getElementById('r-extra')?.value || 'Geen',
    route: document.getElementById('r-route')?.value || '',
    school: document.getElementById('r-school')?.value || '',
    tijdOch: document.getElementById('r-tijd-och')?.value || '07:30',
    tijdMid: document.getElementById('r-tijd-mid')?.value || '14:45',
    dagen: [...document.querySelectorAll('#days-grid .day-toggle.on')].map(el => el.textContent).join(','),
    prijs: parseInt(document.getElementById('r-prijs')?.value) || 150
  };

  try {
    const res = await fetch(API + '/auth/chauffeur/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById('success-banner').style.display = 'block';
      document.getElementById('register-form').style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Fout: ' + (data.bericht || data.fout));
    }
  } catch(err) {
    alert('Registratie fout: ' + err.message);
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadDrivers();
});