# MoveSmart — Vercel Frontend Deployment Setup
## Deploying the React + TypeScript + Vite Single Page Application

---

### 1. Overview

The MoveSmart frontend is built using **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**. It deploys natively to Vercel's Edge Network with full Single Page Application (SPA) client-side routing, automated Brotli compression, and immutable asset caching.

---

### 2. Vercel Configuration File (`vercel.json`)

The project includes an optimized `vercel.json` in the root directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

#### Why This Configuration is Critical:
- **`rewrites`**: Prevents HTTP 404 errors when citizens refresh deep pages like `/track`, `/citizen`, or `/admin`. All non-asset routes are directed to `/index.html` where client-side React Router handles the route.
- **`headers`**: Enforces strict OWASP security headers (`nosniff`, `DENY` framing against clickjacking) and enables 1-year immutable caching on hashed build assets in `/assets/`.

---

### 3. Deploying via Vercel Web Dashboard (Recommended)

#### Step 1: Import Project
1. Log in to [vercel.com](https://vercel.com) using your GitHub, GitLab, or Bitbucket account.
2. Click **Add New...** &rarr; **Project**.
3. Select the `smart-mobility` repository.

#### Step 2: Configure Project Settings
- **Project Name:** `movesmart-mumbai` (or your preferred name)
- **Framework Preset:** **Vite** (automatically detected)
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Step 3: Configure Environment Variables
Expand the **Environment Variables** accordion and add:

| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://movesmart-api.onrender.com` | Target URL of your live Spring Boot backend. Do not include trailing `/api`. |

> [!IMPORTANT]
> Always set `VITE_API_BASE_URL` to your production HTTPS backend URL. The frontend utility automatically normalizes trailing slashes and routes all queries to `/api`.

#### Step 4: Click Deploy
Click **Deploy**. Vercel will clone, build with `tsc && vite build`, and publish your application in ~30 seconds.

---

### 4. Deploying via Vercel CLI (Alternative)

If deploying from the terminal:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link and deploy to production
vercel --prod
```

When prompted:
- Set up and deploy: **Yes**
- Which scope: **Your account**
- Link to existing project: **No**
- Project name: `movesmart-mumbai`
- Directory located: `./`
- Modify settings: **No**

To set the production environment variable via CLI:
```bash
vercel env add VITE_API_BASE_URL production
# Enter value: https://your-backend-domain.com
```

---

### 5. Custom Domain Configuration (Optional)

1. In the Vercel project dashboard, navigate to **Settings** &rarr; **Domains**.
2. Enter your custom domain (e.g., `movesmart.city` or `mumbai.movesmart.org`).
3. Add the DNS records provided by Vercel to your domain registrar (A record to `76.76.21.21` or CNAME to `cname.vercel-dns.com`).
4. Vercel automatically issues and renews Let's Encrypt SSL/TLS certificates.

---

### 6. Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **404 Not Found on Page Refresh** | Missing SPA rewrite rule | Verify `vercel.json` exists in project root with the `rewrites` block pointing `/(.*)` to `/index.html`. |
| **CORS Blocked Errors in Console** | Backend does not recognize Vercel origin | In backend configuration, ensure `CORS_ALLOWED_ORIGINS` includes your Vercel URL (e.g., `https://*.vercel.app` or your specific domain). |
| **Mixed Content Warning** | Frontend HTTPS calling HTTP backend | Ensure `VITE_API_BASE_URL` starts with `https://`. Modern browsers block insecure HTTP API calls from HTTPS origins. |
| **Photos Fail to Load** | Relative URL resolution issue | Verify backend serves `/uploads/**` over HTTPS and `VITE_API_BASE_URL` points to the correct backend host. |
