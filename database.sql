-- ============================================
--  BUSCONNECT — database.sql
--  MySQL Schema
--  Run: mysql -u root -p busconnect < database.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS busconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE busconnect;

-- ─── Drivers (chauffeurs) ───────────────────
CREATE TABLE IF NOT EXISTS drivers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  first_name      VARCHAR(80)   NOT NULL,
  last_name       VARCHAR(80)   NOT NULL,
  email           VARCHAR(180)  NOT NULL UNIQUE,
  phone           VARCHAR(30),
  password_hash   VARCHAR(255)  NOT NULL,
  photo_url       VARCHAR(255),
  route           VARCHAR(200)  NOT NULL,
  district        VARCHAR(100),
  experience      VARCHAR(100),
  license_number  VARCHAR(80),
  availability    VARCHAR(80)   DEFAULT 'maandag-vrijdag',
  rating          DECIMAL(3,1)  DEFAULT 4.5,
  review_count    INT           DEFAULT 0,
  is_available    TINYINT(1)    DEFAULT 1,
  is_blocked      TINYINT(1)    DEFAULT 0,
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ─── Parents / Ouders ───────────────────────
CREATE TABLE IF NOT EXISTS parents (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80)  NOT NULL,
  last_name  VARCHAR(80)  NOT NULL,
  email      VARCHAR(180) NOT NULL UNIQUE,
  phone      VARCHAR(30),
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ─── Requests (aanvragen) ───────────────────
CREATE TABLE IF NOT EXISTS requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  driver_id   INT          NOT NULL,
  parent_name VARCHAR(160) NOT NULL,
  parent_email VARCHAR(180) NOT NULL,
  route       VARCHAR(200),
  status      ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- ─── Routes ─────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  driver_id   INT         NOT NULL,
  name        VARCHAR(200) NOT NULL,
  start_point VARCHAR(100),
  end_point   VARCHAR(100),
  trips_per_day INT        DEFAULT 2,
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- ─── Locations (GPS tracking) ───────────────
CREATE TABLE IF NOT EXISTS locations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  driver_id  INT          NOT NULL,
  latitude   DECIMAL(10,7) NOT NULL,
  longitude  DECIMAL(10,7) NOT NULL,
  recorded_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- ─── Sample data ────────────────────────────
INSERT INTO drivers
  (first_name, last_name, email, phone, password_hash, route, district, experience, license_number, rating, review_count, is_available)
VALUES
  ('Jan',     'Amoida',       'jan@busconnect.sr',   '+597712345', '$2b$10$placeholder', 'Paramaribo → Lelydorp',           'Paramaribo', '6 jaar ervaring', 'SR-2018-00112', 5.0, 28, 1),
  ('Priya',   'Ramkhelawan',  'priya@busconnect.sr', '+597724881', '$2b$10$placeholder', 'Wanica → Flora School',           'Wanica',     '4 jaar ervaring', 'SR-2020-00334', 4.8, 19, 1),
  ('Carlos',  'Apinsa',       'carlos@busconnect.sr','+597731002', '$2b$10$placeholder', 'Nickerie → Centrum',              'Nickerie',   '8 jaar ervaring', 'SR-2016-00567', 4.9, 41, 1),
  ('Fatimah', 'Noorani',      'fatimah@busconnect.sr','+597745660','$2b$10$placeholder', 'Paramaribo → Anton de Kom School','Paramaribo', '3 jaar ervaring', 'SR-2021-00789', 4.7, 14, 0),
  ('Ravi',    'Soerdjbali',   'ravi@busconnect.sr',  '+597768442', '$2b$10$placeholder', 'Lelydorp → EBG School',           'Wanica',     '5 jaar ervaring', 'SR-2019-00903', 4.6, 22, 1),
  ('Maureen', 'Doelwijt',     'maureen@busconnect.sr','+597791223','$2b$10$placeholder', 'Commewijne → Paramaribo',         'Commewijne', '7 jaar ervaring', 'SR-2017-01011', 5.0, 33, 1);
