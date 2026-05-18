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

function readPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!file || !allowedTypes.includes(file.type)) {
      reject(new Error('Selecteer een geldige JPG- of PNG-foto.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Kon de profielfoto niet lezen.'));
    reader.readAsDataURL(file);
  });
}

function handlePhotoPreview(input) {
  const preview = document.getElementById('photo-preview');
  const img = preview.querySelector('img');
  const file = input.files[0];

  if (!file) {
    preview.style.display = 'none';
    img.src = '';
    return;
  }

  readPhotoFile(file).then(result => {
    img.src = result;
    preview.style.display = 'block';
  }).catch(() => {
    preview.style.display = 'none';
    img.src = '';
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
        <div class="driver-avatar">${avatarContent}</div>
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
        ${d.showContact ? `<div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:0.85rem;font-size:0.82rem;color:var(--ink-mid);">✉️ ${d.email} · 📞 ${d.telefoon}</div>` : ''}
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

  const grid = document.getElementById('driver-grid');
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

  const avatarContent = d.foto 
    ? `<img src="${d.foto}" alt="${d.naam}">` 
    : d.initials;

  document.getElementById('modal-title').textContent = d.naam;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border);">
      <div class="driver-avatar" style="width:64px;height:64px;font-size:1.6rem;">${avatarContent}</div>
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
  
    <div class="modal-detail-row"><span class="key">Contact</span><span class="val">${d.showContact ? `${d.email} · ${d.telefoon}` : 'Niet zichtbaar voor ouders'}</span></div>
    <div class="modal-detail-row"><span class="key">Rijbewijs</span><span class="val">${d.rijbewijsType} ${d.rijbewijsNr || ''}</span></div>
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

// Load from localStorage
function loadDrivers() {
  const stored = localStorage.getItem('busconnect_drivers');
  if (stored) {
    const data = JSON.parse(stored);
    data.drivers.forEach(d => registeredDrivers.push(d));
    nextId = data.nextId || 100;
  }
}

// Save to localStorage
function saveDrivers() {
  localStorage.setItem('busconnect_drivers', JSON.stringify({
    drivers: registeredDrivers,
    nextId: nextId
  }));
}

// Send email simulation
function sendEmails(driverData) {
  // Email naar chauffeur
  const chauffeurEmail = {
    to: driverData.email,
    subject: 'Welkom bij BusConnect - Registratie bevestigd',
    body: `Beste ${driverData.naam},

Welkom bij BusConnect! Uw registratie is succesvol verwerkt.

Uw profiel is nu zichtbaar voor ouders op het platform.

OVERZICHT VAN UW REGISTRATIE:
- Naam: ${driverData.naam}
- Telefoon: ${driverData.telefoon}
- Voertuig: ${driverData.voertuig} (${driverData.cap} plaatsen)
- Route: ${driverData.route}
- School: ${driverData.school}
- Rijbewijs: ${driverData.rijbewijsType} ${driverData.rijbewijsNr}
- Contact zichtbaar: ${driverData.showContact ? 'Ja' : 'Nee'}
- Tarief: €${driverData.prijs}/maand

U kunt uw profiel op elk moment bewerken via de "Mijn Profiel" knop op de website.

Met vriendelijke groet,
BusConnect Team`
  };

  // Email naar beheerder
  const beheerderEmail = {
    to: '254011@unasat.sr',
    subject: 'Nieuwe chauffeur geregistreerd - BusConnect',
    body: `Er is een nieuwe chauffeur geregistreerd op BusConnect:

NAAM: ${driverData.naam}
EMAIL: ${driverData.email}
TELEFOON: ${driverData.telefoon}
VOERTUIG: ${driverData.voertuig}
ROUTE: ${driverData.route}
SCHOOL: ${driverData.school}
RIJBEWIJS: ${driverData.rijbewijsType} ${driverData.rijbewijsNr}
CONTACT ZICHTBAAR VOOR OUDERS: ${driverData.showContact ? 'Ja' : 'Nee'}
REGISTRATIEDATUM: ${new Date().toLocaleDateString('nl-NL')}

Log in op het admin panel voor meer details.`
  };

  // Toon bevestiging aan gebruiker
  alert(`📧 Bevestigingsemails verzonden:\n\n1) Naar u: ${driverData.email}\n2) Naar beheerder: 254011@unasat.sr\n\n(In een echte omgeving worden deze emails daadwerkelijk verstuurd)`);
  
  console.log('Email naar chauffeur:', chauffeurEmail);
  console.log('Email naar beheerder:', beheerderEmail);
}

function submitRegistration() {
  const voornaam = document.getElementById('r-voornaam').value.trim();
  const achternaam = document.getElementById('r-achternaam').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const telefoon = document.getElementById('r-telefoon').value.trim();
  const akkoord = document.getElementById('r-akkoord').checked;
  const fotoFile = document.getElementById('r-foto').files[0];
  const showContact = document.getElementById('r-show-contact').checked;
  const rijbewijsType = document.getElementById('r-rijbewijs-type').value;
  const rijbewijsNr = document.getElementById('r-rijbewijs-nr').value.trim();
  const terugOptie = document.getElementById('r-terug').value;

  if(!voornaam || !achternaam || !email) {
    alert('Vul minimaal uw naam en e-mailadres in.');
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

  readPhotoFile(fotoFile).then(fotoData => {
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
      email: email,
      telefoon: telefoon,
      isCurrentUser: true,
      foto: fotoData,
      showContact: showContact,
      rijbewijsType: rijbewijsType,
      rijbewijsNr: rijbewijsNr,
      terug: terugOptie
    };

    registeredDrivers.push(newDriver);
    saveDrivers();

    // Verzend emails
    sendEmails(newDriver);

    document.getElementById('success-banner').classList.add('show');
    document.getElementById('register-form').style.opacity = '0.5';
    document.getElementById('register-form').style.pointerEvents = 'none';

    // Update stats
    const count = drivers.length + registeredDrivers.length;
    const statEl = document.getElementById('stat-drivers');
    if (statEl) statEl.textContent = count;

    // Toon profiel direct na registratie
    setTimeout(() => {
      openModal(newDriver.id);
      document.getElementById('modal-actions').innerHTML = `
        <button class="btn btn-amber" style="flex:1;" onclick="closeModalDirect(); editMyProfile(${newDriver.id});">
          ✏️ Mijn profiel bewerken
        </button>
        <button class="btn btn-dark" onclick="closeModalDirect()">Sluiten</button>
      `;
    }, 500);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }).catch(err => {
    alert(err.message);
  });
}

// Bewerk mijn profiel
function editMyProfile(id) {
  const all = [...drivers, ...registeredDrivers];
  const d = all.find(x => x.id === id);
  if(!d) return;

  // Vul formulier met bestaande gegevens
  document.getElementById('r-voornaam').value = d.naam.split(' ')[0];
  document.getElementById('r-achternaam').value = d.naam.split(' ').slice(1).join(' ');
  document.getElementById('r-email').value = d.email || '';
  document.getElementById('r-telefoon').value = d.telefoon || '';
  document.getElementById('r-show-contact').checked = d.showContact || false;
  document.getElementById('r-bio').value = d.bio || '';
  document.getElementById('r-voertuig').value = d.voertuig;
  document.getElementById('r-capaciteit').value = d.cap;
  document.getElementById('r-ervaring').value = d.erv;
  document.getElementById('r-kenteken').value = d.kenteken;
  document.getElementById('r-rijbewijs-type').value = d.rijbewijsType || 'B';
  document.getElementById('r-rijbewijs-nr').value = d.rijbewijsNr || '';
  document.getElementById('r-bouwjaar').value = d.jaar || '';
  document.getElementById('r-extra').value = d.extra;
  document.getElementById('r-route').value = d.route;
  document.getElementById('r-school').value = d.school;
  document.getElementById('r-tijd-och').value = d.tijdOch;
  document.getElementById('r-tijd-mid').value = d.tijdMid;
  document.getElementById('r-prijs').value = d.prijs;
  document.getElementById('r-terug').value = d.terug || 'Heen & terug';
  document.getElementById('r-foto').value = '';

  // Dagen instellen
  document.querySelectorAll('#days-grid .day-toggle').forEach(el => {
    el.classList.remove('on');
    if(d.dagen.includes(el.textContent)) {
      el.classList.add('on');
    }
  });

  // Verberg success banner en maak formulier bewerkbaar
  document.getElementById('success-banner').classList.remove('show');
  document.getElementById('register-form').style.opacity = '1';
  document.getElementById('register-form').style.pointerEvents = 'auto';

  // Verander knop naar "Opslaan"
  const btn = document.querySelector('#register-form .btn-amber');
  btn.innerHTML = '💾 Wijzigingen opslaan';
  btn.onclick = function() { saveProfileChanges(id); };

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveProfileChanges(id) {
  const index = registeredDrivers.findIndex(d => d.id === id);
  if(index === -1) {
    alert('Profiel niet gevonden.');
    return;
  }

  const dagen = [...document.querySelectorAll('#days-grid .day-toggle.on')].map(el => el.textContent);
  const existing = registeredDrivers[index];
  let fotoData = existing.foto;
  const fotoFile = document.getElementById('r-foto').files[0];

  if (fotoFile) {
    try {
      fotoData = await readPhotoFile(fotoFile);
    } catch (err) {
      alert(err.message);
      return;
    }
  }

  registeredDrivers[index] = {
    ...existing,
    naam: document.getElementById('r-voornaam').value.trim() + ' ' + document.getElementById('r-achternaam').value.trim(),
    initials: (document.getElementById('r-voornaam').value[0] + document.getElementById('r-achternaam').value[0]).toUpperCase(),
    email: document.getElementById('r-email').value.trim(),
    telefoon: document.getElementById('r-telefoon').value.trim(),
    showContact: document.getElementById('r-show-contact').checked,
    bio: document.getElementById('r-bio').value,
    voertuig: document.getElementById('r-voertuig').value,
    cap: parseInt(document.getElementById('r-capaciteit').value) || 8,
    erv: parseInt(document.getElementById('r-ervaring').value) || 1,
    kenteken: document.getElementById('r-kenteken').value,
    rijbewijsType: document.getElementById('r-rijbewijs-type').value,
    rijbewijsNr: document.getElementById('r-rijbewijs-nr').value.trim(),
    jaar: parseInt(document.getElementById('r-bouwjaar').value) || existing.jaar || 2020,
    extra: document.getElementById('r-extra').value,
    route: document.getElementById('r-route').value,
    school: document.getElementById('r-school').value,
    tijdOch: document.getElementById('r-tijd-och').value,
    tijdMid: document.getElementById('r-tijd-mid').value,
    dagen: dagen.length > 0 ? dagen : ['Ma','Di','Wo','Do','Vr'],
    prijs: parseInt(document.getElementById('r-prijs').value) || 100,
    terug: document.getElementById('r-terug').value || existing.terug || 'Heen & terug',
    foto: fotoData
  };

  saveDrivers();
  filterDrivers();

  alert('✅ Uw profiel is bijgewerkt!');
  
  const btn = document.querySelector('#register-form .btn-amber');
  if (btn) {
    btn.innerHTML = '🚌 Registreer als chauffeur';
    btn.onclick = submitRegistration;
  }
}

function showPage(page) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(el => {
    const shouldShow = el.id === `page-${page}`;
    el.style.display = shouldShow ? 'block' : 'none';
    el.classList.toggle('active', shouldShow);
  });
}

function submitContactForm(event) {
  event.preventDefault();
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !phone || !message) {
    alert('Vul alstublieft naam, e-mail, telefoonnummer en uw vraag in.');
    return;
  }

  alert(`Bedankt ${name}!\nUw bericht is verzonden. Wij nemen zo spoedig mogelijk contact met u op via ${email}.`);
  document.getElementById('contact-form').reset();
}

  window.scrollTo({ top: 0, behavior: 'smooth' });
// ── INIT ──
filterDrivers();
showPage('home');

