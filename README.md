# 🚌 BusConnect - Schoolbuserverpoorslaatvooningsplatform

Een volledige web-applicatie voor het boeken van schoolbus services. Ouders kunnen chauffeurs zoeken en boeken, en chauffeurs kunnen zich registreren en hun services aanbieden.

## Features

✅ Chauffeur registratie & login  
✅ Chauffeur profiel management  
✅ Zoeken & filteren op chauffeurs  
✅ Booking system  
✅ Admin dashboard  
✅ Email notifications  
✅ VOG certificering tracking  

## Installatie

### 1. Database Setup

```bash
# Open MySQL command line
mysql -u root

# Run the setup script
source C:/Users/User/downloads/busconnect/setup.sql
```

### 2. Environment Configuration

Werk het `.env` bestand bij in `server/` folder:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=busconnect
JWT_SECRET=your_secure_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=3000
```

### 3. Dependencies

```bash
cd server
npm install
```

### 4. Start Server

```bash
npm start
```

Server draait op: **http://localhost:3000**

## Gebruik

### Homepagina
- Open `index.html` in browser
- Zoek en filter chauffeurs op naam, route, school
- Klik op chauffeur voor meer details

### Word Chauffeur
- Open `chauffeur.html`
- Vul registratieformulier in
- Stel je route, voertuig en tarief in
- Ouders kunnen je meteen vinden

### Admin Panel
- Open `admin-login.html`
- Inloggen met admin@busconnect.nl / wachtwoord

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/chauffeur/login` - Chauffeur login
- `POST /api/auth/chauffeur/register` - Chauffeur registratie

### Chauffeurs
- `GET /api/chauffeurs` - Alle actieve chauffeurs
- `GET /api/chauffeurs/:id` - Chauffeur details
- `GET /api/chauffeurs/:id/ritten` - Chauffeur ritten
- `PUT /api/chauffeurs/:id` - Update chauffeur info

### Routes & Ritten
- `GET /api/routes` - Alle routes
- `POST /api/routes` - Nieuwe route
- `POST /api/routes/ritten` - Nieuwe rit toevoegen

### Boekingen
- `POST /api/boekingen` - Nieuwe boeking
- `GET /api/boekingen/chauffeur/:id` - Chauffeur boekingen
- `PUT /api/boekingen/:id/status` - Update boeking status

### Meldingen
- `POST /api/meldingen` - Verstuur melding
- `GET /api/meldingen/:chauffeur_id` - Chauffeur meldingen

## Standaard Admin Account

- Email: `admin@busconnect.nl`
- Wachtwoord: `admin`

## Standaard Chauffeurs (Demo Data)

De setup.sql bevat 4 demo chauffeurs klaar voor testen.

## Troubleshooting

### Database error?
- MySQL draait? Check `Services` in Windows
- Juiste database naam? Check `.env` bestand

### API antwoord gives error?
- Controleer CORS instellingen in `server.js`
- Check JWT_SECRET in `.env`

### Email verstuurt niet?
- Zet Gmail app-specific password in `.env`
- Check `server/mailer.js`

## Project Structuur

```
busconnect/
├── index.html              # Homepagina (ouders)
├── chauffeur.html          # Chauffeur registratie
├── admin-login.html        # Admin login
├── admin-dashboard.html    # Admin panel
├── click.js                # Frontend logica
├── main.css, home.css      # Styling
├── setup.sql               # Database schema
├── .env                    # Configuratie
└── server/
    ├── server.js           # Express server
    ├── db.js               # Database connection
    ├── mailer.js           # Email service
    ├── package.json
    └── routes/
        ├── auth.js         # Auth endpoints
        ├── chauffeur.js    # Chauffeur endpoints
        ├── routes.js       # Routes endpoints
        ├── boekingen.js    # Booking endpoints
        └── meldingen.js    # Notification endpoints
```

## Licentie

ISC

## Contact

Voor vragen of support: zie het platform contact formulier