/* ============================================================
   BUSCONNECT — main.js
   Branch: darryl-kasandinomo / UI & Navigatie
   Schoolproject: UNASAT — The Element 3
   ============================================================ */

'use strict';

// ── 1. THEME TOGGLE (Dark / Light Mode) ──────────────────────
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const saved = localStorage.getItem('busconnect-theme') || 'light';
  applyTheme(saved);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('busconnect-theme', next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const thumb = document.querySelector('.toggle-thumb');
  if (thumb) {
    thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

// ── 2. PAGE NAVIGATION (SPA) ─────────────────────────────────
function showPage(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    // Trigger scroll reveals on the new page
    setTimeout(checkReveal, 50);
  }

  // Update nav pill active state
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === page);
  });

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 3. HAMBURGER MENU (mobile) ───────────────────────────────
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// ── 4. FAQ ACCORDION ─────────────────────────────────────────
function toggleFaq(questionEl) {
  const item = questionEl.closest('.faq-item');
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Close all open items
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    openItem.classList.remove('open');
  });

  // Open clicked item if it was closed
  if (!isOpen) {
    item.classList.add('open');
  }
}

// ── 5. FILTER & DRIVER CARDS ─────────────────────────────────
let allDrivers = [];

function stars(rating) {
  const r = Math.round(rating || 0);
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

function renderDriverCard(d) {
  const avatarContent = d.foto
    ? `<img src="${d.foto}" alt="${d.naam}">`
    : (d.initials || '??');

  return `
    <div class="driver-card" onclick="openModal(${d.id})">
      <div class="driver-card-top">
        <div class="driver-avatar">${avatarContent}</div>
        <div>
          <div class="driver-name">${d.naam}</div>
          <div class="driver-since">${d.erv || 0} jaar ervaring</div>
          <div class="badge-row">
            <span class="badge badge-green">✓ VOG</span>
            <span class="badge badge-amber">${d.route || 'Route'}</span>
            ${d.extra && d.extra !== 'Geen' ? `<span class="badge badge-gray">${d.extra}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="driver-card-body">
        <div class="driver-info-grid">
          <div class="info-item"><label>School</label><span>${(d.school || '').substring(0, 22)}</span></div>
          <div class="info-item"><label>Voertuig</label><span>${(d.voertuig || 'Onbekend').split(' ')[0]}</span></div>
          <div class="info-item"><label>Ochtend</label><span>${d.tijdOch || '--:--'}</span></div>
          <div class="info-item"><label>Middag</label><span>${d.tijdMid || '--:--'}</span></div>
          <div class="info-item"><label>Capaciteit</label><span>${d.capaciteit || 0} kinderen</span></div>
          <div class="info-item"><label>Beoordeling</label><span class="rating"><span class="stars">${stars(d.rating)}</span> ${(d.rating || 0).toFixed(1)}</span></div>
        </div>
        <div style="font-size:0.82rem;color:var(--text-muted);line-height:1.5;border-top:1px solid var(--border);padding-top:0.75rem;">
          "${(d.bio || '').substring(0, 90)}${(d.bio || '').length > 90 ? '…' : ''}"
        </div>
      </div>
      <div class="driver-card-footer">
        <div class="price-display">SRD ${d.prijs || 0} <small>/maand</small></div>
        <button class="btn btn-amber btn-sm">Bekijk profiel →</button>
      </div>
    </div>
  `;
}

function filterDrivers() {
  const search = document.getElementById('f-search')?.value.toLowerCase() || '';
  const school = document.getElementById('f-school')?.value || '';
  const route  = document.getElementById('f-route')?.value || '';

  const filtered = allDrivers.filter(d => {
    if (search && !d.naam.toLowerCase().includes(search) && !(d.route || '').toLowerCase().includes(search)) return false;
    if (school && d.school !== school) return false;
    if (route  && d.route  !== route)  return false;
    return true;
  });

  const grid    = document.getElementById('driver-grid');
  const empty   = document.getElementById('empty-state');
  const countEl = document.getElementById('result-count');

  if (countEl) countEl.textContent = `(${filtered.length} gevonden)`;

  if (filtered.length === 0) {
    if (grid)  grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
  } else {
    if (grid)  grid.innerHTML = filtered.map(renderDriverCard).join('');
    if (empty) empty.style.display = 'none';
  }
}

function resetFilters() {
  ['f-search', 'f-school', 'f-route', 'f-dag', 'f-prijs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filterDrivers();
}

function updateOptions() {
  const selectedCategory = document.getElementById('category')?.value || '';
  document.querySelectorAll('.items option').forEach(option => {
    const cat = option.getAttribute('data-category');
    if (!cat) return;
    option.style.display = (cat === selectedCategory || selectedCategory === '') ? '' : 'none';
  });
}

// ── 6. MODAL ─────────────────────────────────────────────────
function openModal(id) {
  const d = allDrivers.find(x => x.id === id);
  if (!d) return;

  const avatarContent = d.foto
    ? `<img src="${d.foto}" alt="${d.naam}">`
    : (d.initials || '??');

  const titleEl = document.getElementById('modal-title');
  const bodyEl  = document.getElementById('modal-body');
  const actEl   = document.getElementById('modal-actions');

  if (titleEl) titleEl.textContent = d.naam;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border);">
        <div class="driver-avatar" style="width:60px;height:60px;font-size:1.5rem;">${avatarContent}</div>
        <div>
          <div class="rating"><span class="stars">${stars(d.rating)}</span> <strong>${(d.rating || 0).toFixed(1)}</strong> — ${d.reviews || 0} beoordelingen</div>
          <div class="badge-row" style="margin-top:0.4rem;">
            <span class="badge badge-green">✓ VOG gecertificeerd</span>
            <span class="badge badge-amber">${d.erv || 0} jaar ervaring</span>
            ${d.extra && d.extra !== 'Geen' ? `<span class="badge badge-gray">${d.extra}</span>` : ''}
          </div>
          <div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.4rem;font-style:italic;">"${d.bio || 'Professioneel schoolvervoer.'}"</div>
        </div>
      </div>
      <div class="modal-detail-row"><span class="key">School</span><span class="val">${d.school || '-'}</span></div>
      <div class="modal-detail-row"><span class="key">Route / wijk</span><span class="val">${d.route || '-'}</span></div>
      <div class="modal-detail-row"><span class="key">Vertrektijd ochtend</span><span class="val">${d.tijdOch || '--:--'}</span></div>
      <div class="modal-detail-row"><span class="key">Vertrektijd middag</span><span class="val">${d.tijdMid || '--:--'}</span></div>
      <div class="modal-detail-row"><span class="key">Beschikbare dagen</span><span class="val">${(d.dagen || []).join(' · ')}</span></div>
      <div class="modal-detail-row"><span class="key">Voertuig</span><span class="val">${d.voertuig || '-'}</span></div>
      <div class="modal-detail-row"><span class="key">Kenteken</span><span class="val">${d.kenteken || '-'}</span></div>
      <div class="modal-detail-row"><span class="key">Extra's</span><span class="val">${d.extra || '-'}</span></div>
      <div class="modal-detail-row"><span class="key">Tarief</span><span class="val" style="color:var(--accent-dark);font-weight:700;font-size:1rem;">SRD ${d.prijs || 0} / maand</span></div>
    `;
  }

  if (actEl) {
    actEl.innerHTML = `
      <button class="btn btn-amber" style="flex:1;" onclick="contactDriver(${d.id}, '${d.naam.replace(/'/g, "\\'")}')">📩 Neem contact op</button>
      <button class="btn btn-dark" onclick="closeModalDirect()">Sluiten</button>
    `;
  }

  const overlay = document.getElementById('modal');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function contactDriver(id, naam) {
  alert(`Contactformulier verstuurd naar ${naam}!\nU ontvangt binnen 24 uur een reactie.`);
  closeModalDirect();
}

function closeModal(e) {
  if (e.target === document.getElementById('modal')) closeModalDirect();
}

function closeModalDirect() {
  const overlay = document.getElementById('modal');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── 7. REGISTRATION FORM ─────────────────────────────────────
const registeredDrivers = [];
let nextId = 100;
let fotoFile = null;

function handlePhotoPreview(input) {
  fotoFile = input.files[0] || null;
  const preview = document.getElementById('photo-preview');
  if (!preview) return;

  if (fotoFile) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.style.display = 'block';
      preview.querySelector('img').src = e.target.result;
    };
    reader.readAsDataURL(fotoFile);
  } else {
    preview.style.display = 'none';
  }
}

function updateCharCount() {
  const val   = document.getElementById('r-bio')?.value.length || 0;
  const count = document.getElementById('char-count');
  if (count) count.textContent = val;
}

function toggleDay(el) {
  el.classList.toggle('on');
}

function submitRegistration() {
  const voornaam  = document.getElementById('r-voornaam')?.value.trim() || '';
  const achternaam = document.getElementById('r-achternaam')?.value.trim() || '';
  const email     = document.getElementById('r-email')?.value.trim() || '';
  const akkoord   = document.getElementById('r-akkoord')?.checked || false;

  if (!voornaam || !achternaam || !email) {
    alert('Vul alle verplichte velden in (naam en e-mail).');
    return;
  }
  if (!fotoFile) {
    alert('Upload een profielfoto voordat u zich registreert.');
    return;
  }
  if (!akkoord) {
    alert('U dient akkoord te gaan met de gebruiksvoorwaarden.');
    return;
  }

  const dagen = [...document.querySelectorAll('#days-grid .day-toggle.on')]
    .map(el => el.textContent);

  const reader = new FileReader();
  reader.onload = e => {
    const newDriver = {
      id:       nextId++,
      naam:     `${voornaam} ${achternaam}`,
      initials: (voornaam[0] + achternaam[0]).toUpperCase(),
      foto:     e.target.result,
      erv:      parseInt(document.getElementById('r-ervaring')?.value) || 1,
      route:    document.getElementById('r-route')?.value || 'Centrum',
      school:   document.getElementById('r-school')?.value || '',
      tijdOch:  document.getElementById('r-tijd-och')?.value || '07:30',
      tijdMid:  document.getElementById('r-tijd-mid')?.value || '14:30',
      dagen:    dagen.length > 0 ? dagen : ['Ma', 'Di', 'Wo', 'Do', 'Vr'],
      voertuig: document.getElementById('r-voertuig')?.value || 'Minibus',
      capaciteit: parseInt(document.getElementById('r-capaciteit')?.value) || 8,
      kenteken: document.getElementById('r-kenteken')?.value || 'N.v.t.',
      extra:    document.getElementById('r-extra')?.value || 'Geen',
      prijs:    parseInt(document.getElementById('r-prijs')?.value) || 150,
      terug:    document.getElementById('r-terug')?.value || 'Heen & terug',
      bio:      document.getElementById('r-bio')?.value || 'Betrouwbaar schoolvervoer.',
      rating:   5.0,
      reviews:  0,
    };

    registeredDrivers.push(newDriver);
    allDrivers.push(newDriver);
    filterDrivers();

    // Show success
    const banner = document.getElementById('success-banner');
    const form   = document.getElementById('register-form');
    if (banner) banner.classList.add('show');
    if (form)   { form.style.opacity = '0.5'; form.style.pointerEvents = 'none'; }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  reader.readAsDataURL(fotoFile);
}

function submitContactForm(e) {
  e.preventDefault();
  const naam    = document.getElementById('contact-name')?.value.trim();
  const email   = document.getElementById('contact-email')?.value.trim();
  const message = document.getElementById('contact-message')?.value.trim();

  if (!naam || !email || !message) {
    alert('Vul alle verplichte velden in.');
    return;
  }

  alert(`Bedankt, ${naam}! Uw bericht is verstuurd. Wij nemen zo spoedig mogelijk contact met u op.`);
  e.target.reset();
}

// ── 8. SCROLL REVEAL TRANSITIONS ─────────────────────────────
function checkReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const threshold = window.innerHeight * 0.88;

  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < threshold) {
      el.classList.add('visible');
    }
  });
}

function initScrollReveal() {
  // Mark all section children as reveal elements
  document.querySelectorAll('.section-header, .driver-card, .faq-item, .form-section, .contact-info-card, .contact-form-card, .sidebar-card, .form-card').forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 4 === 1) el.classList.add('reveal-delay-1');
    if (i % 4 === 2) el.classList.add('reveal-delay-2');
    if (i % 4 === 3) el.classList.add('reveal-delay-3');
  });

  checkReveal();
  window.addEventListener('scroll', checkReveal, { passive: true });
}

// ── 9. INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHamburger();
  initScrollReveal();
  filterDrivers();

  // Default to home page
  showPage('home');
});
