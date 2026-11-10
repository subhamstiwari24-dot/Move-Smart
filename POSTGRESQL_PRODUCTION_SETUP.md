# MoveSmart — PostgreSQL Production Database Setup
## Production Database Architecture, Connection Pooling, & Security

---

### 1. Database Architecture & Engine Requirements

- **Supported Database:** PostgreSQL 15, 16, 17, or 18
- **ORM / Persistence:** Spring Data JPA with Hibernate 7.4+
- **Dialect:** `org.hibernate.dialect.PostgreSQLDialect`
- **Connection Pool:** HikariCP (embedded with Spring Boot)
- **Schema Management:** `spring.jpa.hibernate.ddl-auto=update`

---

### 2. Recommended Managed PostgreSQL Providers

| Provider | Free Tier | Direct JDBC | SSL Support | Region (Lowest MMR Ping) |
| :--- | :---: | :---: | :---: | :---: |
| **Supabase** | 500 MB Free | Yes (`port 5432`) | Required (`sslmode=require`) | Singapore / Mumbai (AWS ap-south-1) |
| **Neon** | 500 MB Free | Yes | Required | Singapore / ap-southeast-1 |
| **Railway PostgreSQL** | Usage-based | Yes | Required | Asia / Europe / US |
| **AWS RDS PostgreSQL** | 12-mo Free Tier | Yes | Configurable | Asia Pacific (Mumbai) `ap-south-1` |

---

### 3. Setting Up Managed PostgreSQL (e.g. Supabase / Neon)

#### Step 1: Create a Project
1. Go to [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech) and create a new project named `movesmart-prod`.
2. Choose database region closest to Mumbai: **AWS Asia Pacific (Mumbai) `ap-south-1`** or **Singapore `ap-southeast-1`**.
3. Generate and safely record a strong database master password.

#### Step 2: Extract the JDBC Connection Details
Most cloud providers provide standard connection strings. Notice the difference:

- **URI Format (Standard Cloud):**
  `postgresql://postgres:MyPassword@db.xyz.supabase.co:5432/postgres`
- **JDBC Format (Required by Spring Boot):**
  `jdbc:postgresql://db.xyz.supabase.co:5432/postgres?sslmode=require`

#### Step 3: Configure Environment Variables
Pass these 3 variables to your backend container or hosting service:

```env
DATABASE_URL=jdbc:postgresql://db.xyz.supabase.co:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=MyStrongPassword2026!
```

---

### 4. Schema Generation & Table Structures

When `SPRING_PROFILES_ACTIVE=prod` is activated with `spring.jpa.hibernate.ddl-auto=update`, Hibernate inspects the database and automatically builds the relational schema on the initial boot without dropping any pre-existing tables:

```
┌──────────────────┐         1:N         ┌──────────────────┐
│      users       │ ──────────────────► │  notifications   │
│  (id, email,     │                     │  (id, user_id,   │
│   password_hash, │                     │   message, read) │
│   role, phone)   │                     └──────────────────┘
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐         1:N         ┌──────────────────┐
│    incidents     │ ──────────────────► │  activity_logs   │
│  (id, title,     │                     │  (id, action,    │
│   category, lat, │                     │   details, time, │
│   lng, status,   │                     │   actor_name)    │
│   tracking_id)   │                     └──────────────────┘
└──────────────────┘
```

#### Relational Entities Created:
1. `users`: Stores citizen, operations, and administrator accounts with BCrypt-hashed passwords.
2. `incidents`: Stores all road hazards, GPS coordinates, 8-status states, photos, and tracking codes.
3. `notifications`: Stores personalized in-app alerts mapped to user IDs.
4. `activity_logs`: Chronological audit trail of all administrative and status transitions.

---

### 5. Production Connection Pool Tuning (HikariCP)

`application-prod.properties` includes pre-configured connection pool parameters optimized for cloud tiers:

```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.max-lifetime=1800000
```

- **`maximum-pool-size=10`**: Prevents overwhelming free or shared PostgreSQL instances with excessive idle connections.
- **`minimum-idle=2`**: Ensures warm database connections are available for instant query execution.
- **`connection-timeout=20000`**: Fails fast (20s) if database is unreachable, avoiding indefinite HTTP hanging.

---

### 6. Automated Backup Strategy

To ensure zero civic data loss:
1. **Managed Automated Snapshots:** Ensure Point-In-Time-Recovery (PITR) or daily automated snapshots are active in your cloud database settings.
2. **Manual Schema & Data Dump Command:**
   ```bash
   pg_dump -h <host> -U <user> -d <dbname> -F c -b -v -f movesmart_backup_$(date +%Y%m%d).dump
   ```
3. **Restoration Command:**
   ```bash
   pg_restore -h <host> -U <user> -d <dbname> -v movesmart_backup_20261110.dump
   ```
