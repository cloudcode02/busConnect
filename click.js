// Load drivers from localStorage on startup
loadDrivers();

// Fallback voor statische chauffeurslijst
const drivers = [];

// Toon "Mijn Profiel" knop als er geregistreerde chauffeurs zijn
if (registeredDrivers.length > 0) {
  const btn = document.getElementById('btn-mijn-profiel');
  if (btn) btn.style.display = 'block';
}

function openMyProfile() {
  if (registeredDrivers.length === 0) {
    alert('U heeft nog geen profiel. Registreer eerst als chauffeur.');
    return;
  }
  // Open het meest recente profiel
  editMyProfile(registeredDrivers[registeredDrivers.length - 1].id);
}

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

    if (!category) return; // keep "--Select--"

    if (category === selectedCategory) {
      option.style.display = "block";
    } else {
      option.style.display = "none";
    }
  });
}
//this is for the website itself
function renderDriverCard(d) {
  const avatarContent = d.foto 
    ? `<img src="${d.foto}" alt="${d.naam}">` 
    : d.initials;
  
  return `
    <div class="driver-card" onclick="openModal(${d.id})">
      <div class="driver-card-top">
        <div class="driver-avatar">${d.initials}</div>
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
        <div style="font-size:0.82rem;color:var(--ink-light);line-height:1.5;border-top:1px solid var(--border);padding-top:0.85rem;">"${d.bio.substr(0,90)}${d.bio.length>90?'…':''}"</div>
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

  const avatarContent = d.foto 
    ? `<img src="${d.foto}" alt="${d.naam}">` 
    : d.initials;

  document.getElementById('modal-title').textContent = d.naam;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border);">
      <div class="driver-avatar" style="width:64px;height:64px;font-size:1.6rem;">${d.initials}</div>
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
    <div class="modal-detail-row"><span class="key">School</span><span class="val">${d.school}</span></div>
    <div class="modal-detail-row"><span class="key">Route / wijk</span><span class="val">${d.route}</span></div>
    <div class="modal-detail-row"><span class="key">Vertrektijd ochtend</span><span class="val">${d.tijdOch} uur</span></div>
    <div class="modal-detail-row"><span class="key">Vertrektijd middag</span><span class="val">${d.tijdMid} uur</span></div>
    <div class="modal-detail-row"><span class="key">Beschikbare dagen</span><span class="val">${d.dagen.join(' · ')}</span></div>
    <div class="modal-detail-row"><span class="key">Voertuig</span><span class="val">${d.voertuig} (${d.cap} plaatsen)</span></div>
  
    <div class="modal-detail-row"><span class="key">Kenteken</span><span class="val">${d.kenteken}</span></div>
    <div class="modal-detail-row"><span class="key">Extra's</span><span class="val">${d.extra}</span></div>
    <div class="modal-detail-row"><span class="key">Tarief</span><span class="val" style="color:var(--amber-dark);font-size:1.1rem;">€${d.prijs} / maand</span></div>
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

// ── REGISTER ──
const registeredDrivers = [];
let nextId = 100;

function submitRegistration() {
  const voornaam = document.getElementById('r-voornaam').value.trim();
  const achternaam = document.getElementById('r-achternaam').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const akkoord = document.getElementById('r-akkoord').checked;

  if(!voornaam || !achternaam || !email || !password) {
    alert('Vul alle verplichte velden in.');
    return;
  }
  if(!fotoFile) {
    alert('Upload een profielfoto om verder te gaan.');
    return;
  }
  if(!akkoord) {
    alert('U dient akkoord te gaan met de voorwaarden.');
    return;
  }

  const dagen = [...document.querySelectorAll('#days-grid .day-toggle.on')].map(el => el.textContent);
  const prijs = parseInt(document.getElementById('r-prijs').value) || 100;

  const newDriver = {
    id: nextId++,
    naam: voornaam + ' ' + achternaam,
    initials: (voornaam[0] + achternaam[0]).toUpperCase(),
    erv: parseInt(document.getElementById('r-ervaring').value) || 1,
    route: document.getElementById('r-route').value,
    school: document.getElementById('r-school').value,
    tijdOch: document.getElementById('r-tijd-och').value,
    tijdMid: document.getElementById('r-tijd-mid').value,
    dagen: dagen.length > 0 ? dagen : ['Ma','Di','Wo','Do','Vr'],
    voertuig: document.getElementById('r-voertuig').value,
    cap: parseInt(document.getElementById('r-capaciteit').value) || 8,
    prijs: prijs,
    rating: 5.0,
    reviews: 0,
    kenteken: document.getElementById('r-kenteken').value || 'N.v.t.',
    extra: document.getElementById('r-extra').value,
    bio: document.getElementById('r-bio').value || 'Nieuwe chauffeur op het platform.',
    jaar: parseInt(document.getElementById('r-bouwjaar').value) || 2020,
  };

  registeredDrivers.push(newDriver);

  document.getElementById('success-banner').classList.add('show');
  document.getElementById('register-form').style.opacity = '0.5';
  document.getElementById('register-form').style.pointerEvents = 'none';

  // Update stats
  const count = drivers.length + registeredDrivers.length;
  document.getElementById('stat-drivers').textContent = count;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}



  window.scrollTo({ top: 0, behavior: 'smooth' });
// ── INIT ──
filterDrivers();

