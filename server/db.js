const mysql = require('mysql2');
require('dotenv').config();

// Mock data for demo (since live MySQL is not available)
const mockData = {
  chauffeurs: [
    { id: 1, naam: 'Jan Pieters', email: 'jan@chauffeur.nl', telefoon: '0612345678', route: 'Noord', school: 'O.S Flora', voertuig: 'Mercedes Sprinter', tijdOch: '07:45', tijdMid: '15:30', capaciteit: 8, erv: 5, rating: 4.8, reviews: 42, bio: 'Veilig en betrouwbaar schoolvervoer. Volledig VOG gecertificeerd en 5 jaar ervaring.', prijs: 150.00, extra: 'VOG', status: 'actief' },
    { id: 2, naam: 'Maria Gonzalez', email: 'maria@chauffeur.nl', telefoon: '0687654321', route: 'Zuid', school: 'IMEAO', voertuig: 'Volkswagen Transporter', tijdOch: '07:30', tijdMid: '15:15', capaciteit: 10, erv: 3, rating: 4.6, reviews: 28, bio: 'Vriendelijke chauffeur met passie voor kindervervoer. Ervaring met jonge kinderen.', prijs: 145.00, extra: 'Kindvriendelijk', status: 'actief' },
    { id: 3, naam: 'Peter van der Meer', email: 'peter@chauffeur.nl', telefoon: '0698765432', route: 'Oost', school: 'O.S Welgelegen', voertuig: 'Ford Transit', tijdOch: '08:00', tijdMid: '15:45', capaciteit: 12, erv: 7, rating: 4.9, reviews: 55, bio: 'Zeer ervaren chauffeur. Verzorgde en schone bus. Perfecte veiligheidsrecord.', prijs: 160.00, extra: 'Groot voertuig', status: 'actief' },
    { id: 4, naam: 'Sofia Martinez', email: 'sofia@chauffeur.nl', telefoon: '0645678901', route: 'West', school: 'O.S. Sophia\'s Lust', voertuig: 'Renault Master', tijdOch: '07:15', tijdMid: '15:00', capaciteit: 9, erv: 4, rating: 4.7, reviews: 35, bio: 'Professioneel en punctueel. Nederlandse en Spaanse chauffeur met beide ervaring.', prijs: 155.00, extra: 'Tweetalig', status: 'actief' }
  ],
  admins: [
{ id: 1, email: 'admin@busconnect.nl', password: 'admin123', naam: 'Admin' }
  ],
  routes: [
    { id: 1, naam: 'Route Noord', van: 'Stadskern Noord', naar: 'O.S Flora' },
    { id: 2, naam: 'Route Zuid', van: 'Wijk Zuidpark', naar: 'IMEAO' },
    { id: 3, naam: 'Route Oost', van: 'Oost Woonwijk', naar: 'O.S Welgelegen' },
    { id: 4, naam: 'Route West', van: 'Industrieterrein West', naar: 'O.S. Sophia\'s Lust' }
  ],
  boekingen: [],
  meldingen: []
};

const db = {
  query: (sql, params, callback) => {
    // Simulate query processing
    setTimeout(() => {
      processQuery(sql, params, callback);
    }, 10);
  },
  connect: (callback) => {
    console.log('✅ Mock database loaded (demo mode)');
    if (callback) callback(null);
  },
  end: (callback) => {
    if (callback) callback(null);
  }
};

function processQuery(sql, params, callback) {
  const sqlUpper = sql.toUpperCase();
  
  // SELECT queries
  if (sqlUpper.includes('SELECT')) {
    if (sql.includes('FROM chauffeurs')) {
      return callback(null, mockData.chauffeurs);
    }
    if (sql.includes('FROM admins')) {
      const results = mockData.admins.filter(a => !params || a.email === params[0]);
      return callback(null, results);
    }
    if (sql.includes('FROM routes')) {
      return callback(null, mockData.routes);
    }
    if (sql.includes('FROM meldingen')) {
      const results = mockData.meldingen.filter(m => !params || m.chauffeur_id === params[0]);
      return callback(null, results);
    }
    if (sql.includes('FROM boekingen')) {
      const results = mockData.boekingen.filter(b => !params || b.chauffeur_id === params[0]);
      return callback(null, results);
    }
  }
  
  // INSERT queries
  if (sqlUpper.includes('INSERT INTO')) {
    if (sql.includes('chauffeurs')) {
      const newId = Math.max(...mockData.chauffeurs.map(c => c.id), 0) + 1;
      const newChauffeur = { id: newId, ...params };
      mockData.chauffeurs.push(newChauffeur);
      return callback(null, { insertId: newId });
    }
    if (sql.includes('boekingen')) {
      const newId = Math.max(...mockData.boekingen.map(b => b.id), 0) + 1;
      mockData.boekingen.push({ id: newId, status: 'wachtend' });
      return callback(null, { insertId: newId });
    }
    if (sql.includes('meldingen')) {
      const newId = Math.max(...mockData.meldingen.map(m => m.id), 0) + 1;
      mockData.meldingen.push({ id: newId });
      return callback(null, { insertId: newId });
    }
  }
  
  // UPDATE queries
  if (sqlUpper.includes('UPDATE')) {
    return callback(null, { affectedRows: 1 });
  }
  
  // DELETE queries
  if (sqlUpper.includes('DELETE')) {
    return callback(null, { affectedRows: 1 });
  }
  
  callback(null, []);
}

module.exports = db;