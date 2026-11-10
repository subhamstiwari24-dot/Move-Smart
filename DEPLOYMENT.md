# MoveSmart — Production Deployment Guide

This guide details how to deploy the **MoveSmart Smart Mobility & Urban Transportation Platform** publicly to production.

---

## 1. Architecture Overview

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Leaflet (Mumbai GIS Map)
  - **Hosting Platform:** [Vercel](https://vercel.com) (Recommended) or Netlify / Cloudflare Pages
- **Backend:** Spring Boot 4 + Spring Security + JWT Authentication (HMAC-SHA256) + Spring Data JPA + BCrypt
  - **Hosting Platform:** [Render](https://render.com), [Railway](https://railway.app), or Docker Container
- **Database:** PostgreSQL (Production) / In-memory H2 with automatic zero-config fallback (Local & Dev)

---

## 2. Deploying the Frontend to Vercel

### Step 1: Connect GitHub Repository
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `smart-mobility` repository.

### Step 2: Configure Build Settings
- **Framework Preset:** Vite
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables
In the Vercel project settings, navigate to **Environment Variables** and add:
```env
VITE_API_BASE_URL=https://your-deployed-backend.onrender.com
```
*(Leave empty or set to `http://localhost:8080` during local development)*

### Step 4: Deploy
Click **Deploy**. The included `vercel.json` ensures all client-side routes rewrite properly to `index.html`.

---

## 3. Deploying the Spring Boot Backend

### Option A: Render (Web Service with Docker or Java)
1. Sign in to [Render](https://render.com).
2. Click **New +** $\to$ **Web Service**.
3. Select your repository and set the **Root Directory** to `backend`.
4. Choose **Docker** environment (it will automatically use `backend/Dockerfile`).
5. In **Environment Variables**, configure:
   ```env
   PORT=8080
   SPRING_PROFILES_ACTIVE=prod
   JWT_SECRET=YourSuperSecretKeyMustBeAtLeast32BytesLongForSecurity2026!
   DATABASE_URL=jdbc:postgresql://<host>:<port>/<dbname>
   DATABASE_USERNAME=<username>
   DATABASE_PASSWORD=<password>
   ```
6. Click **Create Web Service**.

### Option B: Railway (One-Click Container Deployment)
1. Create a new project on [Railway](https://railway.app).
2. Add a **PostgreSQL** database service.
3. Add a **GitHub Repo** service pointing to the `backend` folder.
4. Railway will automatically link the `DATABASE_URL` environment variable.
5. Set `JWT_SECRET` in service variables and deploy.

---

## 4. Pre-Configured Demonstration Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **System Admin** | `admin@movesmart.city` | `Admin@2026` | Full administrative control, system logs, configuration |
| **Operations Controller** | `ops.admin@movesmart.city` | `Operations@2026` | Incident queue management, status updates, CCTV triage |
| **Citizen Commuter** | `citizen.mumbai@movesmart.city` | `Citizen@2026` | Public hazard reporting, tracking, "My Complaints" dashboard |

*All accounts are seeded automatically on first boot via `DataSeeder.java` with BCrypt password hashing.*

---

## 5. End-to-End Verification Checklist

- [x] Citizen registration generates user with strictly `ROLE_CITIZEN`.
- [x] Reporting hazard generates non-sequential tracking ID (`MS-TRK-XXXXX`).
- [x] Interactive Mumbai Map renders all markers with severity color coding.
- [x] Operations Center access is strictly protected by JWT authentication (HTTP 401/403).
- [x] Tracking complaint by ID redacts sensitive reporter phone and email on public view.
- [x] Operations controllers can update status, internal dispatch logs, and citizen advisories.
- [x] Offline resilience: Optimistic local storage cache persists state if backend is unreachable.
