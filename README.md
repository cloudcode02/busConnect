[README.md](https://github.com/user-attachments/files/28201974/README.md)
# BusConnect — Branch: `darryl-kasandinomo`

**Schoolproject:** UNASAT — The Element 3  
**Student:** Darryl Kasandinomo  
**Verantwoordelijkheid:** UI & Navigatie — Tabs, navigatie en gebruiksvriendelijk ontwerp voor ouders en chauffeurs.

---

## 📁 Bestandsstructuur

```
busconnect-darryl/
├── index.html          ← Volledige SPA (alle pagina's in één bestand)
├── css/
│   └── main.css        ← 🎨 DARRYL'S VERANTWOORDELIJKHEID — Alle styling
├── js/
│   └── main.js         ← Navigatie, dark mode, FAQ, scroll-reveal, formulieren
└── img/
    └── buslogo.png     ← Logo
```

---

## ✅ Wijzigingen & verbeteringen

### CSS (`css/main.css`)
- ✅ **CSS volledig gescheiden** van HTML en JavaScript
- ✅ **Dark mode / Light mode** via CSS custom properties (`[data-theme="dark"]`)
- ✅ **Navigatie gecorrigeerd** — logo links, pills gecentreerd, toggle + hamburger rechts
- ✅ **Tekstuitlijning gefixed** — hero, headings, paragraphs correct uitgelijnd
- ✅ **Scroll-reveal animaties** — elke sectie verschijnt als je scrollt (`.reveal`)
- ✅ **Responsive** — hamburger menu voor mobiel, grid-breakpoints
- ✅ **CSS variabelen** voor licht én donker thema (geen dubbele stijlen)
- ✅ **Merge conflicts verwijderd** uit het originele `index.html`

### JavaScript (`js/main.js`)
- ✅ **Netter, stap-voor-stap** gestructureerd met duidelijke secties
- ✅ **Dark/Light toggle** werkt zonder pagina te herladen
- ✅ **FAQ accordion** werkt correct (was stuk)
- ✅ **Scroll reveal** observer toegevoegd
- ✅ **Profielfoto** upload vereist vóór registratie (screening-stap)
- ✅ **Contact form** submit handler

### HTML (`index.html`)
- ✅ **Merge conflicts** (`<<<<<<< HEAD` / `>>>>>>>`) volledig verwijderd
- ✅ **Één CSS link** (`css/main.css`), **één JS link** (`js/main.js`)
- ✅ **Navigatie structuur** correct: logo + pills + toggle + hamburger
- ✅ **School: UNASAT** bijgewerkt

---

## 🔀 GitHub workflow

```bash
# Maak jouw branch aan
git checkout -b darryl-kasandinomo

# Voeg je bestanden toe
git add css/main.css js/main.js index.html

# Commit
git commit -m "feat: UI & navigatie - dark mode, nav fix, scroll reveal, FAQ fix"

# Push naar GitHub
git push origin darryl-kasandinomo

# Teamleider kan daarna mergen via Pull Request
```

---

## 🎨 Design beslissingen

| Keuze | Reden |
|-------|-------|
| Toggle switch (niet twee aparte bulb-images) | Toegankelijker, één element, werkt met CSS |
| CSS custom properties voor thema | Eén variabele wijzigen = alles past zich aan |
| `data-theme="dark"` op `<html>` | Standaard aanpak, geen JS klasse chaos |
| Scroll-reveal met `.reveal` klasse | Schoon, geen zware library nodig |
| FAQ sluit andere items bij openen | Betere UX, geen stapels open accordions |
