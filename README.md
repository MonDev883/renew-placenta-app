# Renew Herbal Beauty Products Since 1998

Website and secure admin panel for **Renew Placenta Herbal Beauty Products**. Customers browse the product catalog and buy through the official Shopee and Lazada stores. Authorized staff manage products, customer messages, admin accounts, and page text from a private admin panel.

_Last updated: October 2026_

---

## Table of Contents

- [Live Links](#live-links)
- [Features](#features)
- [Admin Roles](#admin-roles)
- [Tech Stack](#tech-stack)
- [Where Everything Runs](#where-everything-runs)
- [Project Structure](#project-structure)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Environment Variables](#environment-variables)
- [Deploying Changes](#deploying-changes)
- [Maintenance Commands](#maintenance-commands)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Support & Handover](#support--handover)

---

## Live Links

| What | Address |
| --- | --- |
| Public website | https://renew-placenta.vercel.app |
| Admin panel | https://renew-placenta.vercel.app/admin |
| API (backend) | https://renew-placenta-app.onrender.com |
| Health check | https://renew-placenta-app.onrender.com/health |

---

## Features

### Public Website

- **Product catalog** – Responsive grid with a search box and category buttons (categories come from the products).
- **Out of stock labels** – Unavailable products are labeled and their buy buttons are replaced by a notice.
- **Direct shop links** – Each product links to its official **Shopee** and **Lazada** listing, where customers pay.
- **Inquiry form** – Name, email, inquiry type (Product question, Bulk order, Distributor / export), and message.
- **Messenger button** – Opens a chat with the company's Facebook page.
- **Editable page text** – Home banner, About, contact details, business hours, service cards, testimonials, and footer notes are edited from the admin panel.
- **SEO basics** – Page title, description, Facebook/Messenger share preview, `robots.txt`, and `sitemap.xml`.

### Admin Panel (Restricted Access)

- **Two-step login** – Username and password, then a 6-digit code sent by email (valid for 10 minutes).
- **Automatic session expiry** – Sessions end after **8 hours**.
- **Forgot password** – A reset code is emailed to the address saved on the admin account.
- **Password rule** – At least 8 characters, including one special character.
- **Password reminder** – Accounts still using their original password see a reminder pop-up at login.
- **Product management** – Add, edit, delete, reorder, hide (without deleting), and mark out of stock. Photos are stored on Cloudinary.
- **Messages inbox** – Read and mark messages as read, delete them, and reply through Gmail. Bulk-order and distributor inquiries are highlighted.
- **Email alerts** – The team is emailed whenever a customer sends a message.
- **Website Content** – Owners edit the public page text.
- **Admin Accounts** – Owners create accounts, set roles, and delete accounts. Nobody can delete their own account or the last owner.
- **Activity Log** – Owners see who changed or deleted what, and when (kept for 1 year).

### Protections

- Login, code verification, password reset, and the contact form are rate-limited.
- The server checks the role on every admin request, so hiding a button is never the only protection.
- Reset codes are stored hashed, expire after 10 minutes, and allow 5 wrong guesses.

---

## Admin Roles

| Role | Can do |
| --- | --- |
| **Owner** | Everything: products, messages, admin accounts and roles, Website Content, Activity Log |
| **Editor** | Manage products, and read, reply to, and delete messages |
| **Support** | Read, mark as read, and reply to messages only |

Keep at least two Owners, so a lost password or email never locks everyone out.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express, JWT, Bcrypt, Multer, express-rate-limit |
| Database | MongoDB Atlas (Mongoose) |
| Images | Cloudinary |
| Email | Brevo (sent over its web API) |

_Nodemailer is still listed in the backend `package.json` but is no longer used. It can be removed with `npm uninstall nodemailer`._

---

## Where Everything Runs

| Service | Purpose | Account owner |
| --- | --- | --- |
| Vercel | Website (frontend) hosting | ______ |
| Render | Backend API hosting | ______ |
| MongoDB Atlas | Database | ______ |
| Cloudinary | Product photo storage | ______ |
| Brevo | Sending login codes, reset codes, and message alerts | ______ |
| GitHub | Source code (`MonDev883/renew-placenta-app`) | ______ |
| UptimeRobot | Checks the site every few minutes and keeps the free server awake | ______ |

Fill in the last column during the handover. If an account is closed or unpaid, that part of the site stops.

**Plan limits to keep in mind**

- Render's free plan puts the server to sleep when idle. The uptime monitor calling `/health` every 5 minutes prevents most slow first loads.
- Brevo's free plan has a daily email limit, which is plenty for logins and alerts.
- Check Vercel's current terms for the free plan before relying on it for a business site, since free plans may be limited to personal, non-commercial use.

---

## Project Structure

```
.
├── renew-admin-server/        # Express API
│   ├── models/                # Product, Message, Admin, ActivityLog, SiteContent
│   ├── routes/                # auth, products, messages, siteContent
│   ├── middleware/            # requireAuth, requireRole, upload (Cloudinary)
│   ├── utils/                 # mailer (Brevo), activity log, password policy
│   ├── scripts/               # backup, restore, clear-activity
│   └── server.js
└── my-react-app/              # React frontend (public site + admin panel)
    ├── public/                # favicon, share image, robots.txt, sitemap.xml
    └── src/
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js (LTS) and npm
- A MongoDB database (Atlas works for development too, ideally a separate one from production)
- Cloudinary and Brevo accounts

### 1. Clone

```bash
git clone https://github.com/MonDev883/renew-placenta-app.git
cd renew-placenta-app
```

### 2. Backend

```bash
cd renew-admin-server
npm install
# create the .env file (see Environment Variables below)
npm start
```

The API runs at http://localhost:4000. Stop it with Ctrl+C. Node does not reload changes by itself, so restart it after editing backend files.

### 3. Frontend

```bash
cd my-react-app
npm install
npm run dev
```

The site runs at http://localhost:5173.

---

## Environment Variables

### Backend (`renew-admin-server/.env`, and the Render dashboard)

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
GMAIL_USER=sender_address_verified_in_brevo
BREVO_API_KEY=your_brevo_api_key
NOTIFY_EMAIL=address1@company.com,address2@company.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# Optional: extra website addresses allowed to call the API (comma-separated)
# ALLOWED_ORIGINS=https://www.example.com
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (Render sets its own) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens. Use a long random value |
| `GMAIL_USER` | The "from" address of all emails. It must be a **verified sender** in Brevo (the name is historical) |
| `BREVO_API_KEY` | Brevo API key (not the SMTP key) |
| `NOTIFY_EMAIL` | Who receives new-message alerts. Separate several addresses with commas |
| `CLOUDINARY_*` | Cloudinary credentials for product photos |
| `ALLOWED_ORIGINS` | Optional extra website addresses allowed by CORS |

### Frontend (`my-react-app/.env`, and the Vercel dashboard)

```env
VITE_API_URL=http://localhost:4000
```

On Vercel, set `VITE_API_URL` to the Render address (no trailing slash), then redeploy, because the value is built into the site.

Commit `.env.example` files with the names above and fake values, but **never** commit real `.env` files.

---

## Deploying Changes

Pushing to the `main` branch on GitHub deploys both parts automatically:

- **Render** rebuilds the backend (root directory `renew-admin-server`, start command `npm start`).
- **Vercel** rebuilds the frontend (root directory `my-react-app`).

Before pushing:

1. In `my-react-app`, run `npm run build`. It must finish without errors, because one syntax error stops the site from publishing.
2. Run `git status` and make sure no `.env` file or `backups/` file is listed.
3. Push the backend and wait for Render to show **Live** before relying on new frontend features.

If Render shows a failed deploy, the previous version keeps running. Open the failed deploy to read the first error line.

---

## Maintenance Commands

Run these from `renew-admin-server`.

| Task | Command |
| --- | --- |
| Back up products, messages, admins (no passwords), Website Content, and the activity log | `npm run backup` |
| Restore products and messages that were deleted by mistake | `node scripts/restore.js backups/backup-YYYY-MM-DDTHH-MM-SS.json --confirm` |
| Preview clearing the activity log | `node scripts/clear-activity.js --all` |
| Clear the activity log | `node scripts/clear-activity.js --all --confirm` |
| Clear only older entries | `node scripts/clear-activity.js --before=YYYY-MM-DD --confirm` |

Notes:

- Backups are saved in `renew-admin-server/backups/` (ignored by Git). They contain customer names, emails, and messages, so keep them private and copy them to storage outside this computer.
- Restore only **adds back** missing products and messages. It never overwrites or deletes existing data, and it does not restore admin accounts or Website Content.
- Clearing the activity log removes the audit trail, so do it rarely and only with the owner's agreement.
- Schedule `npm run backup` monthly (for example with Windows Task Scheduler).

---

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Browser shows a CORS error | Add the website's exact address to `allowedOrigins` in `server.js`, or to `ALLOWED_ORIGINS` on Render, then redeploy the backend |
| Login code or alert email does not arrive | Check spam; confirm `BREVO_API_KEY` is set and `GMAIL_USER` is a verified Brevo sender; read the Render logs for the Brevo error |
| First visit is slow | The free Render server was asleep. Check that the uptime monitor is running |
| Product photo upload fails | Check the three `CLOUDINARY_*` variables on Render, and the file size |
| Refreshing `/admin` shows 404 | The frontend needs `vercel.json` with a rewrite to `index.html` |
| A new route returns 404 locally | An old backend process is still running. Stop it and start the server again |
| Products load but images are broken | Images stored with old `localhost` links must be uploaded again in Manage Products |
| An admin is locked out | Another Owner can delete and recreate the account, or use Forgot Password |

---

## Security Notes

- **Never commit `.env` files** or backup files.
- Use a long random `JWT_SECRET`, and rotate any key that was exposed (for example in a screenshot).
- Keep at least two Owner accounts.
- Give people the lowest role they need.
- The admin code is protected by two-step login, but the Admin link in the site footer is visible to everyone. Remove it from `Footer.jsx` if you prefer to share the address privately.
- Temporary passwords must be given in person or by call, never by email, and changed at first login.

---

## Support & Handover

Some of the website's wording (company history, descriptions, claims) was written from the developer's research. The company should review and approve it, and can change it from **Website Content** in the admin panel.

For technical questions, maintenance, or handover, contact the developer:

**Raymond Cardel Mancera**
[raymondmancera037@gmail.com](mailto:raymondmancera037@gmail.com)