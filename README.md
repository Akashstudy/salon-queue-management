# Salon Queue Management System

## 🚀 Live Application
[Open Salon Queue Management](https://salon-queue-management-seven.vercel.app/)

## GitHub Repository
[View Source Code](https://github.com/Akashstudy/salon-queue-management)

## Backend Health Check
[Check Backend Status](https://salon-queue-management-6ex5.onrender.com/api/health)

---

A full-stack queue management platform designed for walk-in salons and barbershops. Customers join the line right from their mobile browser, track their spot and estimated wait time live, and receive an instant alert when a chair opens up. Salon staff—including receptionists, barbers, and the shop owner—manage the floor through dedicated, role-specific interfaces, while a waiting-room TV display keeps everyone in the lounge informed. The entire system supports both English and Gujarati (ગુજરાતી) and keeps all connected devices synchronized in real time via lightweight background polling.

> Developed as part of the MSc IT lab curriculum. The project followed a specification-first approach: requirements, screen wireframes, and business logic were documented first (`docs/`, `AGENTS.md`) before implementing each module step by step with an AI coding assistant. See [How it was built](#how-it-was-built-phase-by-phase).

## Quick tour

| Screen | URL | Who | PIN |
|---|---|---|---|
| Home | `/` | Customer (salon overview & queue status) | no |
| Join queue | `/join` | Customer (self-service registration) | no |
| My status | `/status/S-1` | Customer (personal live tracking) | no |
| Reception dashboard | `/reception` | Receptionist (walk-ins, queue management) | yes |
| Barber view | `/barber/ravi`, `/barber/amit`, `/barber/imran` | Barber (station controls on phone) | yes |
| Waiting-area TV | `/display` | Waiting lounge (large screen overview) | no |
| Owner settings | `/admin` | Owner (services, staff, daily stats) | yes |

To test the complete workflow in under two minutes, open `/display`, `/reception`, and one barber screen such as `/barber/ravi` in separate browser windows, then submit a new ticket through `/join` on your phone.

## User flow

**Customer**
1. Visits the homepage to view real-time salon activity: total waiting customers, estimated wait times, and the live status of each barber (available, busy with a client, or on break).
2. Clicks **Join Queue**, enters their name and a standard 10-digit mobile number, selects up to 3 services, and chooses a preferred barber (or selects "Any barber"). The interface calculates the total service time, price, and expected wait in real time.
3. Receives a unique queue token (such as **S-14**) and lands on their personal live tracking screen. This view shows their exact position in line, a dynamic wait countdown, and a "Head to salon" reminder when they reach 2nd position.
4. When a matching barber finishes their current client, the system **automatically calls** the customer. Their phone screen flashes a high-visibility alert banner (**"It's your turn! Go to Ravi"**) with device vibration, while the lobby TV highlights their token with an audible chime.
5. The assigned barber clicks **Start** when the service begins and **Done** when completed. The customer can cancel their spot at any point before service starts.

**Receptionist** registers in-person walk-ins, monitors the active waiting list (where tickets waiting longer than 60 minutes are highlighted in amber), can manually summon the next eligible customer, and handles cancellations or marks no-shows once the 10-minute grace window has passed.

**Barber** manages their individual station on their phone: sees the current client and an active service timer, clicks **Start** and **Done**, checks who is next in line, and toggles their break status (disabled while a customer is actively in the chair).

**Owner** controls daily salon settings: toggles online queue joining on or off, creates or edits services (with bilingual names, duration, pricing, and active status), selects which barbers are on shift today, and reviews daily summary analytics (total clients served, average wait duration, and recorded no-shows).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router 7 |
| Backend | Node.js (v20+), Express 5, `cors` |
| Storage | In-memory store (volatile runtime store; resets on server reboot) |
| Live updates | Client short polling every 3 seconds (lightweight, zero-websocket overhead) |
| Language | Custom English / Gujarati dictionary with a `useT()` hook; language preference saved in browser |
| Tests | Node built-in test runner (`node:test`), 40 unit tests validating all queue logic |
| CI/CD | GitHub Actions automated pipeline: client build, test execution, and smoke checks |
| Hosting | Vercel (frontend SPA), Render / Heroku (backend REST API) |

## Features

- **Mobile self-registration** with strict client and server validation (10-digit mobile number, minimum 2-character name, maximum 3 services) alongside live totals for service time, bill amount, and projected wait.
- **Single active ticket enforcement per phone.** Registering again with the same mobile number retrieves the current active ticket; an "I already joined" search modal lets returning customers look up their spot easily.
- **Real-time status tracking** with live queue position, animated wait countdown ring, early arrival alerts when second in line, full-screen turn summons with haptic vibration, and safe cancellation with confirmation prompts.
- **Automated dispatch (Auto-call).** The moment a barber completes their cut, the algorithm automatically pairs and calls the earliest eligible customer in line. Requests for specific barbers are strictly respected; requests for "Any barber" match the first free station. The receptionist can also call tickets manually if necessary.
- **Fair waiting-time estimation**: calculated by dividing the total service minutes ahead by the number of active barbers capable of serving that ticket, rounded up to the nearest 5-minute block.
- **No-show and cancellation lifecycle**: customers marked as no-shows after the 10-minute grace period must request a fresh token at the back of the queue if they return.
- **Staff shift and break controls**: barbers on break are removed from automatic dispatch, and customers who selected them see clear status indicators (e.g., "Ravi is on break").
- **Automated queue cutoffs**: online self-registration locks automatically 30 minutes before closing time (8:30 PM IST) or whenever the owner toggles the queue closed, while walk-ins can still be added by reception.
- **Lobby TV monitor screen** featuring high-contrast typography, an upcoming queue board showing the next 5 tokens, and an animated visual highlight with sound chime for newly called numbers. Customer names and phone numbers are kept private.
- **Owner administration controls** to manage service menus (English and Gujarati labels, durations, pricing, visibility toggles), active barber rosters, and daily operational reports.
- **Shared staff PIN security** protecting the reception desk, barber consoles, owner settings, and their corresponding REST API endpoints.
- **Bilingual interface throughout**: full English and Gujarati translations on every view, designed with a mobile-first layout and accessible 44px touch targets.

All queue management rules are documented in detail in [`docs/03-flows-rules.md`](docs/03-flows-rules.md) and enforced centrally in [`server/queueRules.js`](server/queueRules.js).

## Installation

**Prerequisites:** Node.js 20 or higher and npm.

```bash
git clone https://github.com/Akashstudy/salon-queue-management.git
cd salon-queue-management
```

**1. Backend** (terminal 1)
```bash
cd server
npm install
npm run dev          # http://localhost:4000/api/health
```

**2. Frontend** (terminal 2)
```bash
cd client
npm install
npm run dev          # http://localhost:5173
```
During local development, Vite proxies all `/api` requests directly to `http://localhost:4000`, so no initial environment configuration is needed. To target a different backend, copy `client/.env.example` to `client/.env` and update `VITE_API_URL`.

**3. Run the tests**
```bash
cd server && npm test
```

**Tip for trying it outside salon hours:** online joining locks automatically at 8:30 PM IST. You can bypass this cutoff during testing by running the server with `IGNORE_HOURS=1 npm run dev`. To test the no-show workflow immediately without waiting for the 10-minute timer, use `NOSHOW_MINUTES=0 npm run dev`.

### Environment variables

| Where | Variable | Purpose | Default |
|---|---|---|---|
| Client | `VITE_API_URL` | Base URL of the REST API (set in Vercel to point to your Render backend) | same origin / Vite dev proxy |
| Server | `PORT` | HTTP port the server listens on (injected automatically by Render/Heroku) | `4000` |
| Server | `CORS_ORIGIN` | Allowed origin(s) for CORS requests (set on Render to your Vercel URL, comma-separated or `*`) | open to all origins (`*`) |
| Server | `STAFF_PIN` | Passcode required for staff views and administrative API endpoints | `2468` |
| Server | `NOSHOW_MINUTES` | Elapsed minutes after calling before a customer can be marked as a no-show | `10` |
| Server | `IGNORE_HOURS` | Set to `1` to bypass the 8:30 PM IST queue cutoff for demos and test sessions | `1` (open 24/7 for testing) |

### Deployment and CI/CD

#### Production Deployment Guide (Render + Vercel)

##### 1. Backend Deployment (Render)
1. Sign in to [Render](https://render.com) and create a **New Web Service** connected to your repository.
2. Configure service settings:
   - **Name:** `salon-queue-backend`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** `Free`
3. Add Environment Variables under **Advanced**:
   - `NODE_VERSION` = `20`
   - `CORS_ORIGIN` = `*` (or your Vercel URL once generated)
   - `STAFF_PIN` = `2468`
   - `IGNORE_HOURS` = `1`
4. Click **Create Web Service**. Once deployed, copy your service URL (e.g., `https://salon-queue-backend.onrender.com`).
5. Verify health: visit `https://salon-queue-backend.onrender.com/api/health` to confirm `{ "ok": true }`.

*(Alternatively, use the included [`render.yaml`](render.yaml) file for one-click setup via Render Blueprints).*

##### 2. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**, selecting your repository.
2. In the project configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `client` (or leave default root, as both [`vercel.json`](vercel.json) and [`client/vercel.json`](client/vercel.json) are provided).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://your-backend-name.onrender.com` *(use your actual Render backend URL without trailing slash)*
4. Click **Deploy**. Vercel will build and assign your production domain (e.g., `https://salon-queue.vercel.app`).

##### 3. Secure CORS Origin (Optional but Recommended)
Once your Vercel domain is live, return to your Render dashboard → **Environment** → update `CORS_ORIGIN` from `*` to your exact frontend domain:
```
CORS_ORIGIN=https://salon-queue.vercel.app
```

##### 4. Storage & Database Architecture
- The system operates on a high-speed, volatile in-memory store ([`server/store.js`](server/store.js)) adhering to the project specification (queues and stats reset daily or on dyno restart).
- **No external database is required** to run or submit this project.
- *Note on Render Free Tier:* Render spins down free containers after 15 minutes of inactivity; upon spin-up, the in-memory queue cleanly resets to the initial opening state. If permanent historical storage across container sleeps is desired in future phases, a persistent disk with SQLite or a managed PostgreSQL instance can be plugged in without changing frontend contracts.

#### Automated CI/CD
The GitHub Actions workflow in `.github/workflows/ci-cd.yml` triggers on every push and pull request to `main`: it compiles the client application, executes all 40 backend unit tests, and conducts smoke tests against `/api/health`.

## How it was built (phase by phase)

The project followed a disciplined **human-in-the-loop** workflow: for each phase, the AI coding agent drafted an implementation plan, which I reviewed, refined, and approved before any code was generated. All project specifications were updated *before* writing code, and every prompt exchanged is archived in [`prompts.md`](prompts.md).

| Phase | What was done |
|---|---|
| **0. Context documents** | Drafted the core project specifications prior to writing code: `docs/01-brief.md` (project goals and out-of-scope boundaries), `docs/02-screens.md` (screen wireframes and UI components), `docs/03-flows-rules.md` (queue logic, edge cases, and test scenarios), and `AGENTS.md` (tech stack constraints and agent guidelines). The initial git commit contained solely these documents. |
| **1. Scaffold** | Initialized the React + Vite frontend and Express server, set up Tailwind styling, configured the dual-language English/Gujarati translation system, created placeholder screens for all planned routes, and configured deployment profiles for Heroku and Vercel. |
| **CI/CD** | Established the GitHub Actions automated pipeline early in the project to ensure every subsequent commit was verified and ready for deployment. |
| **2. Home + Join** | Built the initial homepage and the customer registration form with client-side validation, 3-service maximum constraints, and dynamic summary calculations using local mock data. |
| **3. Server rules + My Status** | Implemented the real backend engine: token sequence generation, phone deduplication, estimated wait time algorithms, and ticket cancellation. Connected the frontend views to live endpoints and added the My Status tracking screen with live wait countdowns and turn notification triggers. |
| **4. Staff PIN + Reception** | Added the staff PIN security barrier, reception dashboard, walk-in registration, manual customer call, and no-show processing. During review, we noted that waiting for manual reception calls left available barbers idle, so we revised the rules document and introduced **auto-call** dispatch. |
| **5. Barber view + TV** | Created mobile-optimized views for barbers with **Start** and **Done** controls and break locks (preventing breaks during active haircuts), along with the public waiting-room display featuring visual turn flashes and audio chimes. Cleared temporary test routes. |
| **6. Owner settings** | Implemented owner administrative controls for toggling queue intake, updating service offerings (pricing, duration, active status), setting barber shifts, and displaying daily performance metrics. |
| **7. Rules, edge cases, polish** | Built a mockable system clock and developed 40 automated unit tests covering all queue edge cases (cutoffs, no-show intervals, wait estimates, off-duty behavior). Conducted touch-target audits and Gujarati translation reviews, then integrated tests into CI. |
| **8. Deploy and docs** | Completed end-to-end production verification on Heroku and Vercel, resolved a CORS configuration mismatch between the frontend and backend domains, and compiled this documentation. |

### Project structure

```
├── AGENTS.md              instructions for the AI agent
├── docs/                  brief, screens, flows & rules, Gujarati label review
├── prompts.md             every prompt used, in order
├── client/                React + Vite + Tailwind app
│   └── src/ pages/ components/ i18n/ api.js usePolling.js
├── server/                Express API
│   ├── queueRules.js      ALL queue rules (one place)
│   ├── store.js           in-memory data
│   ├── index.js           routes
│   └── test/              rules tests
├── Procfile, package.json Heroku entry (starts server/)
└── .github/workflows/     CI/CD
```

## Known limitations

- Data is maintained in-memory on the server; restarting the Heroku dyno resets all active tokens, waiting lists, and daily statistics.
- Staff access is authenticated through a single shared PIN rather than individual user accounts.
- Features deliberately excluded from scope: online payment gateways, scheduled future appointments, automated SMS/WhatsApp alerts, customer loyalty systems, and multi-branch support (see `docs/01-brief.md`).
