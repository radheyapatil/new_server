const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const path     = require('path');
const router   = express.Router();
const db       = require('../db');
const { buildLicense, validateLicense, refreshStatus, PLANS, DURATIONS } = require('../licenseEngine');
const { adminAuth, JWT_SECRET } = require('../middleware/auth');

// Path to the static admin HTML page
const ADMIN_HTML = path.join(__dirname, '..', 'public', 'admin.html');

// ── LOGIN PAGE + DASHBOARD (both serve the same static HTML; JS handles auth state) ─
router.get('/login', (req, res) => {
  if (req.cookies?.adminToken) {
    try { jwt.verify(req.cookies.adminToken, JWT_SECRET); return res.redirect('/admin'); } catch {}
  }
  res.sendFile(ADMIN_HTML);
});

router.get('/', (req, res) => {
  res.sendFile(ADMIN_HTML);
});

// ── LOGIN POST (form-encoded) ─────────────────────────────────────────────────
router.post('/login', express.urlencoded({ extended: true }), (req, res) => {
  const { username, password } = req.body;
  const admin = db.readAdmin();
  if (username !== admin.username || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).sendFile(ADMIN_HTML); // browser will show login error
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
  res.cookie('adminToken', token, { httpOnly: true, maxAge: 12 * 3600 * 1000 });
  res.redirect('/admin');
});

// ── LOGOUT ────────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
});

// ── ALL API ROUTES BELOW REQUIRE AUTH ────────────────────────────────────────
router.use(adminAuth);

// ── GET ALL LICENSES (JSON, used by admin.html to render table) ───────────────
router.get('/licenses', (req, res) => {
  const all = db.getAllLicenses().map(refreshStatus);
  res.json(all);
});

// ── CREATE LICENSE ────────────────────────────────────────────────────────────
router.post('/license/create', express.json(), (req, res) => {
  try {
    const { shopName, customerName, customerPhone, plan, durationDays, customPrice } = req.body;
    if (!shopName || !plan || !durationDays) return res.json({ error: 'Missing fields' });
    const license = buildLicense({
      shopName, customerName, customerPhone, plan,
      durationDays: parseInt(durationDays),
      customPrice: customPrice ? parseInt(customPrice) : null
    });
    db.createLicense(license);
    res.json({ success: true, license });
  } catch (e) {
    res.json({ error: e.message });
  }
});

// ── REVOKE LICENSE ────────────────────────────────────────────────────────────
router.post('/license/:id/revoke', express.json(), (req, res) => {
  const updated = db.updateLicense(req.params.id, { status: 'revoked' });
  updated ? res.json({ success: true }) : res.json({ error: 'Not found' });
});

// ── EXTEND LICENSE ────────────────────────────────────────────────────────────
router.post('/license/:id/extend', express.json(), (req, res) => {
  const { days } = req.body;
  const license  = db.getLicenseById(req.params.id);
  if (!license) return res.json({ error: 'Not found' });

  const base      = new Date(license.expiresAt) > new Date() ? new Date(license.expiresAt) : new Date();
  const newExpiry = new Date(base);
  newExpiry.setDate(newExpiry.getDate() + parseInt(days));
  const expiresAt = newExpiry.toISOString().split('T')[0];
  const updated   = db.updateLicense(req.params.id, { expiresAt, status: 'active' });
  updated ? res.json({ success: true, expiresAt }) : res.json({ error: 'Not found' });
});

// ── DELETE LICENSE ────────────────────────────────────────────────────────────
router.post('/license/:id/delete', express.json(), (req, res) => {
  db.deleteLicense(req.params.id) ? res.json({ success: true }) : res.json({ error: 'Not found' });
});

// ── CHANGE ADMIN PASSWORD ─────────────────────────────────────────────────────
router.post('/change-password', express.json(), (req, res) => {
  const { current, newPass } = req.body;
  const admin = db.readAdmin();
  if (!bcrypt.compareSync(current, admin.password)) return res.json({ error: 'Current password wrong' });
  db.writeAdmin({ ...admin, password: bcrypt.hashSync(newPass, 10) });
  res.json({ success: true });
});

module.exports = router;
