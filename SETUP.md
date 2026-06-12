# PrintShop Pro Server — Setup Guide

## Folder Structure
```
D:\Server_final\
├── server.js              # Main entry point
├── package.json           # Dependencies
├── .env.example           # Environment template
├── db.js                  # License data storage
├── licenseEngine.js       # License generation/validation
├── middleware/
│   └── auth.js            # Admin JWT auth
├── routes/
│   ├── admin.js           # /admin/* routes
│   └── api.js             # /api/* routes
└── public/                # Static frontend files
    ├── index.html         # Landing page (homepage at /)
    ├── style.css          # Shared styles
    ├── main.js            # Landing page JS
    ├── admin.html         # Admin login + dashboard (at /admin)
    └── portal.html        # Customer portal (at /api/portal)
```

## Quick Start (Local Testing)

```bash
cd D:\Server_final
npm install
copy .env.example .env       # Windows
# or:  cp .env.example .env   # Mac/Linux
npm start
```

Then open:
- **Landing page**:  http://localhost:3000/
- **Admin panel**:   http://localhost:3000/admin
- **Customer portal**: http://localhost:3000/api/portal

**Default admin login:**
- Username: `printshop`
- Password: `rp2006`

> ⚠️ **Change the password immediately** after first login using the 🔐 Password button.

## What Was Built

### Landing Page (`public/index.html`)
Modern SaaS landing page with:
- Hero, stats, features, how-it-works, dashboard showcase
- 5 pricing plans (Simple ₹2,000 / Basic ₹3,000 / Standard ₹5,000 / Pro ₹8,000 / Advance ₹10,000)
- Testimonials, FAQ, final CTA, footer
- Buy buttons → WhatsApp (edit `https://wa.me/91XXXXXXXXXX` to your number)
- Animations: particles, gradient orbs, scroll reveal, counter animations

### Admin Panel (`public/admin.html`)
Single-page admin that handles:
- **Login screen** with modern dark design
- **Dashboard** with stats (active/expired/revoked/expiring)
- **Generate license** form (shop, customer, plan, duration, custom price)
- **License list** with search, status badges, action buttons
- **Actions**: Copy key, Extend, Revoke, Delete
- **Change password** modal
- **Toast notifications** for all actions

### Customer Portal (`public/portal.html`)
Clean customer-facing page that:
- Auto-formats the license key as the user types (PSP-XXXX-XXXX-XXXX-XXXX)
- Shows license details: shop, plan, printer limit, expiry, days left
- Shows warning if expiring soon
- Get Support and Renew buttons (link to WhatsApp)
- Backed by `/api/portal/check-json` API

## API Endpoints (unchanged)

| Method | Path                              | Purpose                        | Auth |
|--------|-----------------------------------|--------------------------------|------|
| GET    | `/`                               | Landing page                   | No   |
| GET    | `/admin`                          | Admin panel                    | No*  |
| GET    | `/admin/login`                    | Admin panel                    | No   |
| POST   | `/admin/login`                    | Submit admin login             | No   |
| GET    | `/admin/logout`                   | Sign out                       | No   |
| GET    | `/admin/licenses`                 | List all licenses (JSON)       | Yes  |
| POST   | `/admin/license/create`           | Create new license             | Yes  |
| POST   | `/admin/license/:id/revoke`       | Revoke a license               | Yes  |
| POST   | `/admin/license/:id/extend`       | Extend a license               | Yes  |
| POST   | `/admin/license/:id/delete`       | Delete a license               | Yes  |
| POST   | `/admin/change-password`          | Change admin password          | Yes  |
| GET    | `/api/portal`                     | Customer portal                | No   |
| POST   | `/api/portal/check-json`          | Validate key (JSON)            | No   |
| POST   | `/api/validate`                   | Validate key (called by app)   | No   |

*The HTML page is public; JS checks auth and shows login or dashboard.

## Deployment

For production, see `SETUP_GUIDE.md` in the original server folder, or use:
```bash
# On a VPS:
pm2 start server.js --name printshoppro
pm2 save && pm2 startup
# Configure nginx + certbot for HTTPS
```

## Customisation

- **WhatsApp number**: Edit `91XXXXXXXXXX` in `public/index.html`, `public/admin.html`, and `public/portal.html` (search for `wa.me/91`)
- **Colors / branding**: Edit CSS variables in `public/style.css` (top of file, `:root { ... }`)
- **Pricing**: Edit in `licenseEngine.js` (PLANS object) and `public/index.html` (pricing cards)
- **Default admin**: Edit `db.js` (around line 14) — change the bcrypt hash and username
