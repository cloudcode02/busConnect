-- BusConnect schema
CREATE DATABASE IF NOT EXISTS busconnect;
USE busconnect;

CREATE TABLE IF NOT EXISTS drivers (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  voornaam VARCHAR(100) NOT NULL,
  achternaam VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  telefoon VARCHAR(50),
  profile_photo_url LONGTEXT,
  rijbewijs VARCHAR(10),
  ervaring INT DEFAULT 0,
  voertuig VARCHAR(100),
  capaciteit INT,
  kentekenplaat VARCHAR(20),
  bouwjaar INT,
  route VARCHAR(50),
  school VARCHAR(100),
  tijd_och VARCHAR(10),
  tijd_mid VARCHAR(10),
  dag VARCHAR(50),
  prijs INT DEFAULT 0,
  op_afhaal VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_name VARCHAR(100),
  contact_achternaam VARCHAR(100),
  contact_email VARCHAR(200),
  contact_subject VARCHAR(200),
  contact_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bus_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id VARCHAR(50),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
