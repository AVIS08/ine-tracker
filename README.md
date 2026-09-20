# iNE Tracker — Real-Time E-Commerce Price & Stock Intelligence

iNE Tracker is a full-stack price monitoring and inventory intelligence platform. It tracks product prices and stock levels over time using an automated Playwright headless scraper, storing time-series metric data in Supabase (PostgreSQL) and rendering real-time price trend analytics with Recharts.

---

## Key Features

- **Automated Price & Stock Scraper**: Headless Playwright engine with sequential request throttling and exponential backoff retry mechanisms.
- **Interactive Price & Stock Analytics**: Area chart visualizer showing min, avg, and max price trends and stock history.
- **Live Scrape Audit Logs**: Transparent execution metrics recording duration, retry attempts, and detailed error trace logs per scrape job.
- **Product Discovery & Tracking**: Search live product catalogs and manage tracked items with one-click track/untrack.
- **Scheduled Monitoring Endpoint**: Protected cron endpoint (`POST /api/scrape/trigger`) for periodic execution via external cron schedulers (e.g. cron-job.org).

---

## Tech Stack

- **Frontend**: React (Vite), React Router, Recharts, CSS Variables & Glassmorphism.
- **Backend**: Node.js, Express, Playwright.
- **Database**: Supabase (PostgreSQL).
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## Getting Started Locally

### 1. Prerequisites
- Node.js (v18+ recommended)
- Supabase account & project

### 2. Database Setup
1. Create a project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in Supabase dashboard.
3. Paste and run the contents of `backend/schema.sql`.

### 3. Backend Setup
```bash
cd backend
npm install
# Create a .env file with your database credentials
node server.js
```

### 4. Frontend Setup
```bash
cd frontend
npm install
# Create a .env file
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
CRON_SECRET=your-custom-cron-secret
STORE_BASE_URL=https://demo.inelabteamdev.com
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_CRON_SECRET=your-custom-cron-secret
```
