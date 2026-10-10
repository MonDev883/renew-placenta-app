# Renew Herbal Beauty Products Since 1998

Web application and secure admin dashboard for **Renew Herbal Beauty Products (Renew Placenta)**, built for public product browsing and protected backend administration.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Security Notes](#security-notes)
- [Support & Handover](#support--handover)

---

## Features

### Public Website

- **Dynamic Product Catalog** – Responsive product listings fetched live from the backend.
- **External Checkout** – Direct links to the official **Shopee** and **Lazada** stores for secure payment.
- **Customer Inquiry Form** – Lets customers send messages and feedback directly from the site.

### Admin Panel (Restricted Access)

- **Two-Step OTP Authentication** – Login requires admin credentials plus a 6-digit code sent by email.
- **Automatic Session Expiry** – JWT tokens expire after **8 hours**, with automatic logout and redirect to the login page.
- **Catalog Management (CRUD)** – Add, edit, delete, and reorder products.
- **Cloudinary Image Hosting** – Permanent cloud storage for product photos via `multer-storage-cloudinary`.
- **Customer Messages Inbox** – Mark messages as read/unread, delete spam, and reply directly through Gmail compose links.
- **Co-Admin Management** – Authorized admins can create or delete secondary admin accounts and update passwords.

---

## Tech Stack

| Layer      | Technologies                                                   |
| ---------- | -------------------------------------------------------------- |
| Frontend   | React, React Router, Tailwind CSS, Lucide Icons                |
| Backend    | Node.js, Express.js, JWT, Bcrypt, Nodemailer, Multer           |
| Database   | MongoDB / MongoDB Atlas                                        |
| Storage    | Cloudinary (production)                                        |

---

## Project Structure

```
.
├── renew-admin-server/   # Express API, authentication, database, uploads
└── renew-admin-client/   # React frontend (public site + admin panel)
```

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended) and npm
- A MongoDB database (local or MongoDB Atlas)
- A Cloudinary account
- A Gmail account with an App Password (for OTP emails)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Backend Setup

```bash
cd renew-admin-server
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd renew-admin-client
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the **backend root** (`renew-admin-server/`):

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

| Variable                | Description                                   |
| ----------------------- | --------------------------------------------- |
| `PORT`                  | Port the API server runs on                   |
| `MONGODB_URI`           | MongoDB connection string                     |
| `JWT_SECRET`            | Secret key used to sign JWT tokens            |
| `EMAIL_USER`            | Gmail address used to send OTP codes          |
| `EMAIL_PASS`            | Gmail App Password (not your normal password) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                         |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                            |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                         |

---

## Security Notes

- **Never commit `.env` files.** Make sure `.env` is listed in `.gitignore`.
- Use a long, random value for `JWT_SECRET`.
- Rotate any credential that has been accidentally exposed.

---

## Support & Handover

For technical questions, maintenance updates, or system handoff inquiries, contact the developer:

**Raymond Cardel Mancera**
📧 [raymondmancera037.com](mailto:raymondmancera037@gmail.com)
