# 🚌 BusConnect

> Schoolbus platform voor Suriname — The Element 3, Adis Universiteit

BusConnect verbindt ouders met gecertificeerde schoolbuschauffeurs in Suriname.
Vind betrouwbare chauffeurs, bekijk routes en volg de bus live via GPS.

---

## 📁 Projectstructuur

```
busconnect/
├── public/
│   ├── index.html        ← Startpagina
│   ├── chauffeurs.html   ← Chauffeurs overzicht (ouders)
│   ├── register.html     ← Registratie chauffeur
│   ├── login.html        ← Inlogpagina
│   ├── dashboard.html    ← Chauffeur dashboard
│   ├── admin.html        ← Admin beheer paneel
│   ├── about.html        ← Over Ons + Team
│   ├── contact.html      ← Contactformulier
│   ├── faq.html          ← FAQ pagina
│   ├── style.css         ← Alle CSS stijlen
│   ├── main.js           ← Gedeelde JavaScript
│   └── images/           ← Geüploade profielfoto's
├── server.js             ← Express.js backend
├── database.sql          ← MySQL schema + voorbeelddata
├── package.json
├── .env.example          ← Kopieer naar .env en vul in
└── .gitignore
```

---

## ⚙️ Installatie & Starten

### 1. Vereisten installeren
Zorg dat deze programma's geïnstalleerd zijn:
- [Node.js](https://nodejs.org) (v18+)
- [MySQL](https://dev.mysql.com/downloads/)
- [Git](https://git-scm.com)

### 2. Project klonen of mappen openen

```bash
cd busconnect
```

### 3. Node modules installeren

```bash
npm install
```

### 4. Database aanmaken

Open MySQL en voer het schema uit:

```bash
mysql -u root -p -e "CREATE DATABASE busconnect;"
mysql -u root -p busconnect < database.sql
```

### 5. .env instellen

```bash
cp .env.example .env
```

Open `.env` en vul uw MySQL wachtwoord, e-mailadres en andere gegevens in.

### 6. Server starten

```bash
npm start
```

Of met automatisch herstarten bij wijzigingen:

```bash
npm run dev
```

Open in de browser: **http://localhost:3000**

---

## 🌐 GitHub Publiceren — Exacte Commando's

### Eerste keer publiceren (nieuw repository)

```bash
# 1. Ga naar de projectmap
cd busconnect

# 2. Initialiseer Git
git init

# 3. Voeg alle bestanden toe
git add .

# 4. Eerste commit
git commit -m "🚌 Initial commit — BusConnect v1.0"

# 5. Maak een nieuw repository aan op github.com
#    Ga naar https://github.com/new
#    Naam: busconnect
#    Klik: Create repository (ZONDER README aanvinken)

# 6. Verbind met GitHub (vervang JOUW-USERNAME)
git remote add origin https://github.com/JOUW-USERNAME/busconnect.git

# 7. Zet branch naar main
git branch -M main

# 8. Push naar GitHub
git push -u origin main
```

### Volgende keer wijzigingen pushen

```bash
git add .
git commit -m "✏️ Beschrijf wat je hebt veranderd"
git push
```

---

## 👥 Team — The Element 3

| Naam | Studnr | Taak |
|------|--------|------|
| Ngaisa Basedie | 254011 | Registratie, profiel, inloggen |
| Shriyanie Debi-tewari | 254012 | Admin, mail, meldingen |
| Darryl Kasandinomo | 256015 | UI, navigatie, tabs |
| Adney Dayen | 255024 | Database, SQL, aanvragen |
| Shemar Dipotaroeno | 256020 | GPS, live tracker, locaties |

---

## 🛠️ Tech Stack

| Laag | Technologie |
|------|-------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL (via mysql2) |
| Email | Nodemailer (Gmail) |
| Bestanden | Multer (foto upload) |
| GPS | Browser Geolocation API + Google Maps |

---

## 📄 Licentie

Schoolproject — Adis Universiteit Suriname, 2026
