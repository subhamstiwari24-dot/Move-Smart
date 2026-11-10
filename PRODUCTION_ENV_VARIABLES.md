# MoveSmart — Production Environment Variables Reference
## Comprehensive Configuration Matrix for Frontend, Backend, & Database

---

### 1. Frontend Environment Variables (Vercel)

Configure these in **Vercel Dashboard** &rarr; **Project Settings** &rarr; **Environment Variables**.

| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `https://movesmart-api.onrender.com` | Base URL of the deployed Spring Boot backend. Trailing `/api` will be handled automatically by the frontend utility. |

> [!NOTE]
> Vite only exposes environment variables prefixed with `VITE_` to the browser bundle. Never place database passwords or private API keys with a `VITE_` prefix.

---

### 2. Backend Cloud Environment Variables (Spring Boot)

Configure these in your cloud hosting provider (Render, Railway, AWS ECS, or Docker Compose).

#### Essential Server & Core Settings
| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | **Yes** | `prod` | Activates `application-prod.properties`. Enforces PostgreSQL dialect and disables test/mock seeding. |
| `PORT` | Auto | `8080` | Port on which the Spring Boot web server listens. Cloud providers like Render and Railway inject this automatically. |

#### Database Connection (PostgreSQL)
| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `jdbc:postgresql://db.xyz.supabase.co:5432/postgres?sslmode=require` | Standard JDBC connection URL for PostgreSQL. |
| `DATABASE_USERNAME` | **Yes** | `postgres` | Database user account name. |
| `DATABASE_PASSWORD` | **Yes** | `YourStrongSecretPassword2026!` | Database user password. |
| `JPA_DDL_AUTO` | Optional | `update` | Hibernate schema management strategy (`update` or `validate`). |

#### Security & Authentication
| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `JWT_SECRET` | **Yes** | `6c10e19488a1e2f7b88e1e7c5b16b2518f8e0d9b4c3e2a10` | 256-bit cryptographic signing secret for HMAC-SHA256 JWT tokens (min 32 characters). |
| `JWT_EXPIRATION_MS` | Optional | `86400000` | Token validity duration in milliseconds (default: 86,400,000 ms = 24 hours). |
| `INITIAL_ADMIN_EMAIL` | Optional | `admin@movesmart.city` | Email address for bootstrap Chief Administrator account. |
| `INITIAL_ADMIN_PASSWORD` | Optional | `StrongAdminPass2026!` | Password for bootstrap Administrator. Only used on initial blank database boot. |

#### Cross-Origin Resource Sharing (CORS)
| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `CORS_ALLOWED_ORIGINS` | **Yes** | `https://movesmart.vercel.app,https://*.vercel.app` | Comma-separated list of origin domains allowed to make cross-origin REST requests to the backend. |

#### File Evidence Storage & Seeding Safety
| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `UPLOAD_DIR` | Optional | `uploads` or `/var/data/uploads` | Path to persistent directory where uploaded road hazard photo evidence is saved. |
| `SEEDING_ENABLED` | Optional | `false` | When `false`, suppresses seeding of demo incidents into the database. |
| `DEMO_RESET_ENABLED` | Optional | `false` | When `false`, completely disables `POST /api/incidents/reset` in production to prevent data loss. |

---

### 3. Generating Cryptographic Secrets

#### Generate a Strong JWT Secret
Run in PowerShell or bash:
```bash
# Using OpenSSL (Recommended)
openssl rand -base64 48

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Generate a Strong Database / Admin Password
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

### 4. Verification Checklist Before Going Public

- [ ] `JWT_SECRET` is changed from the default development key.
- [ ] `INITIAL_ADMIN_PASSWORD` is unique, strong, and recorded securely in your team password manager.
- [ ] `CORS_ALLOWED_ORIGINS` is restricted to your production Vercel frontend URL.
- [ ] `SEEDING_ENABLED` and `DEMO_RESET_ENABLED` are both set to `false`.
- [ ] `DATABASE_URL` uses SSL encryption (`sslmode=require`).
- [ ] No `.env` files containing secrets are committed to the public Git repository.
