-- BusConnect Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS busconnect;
USE busconnect;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  naam VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chauffeurs table
CREATE TABLE IF NOT EXISTS chauffeurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefoon VARCHAR(20),
  password VARCHAR(255),
  foto VARCHAR(255),
  route VARCHAR(100),
  school VARCHAR(255),
  voertuig VARCHAR(100),
  tijdOch TIME,
  tijdMid TIME,
  capaciteit INT,
  erv INT DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  bio TEXT,
  prijs DECIMAL(8,2),
  extra VARCHAR(100),
  status ENUM('actief', 'geblokkeerd', 'inactief') DEFAULT 'actief',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(255) NOT NULL,
  van VARCHAR(255),
  naar VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ritten (Trips) table
CREATE TABLE IF NOT EXISTS ritten (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT,
  chauffeur_id INT,
  datum DATE,
  tijd TIME,
  aantal_passagiers INT DEFAULT 0,
  status ENUM('gepland', 'onderweg', 'afgewezig', 'voltooid', 'geannuleerd') DEFAULT 'gepland',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES routes(id),
  FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id)
);

-- Meldingen (Notifications) table
CREATE TABLE IF NOT EXISTS meldingen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chauffeur_id INT,
  bericht TEXT NOT NULL,
  gelezen BOOLEAN DEFAULT 0,
  verstuurd_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id)
);

-- Boekingen (Bookings) table
CREATE TABLE IF NOT EXISTS boekingen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chauffeur_id INT,
  ouder_naam VARCHAR(255),
  ouder_email VARCHAR(255),
  kind_naam VARCHAR(255),
  rit_id INT,
  status ENUM('wachtend', 'bevestigd', 'afgezeggd') DEFAULT 'wachtend',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id),
  FOREIGN KEY (rit_id) REFERENCES ritten(id)
);

-- Insert sample admin account
INSERT INTO admins (email, password, naam) VALUES 
('admin@busconnect.nl', '$2a$10$WH6/sxCu6Cm.rKIa5D92ZO7lOfjxo9.4XYzBm1e0KfPM45KJR8iye', 'Admin');

-- Insert sample chauffeurs
INSERT INTO chauffeurs (naam, email, telefoon, route, school, voertuig, tijdOch, tijdMid, capaciteit, erv, rating, reviews, bio, prijs, extra) VALUES
('Jan Pieters', 'jan@chauffeur.nl', '0612345678', 'Noord', 'O.S Flora', 'Mercedes Sprinter', '07:45', '15:30', 8, 5, 4.8, 42, 'Veilig en betrouwbaar schoolvervoer. Volledig VOG gecertificeerd en 5 jaar ervaring.', 150.00, 'VOG'),
('Maria Gonzalez', 'maria@chauffeur.nl', '0687654321', 'Zuid', 'IMEAO', 'Volkswagen Transporter', '07:30', '15:15', 10, 3, 4.6, 28, 'Vriendelijke chauffeur met passie voor kindervervoer. Ervaring met jonge kinderen.', 145.00, 'Kindvriendelijk'),
('Peter van der Meer', 'peter@chauffeur.nl', '0698765432', 'Oost', 'O.S Welgelegen', 'Ford Transit', '08:00', '15:45', 12, 7, 4.9, 55, 'Zeer ervaren chauffeur. Verzorgde en schone bus. Perfecte veiligheidsrecord.', 160.00, 'Groot voertuig'),
('Sofia Martinez', 'sofia@chauffeur.nl', '0645678901', 'West', 'O.S. Sophia\'s Lust', 'Renault Master', '07:15', '15:00', 9, 4, 4.7, 35, 'Professioneel en punctueel. Nederlandse en Spaanse chauffeur met beide ervaring.', 155.00, 'Tweetalig');

-- Insert sample routes
INSERT INTO routes (naam, van, naar, description) VALUES
('Route Noord', 'Stadskern Noord', 'O.S Flora', 'Route door stadskern naar Flora school'),
('Route Zuid', 'Wijk Zuidpark', 'IMEAO', 'Route via Zuidpark naar IMEAO'),
('Route Oost', 'Oost Woonwijk', 'O.S Welgelegen', 'Route door Oost woonwijk naar Welgelegen'),
('Route West', 'Industrieterrein West', 'O.S. Sophia\'s Lust', 'Route langs industrieterrein naar Sophia\'s Lust');

-- Insert sample ritten
INSERT INTO ritten (route_id, chauffeur_id, datum, tijd, status) VALUES
(1, 1, CURDATE(), '07:45', 'gepland'),
(2, 2, CURDATE(), '07:30', 'gepland'),
(3, 3, CURDATE(), '08:00', 'gepland'),
(4, 4, CURDATE(), '07:15', 'gepland'),
(1, 1, CURDATE(), '15:30', 'gepland'),
(2, 2, CURDATE(), '15:15', 'gepland'),
(3, 3, CURDATE(), '15:45', 'gepland'),
(4, 4, CURDATE(), '15:00', 'gepland');
