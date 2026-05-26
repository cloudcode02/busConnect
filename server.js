'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const mysql      = require('mysql2');
const { MailtrapClient } = require('mailtrap');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ── DATABASE ──────────────────────────────────────────────────
const db = mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'busconnect'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database.');
    initDatabase();
});

function initDatabase() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS drivers (
            user_id           INT AUTO_INCREMENT PRIMARY KEY,
            voornaam          VARCHAR(100) NOT NULL,
            achternaam        VARCHAR(100) NOT NULL,
            email             VARCHAR(200) UNIQUE NOT NULL,
            telefoon          VARCHAR(50),
            profile_photo_url LONGTEXT,
            rijbewijs         VARCHAR(10),
            ervaring          INT DEFAULT 0,
            voertuig          VARCHAR(100),
            capaciteit        INT,
            kentekenplaat     VARCHAR(20),
            bouwjaar          INT,
            route             VARCHAR(50),
            school            VARCHAR(100),
            tijd_och          VARCHAR(10),
            tijd_mid          VARCHAR(10),
            dag               VARCHAR(50),
            prijs             INT DEFAULT 0,
            op_afhaal         VARCHAR(50),
            created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS contact_messages (
            id                 INT AUTO_INCREMENT PRIMARY KEY,
            contact_name       VARCHAR(100),
            contact_achternaam VARCHAR(100),
            contact_email      VARCHAR(200),
            contact_subject    VARCHAR(200),
            contact_message    TEXT,
            created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS bus_locations (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            bus_id      VARCHAR(50),
            latitude    DECIMAL(10, 8),
            longitude   DECIMAL(11, 8),
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    tables.forEach(sql => {
        db.query(sql, err => {
            if (err) console.error('Table init error:', err.message);
        });
    });
}

// ── MAILTRAP ──────────────────────────────────────────────────
let client = null;
if (process.env.MAILTRAP_TOKEN) {
    client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });
}

// ── SOCKET.IO — REALTIME BUS TRACKER ─────────────────────────
const activeBuses = new Map();

io.on('connection', socket => {
    // Send current bus statuses to newly connected client
    activeBuses.forEach((bus, busId) => {
        socket.emit('bus:status', { busId, online: true, driverName: bus.driverName });
    });

    socket.on('driver:start', ({ driverName, busId }) => {
        const id = busId || socket.id;
        activeBuses.set(id, { socketId: socket.id, driverName, path: [] });
        io.emit('bus:status', { busId: id, online: true, driverName });
        console.log(`Bus ${id} started tracking — chauffeur: ${driverName}`);
    });

    socket.on('driver:location', ({ lat, lng, busId }) => {
        const id  = busId || socket.id;
        const bus = activeBuses.get(id);
        if (bus) bus.path.push({ lat, lng });

        db.query(
            'INSERT INTO bus_locations (bus_id, latitude, longitude) VALUES (?, ?, ?)',
            [id, lat, lng],
            err => { if (err) console.error('Location insert error:', err.message); }
        );

        io.emit('bus:location-update', { busId: id, lat, lng });
    });

    socket.on('driver:stop', ({ busId }) => {
        const id = busId || socket.id;
        activeBuses.delete(id);
        io.emit('bus:status', { busId: id, online: false });
        console.log(`Bus ${id} stopped tracking.`);
    });

    socket.on('disconnect', () => {
        for (const [busId, bus] of activeBuses) {
            if (bus.socketId === socket.id) {
                activeBuses.delete(busId);
                io.emit('bus:status', { busId, online: false });
                break;
            }
        }
    });
});

// ── API: Frontend configuratie (publieke sleutels) ───────────
app.get('/api/config', (req, res) => {
    res.json({ mapsKey: process.env.GOOGLE_MAPS_KEY || '' });
});

// ── API: Bus status overview ──────────────────────────────────
app.get('/api/tracker/status', (req, res) => {
    const buses = [];
    activeBuses.forEach((bus, busId) => {
        buses.push({ busId, driverName: bus.driverName, online: true });
    });
    res.json({ buses });
});

// ── API: Route history for a specific bus ─────────────────────
app.get('/api/tracker/route/:busId', (req, res) => {
    const { busId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 300, 1000);

    db.query(
        'SELECT latitude, longitude, recorded_at FROM bus_locations WHERE bus_id = ? ORDER BY recorded_at DESC LIMIT ?',
        [busId, limit],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, points: rows.reverse() });
        }
    );
});

// ── API: Register driver ──────────────────────────────────────
app.post('/api/register-driver', (req, res) => {
    const {
        voornaam, achternaam, email, telefoon, profile_photo_url,
        rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
        bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
    } = req.body;

    if (!voornaam || !achternaam || !email) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const sql = `
        INSERT INTO drivers (
            voornaam, achternaam, email, telefoon, profile_photo_url,
            rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
            bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        voornaam, achternaam, email, telefoon, profile_photo_url,
        rijbewijs, ervaring, voertuig, capaciteit, kentekenplaat,
        bouwjaar, route, school, tijd_och, tijd_mid, dag, prijs, op_afhaal
    ], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, error: 'E-mailadres is al geregistreerd.' });
            }
            console.error('Register driver error:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, user_id: result.insertId });
    });
});

// ── API: Get all drivers ──────────────────────────────────────
app.get('/api/drivers', (req, res) => {
    db.query('SELECT * FROM drivers ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(rows);
    });
});

// ── API: Contact form ─────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { name, achternaam, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const sql = `
        INSERT INTO contact_messages (
            contact_name, contact_achternaam, contact_email, contact_subject, contact_message
        ) VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, achternaam, email, subject, message], async err => {
        if (err) {
            console.error('Contact Database Error:', err);
            return res.status(500).json({ success: false, error: 'DATABASE ERROR' });
        }

        if (client) {
            try {
                await client.send({
                    from: { email: 'hello@demomailtrap.co', name: 'BusConnect Contact' },
                    to:   [{ email: process.env.ADMIN_EMAIL }],
                    subject: 'New Contact Message',
                    text: `New message from:\n\nName: ${name} ${achternaam}\nEmail: ${email}\n\nMessage:\n${message}`
                });
            } catch (emailError) {
                console.error('Admin Email Error:', emailError);
            }
        }

        return res.json({ success: true });
    });
});

// ── START SERVER ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`BusConnect server running on http://localhost:${PORT}`);
});
