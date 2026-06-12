require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const cookieParser = require('cookie-parser');
const path       = require('path');
const { ensureFiles } = require('./db');

ensureFiles(); // Create data files if missing

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Static files (landing page, admin, portal, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/admin',  require('./routes/admin'));
app.use('/api',    require('./routes/api'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).send('<h2 style="font-family:sans-serif;color:#64748b;padding:40px">404 — Page not found</h2>'));

app.listen(PORT, () => {
  console.log(`\n🖨️  PrintShop Pro Server running on http://localhost:${PORT}`);
  console.log(`   Home:    http://localhost:${PORT}/`);
  console.log(`   Admin:   http://localhost:${PORT}/admin`);
  console.log(`   Portal:  http://localhost:${PORT}/api/portal`);
  console.log(`   API:     http://localhost:${PORT}/api/validate`);
  console.log(`\n   Default admin login:`);
  console.log(`   Username: admin`);
  console.log(`   Password: Admin@PrintShop2026\n`);
});
