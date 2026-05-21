function updateOptions() {
  const selectedCategory = document.getElementById("category").value;
  const options = document.querySelectorAll(".items option");
  //ive used . to identify my class because i used the id tag to search for the drivers in js

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
  return `
    <div class="driver-card" onclick="openModal(${d.id})">
      <div class="driver-card-top">
        <div class="driver-avatar">${d.initials}</div>
        <div>
          <div class="driver-name">${d.naam}</div>
          <div class="driver-since">${d.erv} jaar ervaring</div>
          <div class="badge-row" style="margin-top:0.4rem;">
            <span class="badge badge-green">✓ VOG</span>
            <span class="badge badge-amber">${d.route}</span>
            ${d.extra !== 'Geen' ? `<span class="badge badge-gray">${d.extra}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="driver-card-body">
        <div class="driver-info-grid">
          <div class="info-item"><label>School</label><span>${d.school.length > 22 ? d.school.substr(0,22)+'…' : d.school}</span></div>
          <div class="info-item"><label>Voertuig</label><span>${d.voertuig.split(' ')[0]} ${d.voertuig.split(' ')[1]}</span></div>
          <div class="info-item"><label>Ochtend</label><span>${d.tijdOch} uur</span></div>
          <div class="info-item"><label>Middag</label><span>${d.tijdMid} uur</span></div>
          <div class="info-item"><label>Capaciteit</label><span>${d.cap} kinderen</span></div>
          <div class="info-item"><label>Beoordeling</label><span class="rating"><span class="stars">${stars(d.rating)}</span> ${d.rating} (${d.reviews})</span></div>
        </div>
        <div style="font-size:0.82rem;color:var(--ink-light);line-height:1.5;border-top:1px solid var(--border);padding-top:0.85rem;">"${d.bio.substr(0,90)}${d.bio.length>90?'…':''}"</div>
      </div>
      <div class="driver-card-footer">
        <div class="price-display">€${d.prijs} <small>/maand</small></div>
        <button class="btn btn-amber btn-sm">Bekijk profiel →</button>
      </div>
    </div>
  `;
}

function filterDrivers() {
  const search = document.getElementById('f-search').value.toLowerCase();
  const school = document.getElementById('f-school').value;
  const route  = document.getElementById('f-route').value;
  const dag    = document.getElementById('f-dag').value;
  const prijs  = document.getElementById('f-prijs').value;

  const dagMap = {Maandag:'Ma',Dinsdag:'Di',Woensdag:'Wo',Donderdag:'Do',Vrijdag:'Vr'};

  const all = [...drivers, ...registeredDrivers];
  const filtered = all.filter(d => {
    if(search && !d.naam.toLowerCase().includes(search) && !d.route.toLowerCase().includes(search)) return false;
    if(school && d.school !== school) return false;
    if(route && d.route !== route) return false;
    if(dag && !d.dagen.includes(dagMap[dag])) return false;
    if(prijs && d.prijs > parseInt(prijs)) return false;
    return true;
  });

  const grid = document.getElementById('drivers-grid');
  const empty = document.getElementById('empty-state');
  document.getElementById('result-count').textContent = `(${filtered.length} gevonden)`;

  if(filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
  } else {
    grid.innerHTML = filtered.map(renderDriverCard).join('');
    empty.style.display = 'none';
  }
}

function resetFilters() {
  ['f-search','f-school','f-route','f-dag','f-prijs'].forEach(id => {
    const el = document.getElementById(id);
    el.value = el.tagName === 'SELECT' ? '' : '';
  });
  filterDrivers();
}

// ── MODAL ──
function openModal(id) {
  const all = [...drivers, ...registeredDrivers];
  const d = all.find(x => x.id === id);
  if(!d) return;

  document.getElementById('modal-title').textContent = d.naam;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border);">
      <div class="driver-avatar" style="width:64px;height:64px;font-size:1.6rem;">${d.initials}</div>
      <div>
        <div class="rating"><span class="stars">${stars(d.rating)}</span> <strong>${d.rating}</strong> — ${d.reviews} beoordelingen</div>
        <div class="badge-row" style="margin-top:0.5rem;">
          <span class="badge badge-green">✓ VOG gecertificeerd</span>
          <span class="badge badge-amber">${d.erv} jaar ervaring</span>
          ${d.extra !== 'Geen' ? `<span class="badge badge-gray">${d.extra}</span>` : ''}
        </div>
        <div style="font-size:0.85rem;color:var(--ink-light);margin-top:0.5rem;font-style:italic;">"${d.bio}"</div>
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
    <button class="btn btn-amber" style="flex:1;" onclick="alert('Contactformulier verstuurd naar ${d.naam}!\\nU ontvangt binnen 24 uur een reactie.')">📩 Neem contact op</button>
    <button class="btn btn-dark" onclick="closeModalDirect()">Sluiten</button>
  `;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
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
  const val = document.getElementById('r-bio').value.length;
  document.getElementById('char-count').textContent = val;
}

// ── REGISTER ──
const registeredDrivers = [];
let nextId = 100;

function submitRegistration() {
  const voornaam = document.getElementById('r-voornaam').value.trim();
  const achternaam = document.getElementById('r-achternaam').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const akkoord = document.getElementById('r-akkoord').checked;

  if(!voornaam || !achternaam || !email) {
    alert('Vul minimaal uw naam en e-mailadres in.');
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

