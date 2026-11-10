# MoveSmart — Backend Cloud Hosting Setup
## Deploying Java 21 & Spring Boot 4 REST API to Cloud Providers

---

### 1. Backend Architecture

- **Runtime:** Java JDK 21+
- **Framework:** Spring Boot 4.1.2 (Spring Security, Spring Data JPA, Hibernate ORM)
- **Database:** PostgreSQL (Production) / H2 (Development & Testing)
- **Packaging:** Standalone Executable Fat JAR (`movesmart-backend-0.0.1-SNAPSHOT.jar`)
- **Containerization:** Ready for Docker containerization or native cloud runtime.

---

### 2. Hosting Options Comparison

| Provider | Complexity | Pricing | Persistent Disk | Recommended For |
| :--- | :---: | :---: | :---: | :--- |
| **Render** | Low | Free / \$7/mo | Yes (Render Disks) | Best overall balance of simplicity, free tier, and persistent storage. |
| **Railway** | Very Low | \$5/mo usage | Yes (Railway Volumes) | Fastest zero-config setup with native PostgreSQL plugin. |
| **AWS ECS / App Runner** | Medium | Pay-per-use | S3 Integration | Enterprise scale with automated autoscaling. |
| **Ubuntu Linux VPS** | Medium | \$4–\$6/mo (Hetzner/DO) | Yes (Local NVMe) | Full control with self-managed systemd service and Nginx. |

---

### 3. Deploying to Render (Recommended Option)

#### Step 1: Create a New Web Service
1. Sign up or log in at [render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository.

#### Step 2: Configure Service Settings
- **Name:** `movesmart-backend`
- **Region:** Singapore / Mumbai (lowest MMR latency)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** **Java** (or **Docker**)
- **Build Command:**
  ```bash
  mvn clean package -DskipTests
  ```
- **Start Command:**
  ```bash
  java -jar target/movesmart-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
  ```
- **Instance Type:** Starter (512MB–1GB RAM recommended for JVM heap)

#### Step 3: Configure Environment Variables in Render Dashboard
Add the following under **Environment**:

```env
SPRING_PROFILES_ACTIVE=prod
PORT=8080
DATABASE_URL=jdbc:postgresql://<your-db-host>:5432/movesmart_db?sslmode=require
DATABASE_USERNAME=movesmart_user
DATABASE_PASSWORD=your_secure_db_password
JWT_SECRET=ReplaceWithYourGeneratedHMAC256SecretKeyAtLeast32Chars!
INITIAL_ADMIN_EMAIL=admin@movesmart.city
INITIAL_ADMIN_PASSWORD=YourSecureAdminPassword2026!
CORS_ALLOWED_ORIGINS=https://movesmart.vercel.app,https://*.vercel.app
UPLOAD_DIR=/var/data/uploads
SEEDING_ENABLED=false
DEMO_RESET_ENABLED=false
```

#### Step 4: Add Persistent Storage Disk (For Road Evidence Photos)
1. In Render Web Service settings, navigate to **Disks**.
2. Click **Add Disk**:
   - **Name:** `movesmart-evidence`
   - **Mount Path:** `/var/data/uploads`
   - **Size:** 1 GB (expands as needed)
3. Ensure `UPLOAD_DIR=/var/data/uploads` matches the mount path.

---

### 4. Deploying to Railway (Zero-Config Alternative)

1. Log in at [railway.app](https://railway.app).
2. Click **New Project** &rarr; **Deploy from GitHub repo** &rarr; select `smart-mobility`.
3. In service settings, set **Root Directory** to `/backend`.
4. Railway will automatically detect Maven and build the Spring Boot project.
5. In **Variables**, add the same production environment variables listed above.
6. Under **Volumes**, click **Add Volume** and mount `/app/uploads` to preserve photo uploads.
7. Click **Generate Domain** to get your public HTTPS URL (e.g., `https://movesmart-backend.up.railway.app`).

---

### 5. Multi-Stage Dockerfile (For Container Platforms)

If deploying to AWS ECS, Google Cloud Run, DigitalOcean App Platform, or Kubernetes, save the following as `backend/Dockerfile`:

```dockerfile
# Multi-stage Docker build for MoveSmart Spring Boot REST API

FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Install Maven
RUN apk add --no-cache maven

# Copy Maven project files
COPY pom.xml .
COPY src ./src

# Build Spring Boot application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root security user and prepare upload storage directory
RUN addgroup -S movesmart && adduser -S movesmart -G movesmart \
    && mkdir -p /app/uploads \
    && chown -R movesmart:movesmart /app

# Copy compiled JAR
COPY --from=builder --chown=movesmart:movesmart /build/target/*.jar app.jar

# Runtime configuration
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

USER movesmart:movesmart

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar app.jar --server.port=${PORT:-8080}"]
```

---

### 6. Health & Readiness Verification

Once deployed, verify backend connectivity using curl or browser:

```bash
curl -X GET https://<your-backend-domain>/api/health
```

Expected JSON response:
```json
{
  "database": "Connected",
  "service": "MoveSmart Urban Mobility API",
  "version": "1.0.0",
  "status": "UP",
  "timestamp": "2026-11-10T19:00:00Z"
}
```
