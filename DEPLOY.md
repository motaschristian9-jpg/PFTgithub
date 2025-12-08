# Deployment Guide

This guide covers how to deploy the **PFTMoneyTracker** project. The project consists of two parts:
1.  **Backend**: Laravel API (Recommended: Railway, Heroku, or DigitalOcean App Platform)
2.  **Frontend**: React App (Recommended: Vercel, Netlify, or Cloudflare Pages)

---

## 1. Backend Deployment (Laravel)

We recommend using a PaaS like **Railway** or **Heroku** for the easiest setup.

### Prerequisites
- A GitHub repository containing the project (or just the `PFTbackend` folder if you prefer monorepo support).
- An account on Railway or Heroku.

### Steps (Example: Railway)

1.  **Connect GitHub**: Create a new project on Railway and deploy from your GitHub repo.
2.  **Root Directory**: If your repo contains both frontend and backend, set the **Root Directory** in Railway settings to `PFTbackend`.
3.  **Environment Variables**:
    Add the following variables in the Railway dashboard:
    -   `APP_NAME`: `PFTMoneyTracker`
    -   `APP_ENV`: `production`
    -   `APP_KEY`: Generate one using `php artisan key:generate --show` locally and copy it.
    -   `APP_DEBUG`: `false`
    -   `APP_URL`: The URL provided by Railway (e.g., `https://web-production-xxxx.up.railway.app`)
    -   `FRONTEND_URL`: The URL of your deployed Frontend (you can add this later).
    -   `DB_CONNECTION`: `mysql` (or `pgsql`)
    -   **Database Config**: Railway often provides a provisioning service. If you add a MySQL plugin in Railway, it will automatically inject `DATABASE_URL` or `MYSQL_...` variables. You might need to map them to Laravel's expected `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
4.  **Build Command**: Railway usually detects Laravel, but ensure the build command installs dependencies:
    ```bash
    composer install --no-dev --optimize-autoloader
    ```
5.  **Start Command**: The project includes a `Procfile` which should automatically tell the platform to run:
    ```bash
    vendor/bin/heroku-php-apache2 public/
    ```
6.  **Migrations**: Once deployed, go to the Railway CLI or use the "Deploy Command" feature to run:
    ```bash
    php artisan migrate --force
    ```

---

## 2. Frontend Deployment (React)

We recommend **Vercel** or **Netlify**.

### Steps (Example: Vercel)

1.  **Import Project**: Go to Vercel and import your GitHub repository.
2.  **Root Directory**: Select `PFTfrontend` as the root directory.
3.  **Build Settings**: Vercel should auto-detect Vite.
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
4.  **Environment Variables**:
    -   `VITE_API_BASE_URL`: The URL of your deployed Backend (e.g., `https://web-production-xxxx.up.railway.app/api`).
        *Note: You might need to update your frontend code to use this variable if it's currently hardcoded.*

### update Frontend Code for API URL
Ensure your Axios setup in the frontend uses the environment variable.
Create or update `.env` in `PFTfrontend` (for local dev) and ensure your code reads it.

**Example `src/api/axios.js` or similar:**
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default api;
```

---

## 3. Final Connection

1.  **Backend**: Go back to your Backend environment variables. Update `FRONTEND_URL` with the actual URL from Vercel (e.g., `https://pft-money-tracker.vercel.app`).
2.  **Test**: Open your Vercel app URL. It should now communicate with your Railway backend.
