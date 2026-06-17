// ============================================
//  BUSCONNECT — server.js
//  Express.js backend with MySQL
// ============================================

const express    = require("express");
const mysql      = require("mysql2/promise");
const multer     = require("multer");
const path       = require("path");
const bcrypt     = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ─── File Upload (profile photos) ─────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "public/images")),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e5);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype));
  },
});

// ─── Database Pool ────────────────────────────
const db = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASS     || "",
  database: process.env.DB_NAME     || "busconnect",
  waitForConnections: true,
  connectionLimit:    10,
});

// ─── Mailer ───────────────────────────────────
const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(to, subject, html) {
  try {
    await mailer.sendMail({ from: `"BusConnect" <${process.env.MAIL_USER}>`, to, subject, html });
    console.log(`📧 Mail sent to ${to}`);
  } catch (err) {
    console.error("Mail error:", err.message);
  }
}

// ─── Helper: send confirmation email ─────────
function registrationEmail(name, email) {
  return sendMail(
    email,
    "Welkom bij BusConnect! ✅",
    `<div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0e0e0e;color:#e8e4dc;padding:2rem;border-radius:12px;">
      <h2 style="color:#f5a623;">🚌 BusConnect</h2>
      <p>Beste <strong>${name}</strong>,</p>
      <p>Uw registratie is succesvol ontvangen. Uw profiel is nu zichtbaar voor ouders op het platform.</p>
      <p style="color:#6b6660;font-size:0.85rem;">The Element 3 · Adis Universiteit · Suriname</p>
    </div>`
  );
}

function adminNotifyEmail(driverName, driverEmail) {
  if (!process.env.ADMIN_EMAIL) return;
  return sendMail(
    process.env.ADMIN_EMAIL,
    `Nieuwe registratie: ${driverName}`,
    `<p>Nieuwe chauffeur geregistreerd:<br><strong>${driverName}</strong> (${driverEmail})</p>`
  );
}

// ══════════════════════════════════════════════
//  API ROUTES
// ══════════════════════════════════════════════

// ─── GET all drivers ──────────────────────────
app.get("/api/drivers", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, first_name, last_name, route, district AS location,
              experience, rating, review_count AS reviews,
              is_available AS available, phone, photo_url
       FROM drivers
       WHERE is_blocked = 0
       ORDER BY rating DESC`
    );

    const drivers = rows.map((d) => ({
      id:         d.id,
      name:       `${d.first_name} ${d.last_name}`,
      initials:   `${d.first_name[0]}${d.last_name[0]}`.toUpperCase(),
      route:      d.route,
      location:   d.location,
      experience: d.experience,
      rating:     parseFloat(d.rating) || 4.5,
      reviews:    d.reviews || 0,
      available:  !!d.available,
      phone:      d.phone,
      photo:      d.photo_url || null,
    }));

    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database fout." });
  }
});

// ─── POST register chauffeur ──────────────────
app.post("/api/register", upload.single("photo"), async (req, res) => {
  const { firstName, lastName, email, phone, password, route, district, experience, license, availability } = req.body;

  if (!firstName || !lastName || !email || !password || !route) {
    return res.status(400).json({ success: false, message: "Vul alle verplichte velden in." });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Profielfoto is verplicht." });
  }

  try {
    // Check duplicate email
    const [existing] = await db.query("SELECT id FROM drivers WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Dit e-mailadres is al geregistreerd." });
    }

    const hash     = await bcrypt.hash(password, 10);
    const photoUrl = "/images/" + req.file.filename;

    await db.query(
      `INSERT INTO drivers
        (first_name, last_name, email, phone, password_hash, route, district, experience, license_number, availability, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, hash, route, district, experience, license, availability, photoUrl]
    );

    // Send confirmation emails
    await registrationEmail(firstName, email);
    await adminNotifyEmail(`${firstName} ${lastName}`, email);

    res.json({ success: true, message: "Registratie geslaagd." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registratie mislukt. Probeer opnieuw." });
  }
});

// ─── POST login ───────────────────────────────
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Vul alle velden in." });
  }

  try {
    let user = null;

    if (role === "admin") {
      // Admin check from .env or admin table
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
        return res.json({ success: true, user: { name: "Administrator", email, role: "admin" } });
      }
      return res.status(401).json({ success: false, message: "Onjuiste admingegevens." });
    }

    const [rows] = await db.query(
      "SELECT * FROM drivers WHERE email = ? AND is_blocked = 0",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "E-mailadres of wachtwoord onjuist." });
    }

    const driver = rows[0];
    const match  = await bcrypt.compare(password, driver.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, message: "E-mailadres of wachtwoord onjuist." });
    }

    user = {
      id:    driver.id,
      name:  `${driver.first_name} ${driver.last_name}`,
      email: driver.email,
      role:  "chauffeur",
      photo: driver.photo_url,
    };

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Inloggen mislukt." });
  }
});

// ─── DELETE driver profile ────────────────────
app.delete("/api/driver/delete", async (req, res) => {
  const { email } = req.body;
  try {
    await db.query("DELETE FROM drivers WHERE email = ?", [email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ─── POST contact form ────────────────────────
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await sendMail(
      process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      `BusConnect Contact: ${subject}`,
      `<p><strong>Van:</strong> ${name} (${email})</p><p>${message}</p>`
    );
    res.json({ success: true });
  } catch {
    res.json({ success: true }); // silent fail so UX stays smooth
  }
});

// ─── Admin: block driver ──────────────────────
app.post("/api/admin/block", async (req, res) => {
  const { id } = req.body;
  try {
    await db.query("UPDATE drivers SET is_blocked = 1 WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ─── Admin: activate driver ───────────────────
app.post("/api/admin/activate", async (req, res) => {
  const { id } = req.body;
  try {
    await db.query("UPDATE drivers SET is_blocked = 0 WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ─── Fallback: serve index.html ───────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚌 BusConnect draait op http://localhost:${PORT}\n`);
});
