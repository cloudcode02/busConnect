 const TOKEN = localStorage.getItem('admin_token');

  // Auth check
  if (!TOKEN) window.location.href = 'admin-login.html';

  const headers = {
  'Content-Type': 'application/json'
};


  // ── PANEL NAVIGATIE ──
  function showPanel(name) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');

    const navItems = {
      dashboard: 0, chauffeurs: 1, routes: 3, meldingen: 5
    };

    const items = document.querySelectorAll('.nav-item');
    const idx = { dashboard:0, chauffeurs:1, routes:2, meldingen:3 };
    if (items[idx[name]]) items[idx[name]].classList.add('active');

    const titles = { dashboard:'Dashboard', chauffeurs:'Chauffeurs beheren', routes:'Routes & Ritten', meldingen:'Meldingen sturen' };
    document.getElementById('topbar-title').textContent = titles[name] || name;

    if (name === 'chauffeurs') laadChauffeurs();
    if (name === 'routes') { laadRoutes(); laadDropdowns(); }
    if (name === 'meldingen') laadMeldingDropdown();
    if (name === 'dashboard') laadDashboard();
  }

  // ── TOAST ──
  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ── DASHBOARD ──
  async function laadDashboard() {
    try {
      const res = await fetch('/api/chauffeurs', { headers });
      const chauffeurs = await res.json();

      const actief = chauffeurs.filter(c => c.status !== 'geblokkeerd').length;
      const geblokkeerd = chauffeurs.filter(c => c.status === 'geblokkeerd').length;

      document.getElementById('stat-total').textContent = chauffeurs.length;
      document.getElementById('stat-actief').textContent = actief;
      document.getElementById('stat-geblokkeerd').textContent = geblokkeerd;

      const routeRes = await fetch('/api/routes', { headers });
      const routes = await routeRes.json();
      document.getElementById('stat-routes').textContent = routes.length;

      const recent = chauffeurs.slice(-5).reverse();
      document.getElementById('recent-table').innerHTML = recent.length === 0
        ? '<div class="empty"><span class="icon">👨‍✈️</span>Nog geen chauffeurs</div>'
        : `<table>
            <thead><tr><th>Naam</th><th>E-mail</th><th>Status</th></tr></thead>
            <tbody>${recent.map(c => `
              <tr>
                <td>${c.naam}</td>
                <td>${c.email || '—'}</td>
                <td><span class="status-badge ${c.status === 'geblokkeerd' ? 'status-geblokkeerd' : 'status-actief'}">
                  ${c.status === 'geblokkeerd' ? '🚫 Geblokkeerd' : '✅ Actief'}
                </span></td>
              </tr>`).join('')}
            </tbody>
          </table>`;
    
} catch (e) {
  console.log('FOUT:', e);
  document.getElementById('recent-table').innerHTML = '<div class="empty">❌ Kan data niet laden. Controleer de server.</div>';
}
    }


  // ── CHAUFFEURS ──
  async function laadChauffeurs() {
    document.getElementById('chauffeurs-table').innerHTML = '<div class="loading">⏳ Laden...</div>';
    try {
      const res = await fetch('/api/chauffeurs', { headers });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        document.getElementById('chauffeurs-table').innerHTML = '<div class="empty"><span class="icon">👨‍✈️</span>Geen chauffeurs gevonden.</div>';
        return;
      }

      document.getElementById('chauffeurs-table').innerHTML = `
        <table>
          <thead>
            <tr><th>ID</th><th>Naam</th><th>E-mail</th><th>Telefoon</th><th>Status</th><th>Acties</th></tr>
          </thead>
          <tbody>
            ${data.map(c => `
              <tr id="row-${c.id}">
                <td style="color:var(--muted)">#${c.id}</td>
                <td><strong>${c.naam}</strong></td>
                <td>${c.email || '—'}</td>
                <td>${c.telefoon || '—'}</td>
                <td>
                  <span class="status-badge ${c.status === 'geblokkeerd' ? 'status-geblokkeerd' : 'status-actief'}">
                    ${c.status === 'geblokkeerd' ? '🚫 Geblokkeerd' : '✅ Actief'}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-warning" onclick="blokkeer(${c.id}, '${c.naam}')">
                      ${c.status === 'geblokkeerd' ? '✅ Deblokkeer' : '🚫 Blokkeer'}
                    </button>
                    <button class="btn btn-danger" onclick="verwijder(${c.id}, '${c.naam}')">🗑️ Verwijder</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    } catch (e) {
      document.getElementById('chauffeurs-table').innerHTML = '<div class="empty">❌ Fout bij laden.</div>';
    }
  }

  async function blokkeer(id, naam) {
    if (!confirm(`Wil je "${naam}" blokkeren/deblokkeren?`)) return;
    try {
      await fetch(`/api/chauffeurs/${id}/blokkeer`, { method: 'PUT', headers });
      showToast(`${naam} status aangepast.`);
      laadChauffeurs();
    } catch { showToast('Fout bij blokkeren.', 'error'); }
  }

  async function verwijder(id, naam) {
    if (!confirm(`Weet je zeker dat je "${naam}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    try {
      await fetch(`/api/chauffeurs/${id}`, { method: 'DELETE', headers });
      showToast(`${naam} verwijderd.`);
      laadChauffeurs();
    } catch { showToast('Fout bij verwijderen.', 'error'); }
  }

  // ── ROUTES ──
  async function laadRoutes() {
    document.getElementById('routes-table').innerHTML = '<div class="loading">⏳ Laden...</div>';
    try {
      const res = await fetch('/api/routes', { headers });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        document.getElementById('routes-table').innerHTML = '<div class="empty"><span class="icon">🗺️</span>Geen routes gevonden.</div>';
        return;
      }

      document.getElementById('routes-table').innerHTML = `
        <table>
          <thead><tr><th>ID</th><th>Naam</th><th>Van</th><th>Naar</th></tr></thead>
          <tbody>
            ${data.map(r => `
              <tr>
                <td style="color:var(--muted)">#${r.id}</td>
                <td><strong>${r.naam}</strong></td>
                <td>${r.van}</td>
                <td>${r.naar}</td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    } catch {
      document.getElementById('routes-table').innerHTML = '<div class="empty">❌ Fout bij laden.</div>';
    }
  }

  async function voegRouteToe() {
    const naam = document.getElementById('r-naam').value.trim();
    const van = document.getElementById('r-van').value.trim();
    const naar = document.getElementById('r-naar').value.trim();
    if (!naam || !van || !naar) { showToast('Vul alle velden in.', 'error'); return; }

    try {
      await fetch('/api/routes', { method: 'POST', headers, body: JSON.stringify({ naam, van, naar }) });
      showToast('Route toegevoegd!');
      document.getElementById('r-naam').value = '';
      document.getElementById('r-van').value = '';
      document.getElementById('r-naar').value = '';
      laadRoutes();
      laadDropdowns();
    } catch { showToast('Fout bij toevoegen.', 'error'); }
  }

  async function voegRitToe() {
    const route_id = document.getElementById('rit-route').value;
    const chauffeur_id = document.getElementById('rit-chauffeur').value;
    const datum = document.getElementById('rit-datum').value;
    const tijd = document.getElementById('rit-tijd').value;
    if (!route_id || !chauffeur_id || !datum || !tijd) { showToast('Vul alle velden in.', 'error'); return; }

    try {
      await fetch('/api/routes/ritten', { method: 'POST', headers, body: JSON.stringify({ route_id, chauffeur_id, datum, tijd }) });
      showToast('Rit gepland!');
    } catch { showToast('Fout bij plannen.', 'error'); }
  }

  async function laadDropdowns() {
    try {
      const [routeRes, chaufRes] = await Promise.all([
        fetch('/api/routes', { headers }),
        fetch('/api/chauffeurs', { headers })
      ]);
      const routes = await routeRes.json();
      const chauffeurs = await chaufRes.json();

      document.getElementById('rit-route').innerHTML =
        '<option value="">-- selecteer route --</option>' +
        (Array.isArray(routes) ? routes.map(r => `<option value="${r.id}">${r.naam}</option>`).join('') : '');

      document.getElementById('rit-chauffeur').innerHTML =
        '<option value="">-- selecteer chauffeur --</option>' +
        (Array.isArray(chauffeurs) ? chauffeurs.map(c => `<option value="${c.id}">${c.naam}</option>`).join('') : '');
    } catch {}
  }

  // ── MELDINGEN ──
  async function laadMeldingDropdown() {
    try {
      const res = await fetch('/api/chauffeurs', { headers });
      const data = await res.json();
      document.getElementById('m-chauffeur').innerHTML =
        '<option value="">-- selecteer chauffeur --</option>' +
        (Array.isArray(data) ? data.map(c => `<option value="${c.id}">${c.naam}</option>`).join('') : '');
    } catch {}
  }

  async function stuurMelding() {
    const chauffeur_id = document.getElementById('m-chauffeur').value;
    const bericht = document.getElementById('m-bericht').value.trim();
    if (!chauffeur_id || !bericht) { showToast('Selecteer een chauffeur en typ een bericht.', 'error'); return; }

    try {
      await fetch('/api/meldingen', { method: 'POST', headers, body: JSON.stringify({ chauffeur_id, bericht }) });
      showToast('Melding verstuurd!');
      document.getElementById('m-bericht').value = '';
      document.getElementById('m-chauffeur').value = '';
    } catch { showToast('Fout bij versturen.', 'error'); }
  }

  // ── LOGOUT ──
  function logout() {
    if (confirm('Wil je uitloggen?')) {
      localStorage.removeItem('admin_token');
      window.location.href = 'admin-login.html';
    }
  }

  // ── INIT ──
  laadDashboard();