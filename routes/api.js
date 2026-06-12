const express = require('express');
const path    = require('path');
const router  = express.Router();
const db      = require('../db');
const { validateLicense, refreshStatus } = require('../licenseEngine');

// Path to the static customer portal HTML page
const PORTAL_HTML = path.join(__dirname, '..', 'public', 'portal.html');

// ── VALIDATE LICENSE (called by local printshop app on startup) ───────────────
// POST /api/validate
// Body: { key: "PSP-XXXX-XXXX-XXXX-XXXX" }
router.post('/validate', express.json(), (req, res) => {
  const { key } = req.body;
  if (!key) return res.json({ valid: false, reason: 'No license key provided' });

  const license = db.getLicenseByKey(key.trim().toUpperCase());
  if (!license) return res.json({ valid: false, reason: 'License key not found. Contact support.' });

  const updated = refreshStatus(license);
  if (updated.status !== license.status) db.updateLicense(license.id, { status: updated.status });

  const result = validateLicense(updated);
  if (!result.valid) return res.json({ valid: false, reason: result.reason });

  res.json({
    valid:        true,
    shopName:     updated.shopName,
    plan:         updated.plan,
    planName:     updated.planName,
    printerLimit: updated.printerLimit === Infinity ? 999 : updated.printerLimit,
    printerLabel: updated.printerLabel,
    expiresAt:    updated.expiresAt,
    daysLeft:     result.daysLeft,
    warning:      result.warning,
  });
});

// ── CUSTOMER PORTAL — serves the static HTML page; JS does the actual check ───
router.get('/portal', (req, res) => {
  res.sendFile(PORTAL_HTML);
});

// ── JSON endpoint used by portal.html to validate a key ───────────────────────
router.post('/portal/check-json', express.json(), (req, res) => {
  const key     = (req.body.key || '').trim().toUpperCase();
  const license = db.getLicenseByKey(key);
  if (!license) return res.json({ valid: false, reason: 'License key not found.' });

  const updated = refreshStatus(license);
  const result  = validateLicense(updated);
  if (!result.valid) return res.json({ valid: false, reason: result.reason });

  res.json({ valid: true, license: { ...updated, daysLeft: result.daysLeft, warning: result.warning } });
});

module.exports = router;
