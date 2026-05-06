# 🎯 Event Volunteer Recruiter Portal (EVP)

A production-grade **MERN stack** platform for event organizers to post events, define volunteer roles with slots, and for students to browse & apply — with **real-time updates**, **waitlist auto-promotion**, **QR check-in**, **email notifications**, and **CSV export**.

Built with Node.js · Express · MongoDB · React (Vite) · Tailwind CSS · Socket.io · Framer Motion · Recharts.

---

## 🎨 Highlights

| Feature | Description |
|---|---|
| 🔐 JWT Auth | bcrypt-hashed passwords, role-based access (student/admin) |
| 📅 Event Management | Admin creates, edits, deletes events with custom banner colors |
| 🎭 Role & Slot System | **Atomic** slot reservation — overbooking is mathematically impossible |
| 📝 Apply & Confirm | Instant confirmation when slots available; auto-waitlist when full |
| ⏳ Waitlist Auto-Promote | Cancellation automatically promotes the oldest waitlisted applicant |
| 📊 Admin Analytics | Bar + pie charts (Recharts) for applications per event and popular roles |
| ⚡ Real-Time | Socket.io pushes slot updates and notifications live |
| 🔔 Notifications | In-app notification bell + optional email (Nodemailer) |
| 📥 CSV Export | Admin downloads filtered volunteer lists |
| 📱 QR Pass | Each confirmed volunteer gets a QR for event check-in |
| 🌐 Calendar View | Students see events on a month grid |
| 🎨 Modern Dark UI | Violet + amber aesthetic, glassmorphism, animated cards, Space Grotesk display font |

---

## 📁 Project Structure

```
event-volunteer-portal/
├── server/                       # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/              # User, Event, Role, Application, Notification
│   │   ├── middleware/          # auth, error handling
│   │   ├── controllers/         # auth, event, role, application, dashboard, export, notification
│   │   ├── routes/              # REST API routes
│   │   ├── utils/               # JWT signing, email
│   │   ├── sockets/             # Socket.io singleton
│   │   └── index.js             # Entry point
│   ├── scripts/seed.js          # Seed demo data
│   ├── .env                     # Environment variables
│   └── package.json
│
└── client/                       # React + Vite + Tailwind
    ├── src/
    │   ├── components/          # Navbar, EventCard, SlotBar, Modal, CalendarView, etc.
    │   ├── context/             # AuthContext, SocketContext
    │   ├── pages/
    │   │   ├── auth/            # Login, Register
    │   │   ├── student/         # Events, EventDetail, MyApplications
    │   │   ├── admin/           # AdminDashboard, AdminEvents, AdminApplications
    │   │   └── Landing.jsx
    │   ├── utils/               # api.js, format.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v18+ and npm
- **MongoDB** — either local (`mongod` running on `mongodb://127.0.0.1:27017`) OR a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string.

### 1. Install backend

```bash
cd server
npm install
```

The included `.env` already works for local MongoDB on port 27017. To use Atlas, edit `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/evp_portal
```

### 2. Seed the database (recommended)

```bash
npm run seed
```

This creates:
- 👤 **Admin:** `admin@evp.com` / `admin123`
- 👤 **Students:** `nithin@evp.com`, `priya@evp.com`, `arjun@evp.com`, `sana@evp.com` — password `student123`
- 📅 **4 events** with **10 volunteer roles** and a few sample confirmed applications

### 3. Run the backend

```bash
npm run dev     # with nodemon
# or
npm start
```

Server runs on **http://localhost:5000** (REST API + Socket.io).

### 4. Install & run frontend (in a new terminal)

```bash
cd client
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**. Vite proxies `/api` and `/socket.io` to the backend automatically.

### 5. Open http://localhost:5173

Log in with one of the demo accounts above, or click the demo buttons on the login page.

---

## 🔌 API Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Register (body: name, email, password, role) |
| POST | `/auth/login` | public | Login (body: email, password) |
| GET  | `/auth/me` | auth | Get current user |

### Events
| Method | Route | Access | Description |
|---|---|---|---|
| GET    | `/events` | public | List events (query: `q`, `from`, `to`) |
| GET    | `/events/:id` | public | Get event + roles |
| POST   | `/events` | admin | Create event |
| PUT    | `/events/:id` | admin | Update event |
| DELETE | `/events/:id` | admin | Delete event (cascades roles & applications) |

### Roles
| Method | Route | Access | Description |
|---|---|---|---|
| GET    | `/events/:eventId/roles` | public | List roles for event |
| POST   | `/events/:eventId/roles` | admin | Add role |
| PUT    | `/roles/:id` | admin | Update role (cannot reduce slots below filled) |
| DELETE | `/roles/:id` | admin | Delete role |

### Applications
| Method | Route | Access | Description |
|---|---|---|---|
| POST   | `/applications` | auth | Apply for role (body: `roleId`) — atomic, with waitlist |
| GET    | `/applications/me` | auth | My applications |
| DELETE | `/applications/:id` | auth | Cancel (auto-promotes waitlist if confirmed slot freed) |
| GET    | `/applications/:id/qr` | auth | Get QR data URL |
| POST   | `/applications/check-in` | admin | Verify QR token |
| GET    | `/events/:eventId/applications` | admin | List applications (query: `roleId`, `status`) |

### Misc
| Method | Route | Access | Description |
|---|---|---|---|
| GET    | `/dashboard/stats` | admin | Aggregated analytics |
| GET    | `/notifications` | auth | My notifications |
| PUT    | `/notifications/:id/read` | auth | Mark as read |
| PUT    | `/notifications/read-all` | auth | Mark all read |
| GET    | `/export/volunteers` | admin | CSV download (query: `eventId`, `roleId`, `status`) |

### Socket.io Events
- **Client → Server:** `event:join`, `event:leave`, `user:join`
- **Server → Client:** `role:update` (live slot count), `notification`

---

## 🔒 Security & Correctness

- **Passwords**: bcrypt with salt rounds 10; never returned from API.
- **JWT**: HS256, 7-day expiry (configurable).
- **Rate limiting**: 100 requests / 15 min on `/api/auth/*`.
- **Helmet**: standard security headers.
- **CORS**: whitelists `CLIENT_URL`.
- **No overbooking**: `Role.findOneAndUpdate({ _id, $expr: { $lt: ['$filledSlots', '$maxSlots'] } }, { $inc: { filledSlots: 1 } })` — the condition + update are one atomic MongoDB operation, so concurrent apply requests can never both succeed past capacity.
- **No duplicate applications**: unique compound index on `(userId, roleId)`.
- **Admin-only actions**: `requireRole('admin')` middleware.

---

## 📧 Email Setup (Optional)

By default, emails are logged to console (development mode). To enable real emails, edit `server/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
MAIL_FROM="EVP Portal <your@email.com>"
```

For Gmail, create an [App Password](https://myaccount.google.com/apppasswords).

---

## 🚀 Deployment

### Backend → Render

1. Push the repo to GitHub.
2. On [Render](https://render.com), **New → Web Service**, connect the repo, set root dir to `server`.
3. Build command: `npm install` · Start command: `npm start`
4. Environment variables:
   - `MONGO_URI` — MongoDB Atlas URI
   - `JWT_SECRET` — strong random string
   - `CLIENT_URL` — your Vercel URL, e.g. `https://evp-portal.vercel.app`
   - `NODE_ENV=production`
   - (Optional) `SMTP_*` vars
5. Deploy. Copy the Render URL.

### Frontend → Vercel

1. On [Vercel](https://vercel.com), **Add New → Project**, import the repo, set root dir to `client`.
2. Framework: Vite. Build command: `npm run build`. Output dir: `dist`.
3. Edit `client/vite.config.js` before deploying, OR add a production axios base URL:

   In `client/src/utils/api.js`, replace `baseURL: '/api'` with:
   ```js
   baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
   ```

   Then add env var in Vercel:
   - `VITE_API_URL` = `https://your-backend.onrender.com`

4. For Socket.io, also update the `SocketContext.jsx` client to point to your backend in production.

### MongoDB Atlas
1. Create a free M0 cluster.
2. Add your deployment platform's IP to the allow-list (or `0.0.0.0/0` for any — tighten for production).
3. Create a database user and copy the connection string into `MONGO_URI`.

---

## 🧪 Edge Cases Handled

- ✅ Cannot apply when slots full → goes to waitlist
- ✅ Cannot apply twice for the same role → 409 response
- ✅ Race-condition safe slot increment (atomic MongoDB operation)
- ✅ Cancellation of confirmed slot → auto-promotes oldest waitlisted user
- ✅ Cancellation of waitlisted or already-cancelled app handled gracefully
- ✅ Admin cannot reduce `maxSlots` below `filledSlots`
- ✅ Deleting an event cascades to its roles and applications
- ✅ Non-admin cannot hit admin routes (403)
- ✅ Expired/invalid JWT rejected (401)
- ✅ Email sending failures don't break the apply flow

---

## 🎨 UI Design Notes

- **Typography**: Space Grotesk (display) + Inter (body) + JetBrains Mono (numeric/meta).
- **Palette**: Violet (`#7c5cff`) primary, amber (`#f59e0b`) accent, deep ink (`#07070b`) base. Dominant + sharp accents, no washed-out pastels.
- **Motion**: Framer Motion page-enter staggers, SlotBar spring fill, hover lifts.
- **Aesthetic**: Refined dark with subtle noise overlay, glassmorphism cards, faint grid background, radial glow backgrounds.
- **Accessibility**: Focus rings on inputs, semantic HTML, chip badges with both color + icon.

---

## 📜 License

MIT — free for personal and commercial use.

---

Built with care for the Event Volunteer Recruiter Portal spec. 🎯
