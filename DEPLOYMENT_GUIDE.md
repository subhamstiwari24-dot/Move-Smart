# MoveSmart — Production Deployment Guide
## Complete Cloud Deployment Playbook (MMR Smart Mobility Platform)

---

### 1. Recommended Architecture Overview

MoveSmart is designed as a decoupled, cloud-ready modern civic web application:

```
                      ┌────────────────────────────────────────┐
                      │            PUBLIC INTERNET             │
                      └───────────────────┬────────────────────┘
                                          │
                    HTTPS Requests        │      Direct REST & WebSocket
               (Browser / Citizens / Ops) │     (Bearer Token Authentication)
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │        Vercel Edge Network             │
                      │   (React + TypeScript + Vite SPA)      │
                      │   Domain: https://movesmart.city       │
                      └───────────────────┬────────────────────┘
                                          │
                               API Calls  │  (CORS-enabled HTTPS)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │    Cloud Application Hosting           │
                      │     (Render / Railway / AWS ECS)       │
                      │     Java 21 + Spring Boot 4 REST API   │
                      │     Domain: https://api.movesmart.city │
                      └───┬───────────────────────────────┬────┘
                          │                               │
             Persistent   │                  JPA / JDBC   │  SSL Encrypted
           Photo Storage  │                  Connection   │  (Port 5432)
                          ▼                               ▼
       ┌────────────────────────────┐    ┌─────────────────────────────────┐
       │   Persistent Cloud Disk    │    │   Managed PostgreSQL Database   │
       │   or S3 / Cloudflare R2    │    │  (Supabase / Neon / AWS RDS)    │
       │  (Uploaded Road Evidence)  │    │ (Users, Incidents, Audit Logs)  │
       └────────────────────────────┘    └─────────────────────────────────┘
```

---

### 2. Deployment Sequence (Step-by-Step)

To ensure zero-downtime and clean dependency resolution, deploy services in the following order:

```
[ Step 1: PostgreSQL ] ──► [ Step 2: Backend API ] ──► [ Step 3: Frontend SPA ] ──► [ Step 4: Smoke Test ]
 Provision managed DB       Deploy Spring Boot           Deploy React to Vercel     Verify E2E workflows
 Obtain JDBC credentials    Configure env variables      Set VITE_API_BASE_URL      Verify RBAC & Health
```

#### Step 1: Provision Managed PostgreSQL Database
1. Provision a PostgreSQL 15+ database instance (recommended: **Supabase**, **Neon**, or **Railway**).
2. Create a dedicated database: `movesmart_db`.
3. Obtain the JDBC connection URL, username, and password.
4. *Detailed guide:* [POSTGRESQL_PRODUCTION_SETUP.md](POSTGRESQL_PRODUCTION_SETUP.md).

#### Step 2: Deploy Spring Boot Backend
1. Connect the GitHub repository to your cloud host (e.g., **Render**, **Railway**, or **AWS ECS**).
2. Configure build command: `cd backend && mvn clean package -DskipTests`.
3. Configure start command: `java -jar backend/target/movesmart-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`.
4. Set required environment variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DATABASE_URL=jdbc:postgresql://<host>:5432/<dbname>?sslmode=require`
   - `DATABASE_USERNAME=<user>`
   - `DATABASE_PASSWORD=<password>`
   - `JWT_SECRET=<32+ character strong secret>`
   - `INITIAL_ADMIN_PASSWORD=<strong initial admin password>`
   - `CORS_ALLOWED_ORIGINS=https://*.vercel.app,https://yourdomain.com`
5. Verify backend is live by calling `https://<backend-url>/api/health`.
6. *Detailed guide:* [BACKEND_HOSTING_SETUP.md](BACKEND_HOSTING_SETUP.md).

#### Step 3: Deploy Frontend to Vercel
1. Import repository into **Vercel**.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Configure Environment Variable:
   - `VITE_API_BASE_URL=https://<your-backend-host>`
6. Deploy!
7. *Detailed guide:* [VERCEL_FRONTEND_SETUP.md](VERCEL_FRONTEND_SETUP.md).

#### Step 4: Post-Deployment Smoke Test
- [ ] Open `https://<frontend-url>/` in your browser.
- [ ] Verify Mumbai map loads with priority pins.
- [ ] Check Emergency Banner displays numbers (112, 100, 1916, 108).
- [ ] Register a new Citizen account and verify instant redirect to Citizen Portal.
- [ ] Submit a test hazard complaint with a photo evidence upload.
- [ ] Verify tracking code (`MS-TRK-XXXXX`) generates properly.
- [ ] Log in as Administrator (`admin@movesmart.city` with `INITIAL_ADMIN_PASSWORD`).
- [ ] Access Operations Center, update status, and verify live audit log updates.

---

### 3. High-Availability & Disaster Recovery

1. **Database Backups:** Enable daily automated backups on your PostgreSQL provider with a minimum 7-day retention period.
2. **Persistent Storage:** Mount a persistent disk to `uploads/` on the cloud container or route uploads to an S3-compatible bucket (e.g., Cloudflare R2 / AWS S3) for scalable multi-instance setups.
3. **Health Monitoring:** Set up uptime pingers (e.g. BetterStack, UptimeRobot) against `https://<backend-url>/api/health`.
