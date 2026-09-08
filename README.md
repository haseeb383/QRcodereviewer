# QR Reviewer - Pre-Printed Smart Review Card System

Deployed at: **https://qr-reviewer.vercel.app**

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Initialize local database (cards.json)
npm run init-db

# Generate QR codes for local testing
BASE_URL=http://localhost:3000 npm run generate-qr

# Start local server
npm run dev
```

- Admin: http://localhost:3000/admin
- Test scan: http://localhost:3000/scan/001

## Vercel Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/qr-reviewer.git
git push -u origin main
```

### 2. Create Vercel Project
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Other** (auto-detected)
4. Build Command: `npm run build` (no-op)
5. Output Directory: `public` (not needed, handled by vercel.json)

### 3. Add Vercel KV Storage
1. In Vercel dashboard → **Storage** tab
2. Click **Create Database** → **KV (Redis)**
3. Name: `qr-reviewer-kv`
4. This auto-adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to env vars

### 4. Set Environment Variables
In Vercel → Settings → Environment Variables:
- `ADMIN_PASSWORD` — your secure admin password
- (KV vars are auto-added from step 3)

### 5. Deploy
Click **Deploy**. Vercel builds and deploys automatically.

### 6. Migrate Data (One-time)
After first deploy, run locally:
```bash
npm run migrate
```
This pushes your 100 cards from `cards.json` to Vercel KV.

## Project Structure

```
├── api/                    # Vercel Serverless Functions
│   ├── scan/[cardId].js    # Public: GET /scan/:cardId → redirect or activation page
│   ├── cards.js            # Auth: GET/POST /api/cards
│   └── cards/[cardId].js   # Auth: GET/PUT /api/cards/:cardId
├── public/                 # Static assets (served at root)
│   ├── admin.html          # Admin dashboard (served at /admin)
│   ├── style.css
│   ├── app.js
│   └── qr/                 # Pre-generated QR codes (001.png - 100.png)
├── lib/kv.js               # Vercel KV client
├── scripts/migrate-to-kv.js # One-time migration script
├── src/
│   ├── database.js         # Local JSON database init
│   ├── generate-qr.js      # QR code generator
│   └── server.js           # Local Express dev server
├── vercel.json             # Vercel routing config
└── package.json
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/scan/:cardId` | No | Customer scan → 302 redirect to Google review URL |
| GET | `/api/cards` | Yes | List all cards |
| POST | `/api/cards` | Yes | Generate batch (body: `{start, end}`) |
| GET | `/api/cards/:cardId` | Yes | Get single card |
| PUT | `/api/cards/:cardId` | Yes | Update card (client_name, destination_url, status) |

## Admin Dashboard

Access at `/admin` (or `/admin.html`). Login with `ADMIN_PASSWORD`.

Features:
- View all 100+ cards with pagination
- Search by card ID, client name, or URL
- Filter by status (active/inactive)
- Edit any card: set client name, Google review URL, activate/deactivate
- Generate new card batches

## QR Codes

Pre-generated in `public/qr/` pointing to `https://qr-reviewer.vercel.app/scan/XXX`.

To regenerate with different domain:
```bash
BASE_URL=https://your-domain.com npm run generate-qr
```

## Local Development Notes

- Uses `cards.json` file database (no external deps)
- `npm run dev` starts Express server on port 3000
- `vercel dev` runs Vercel CLI emulator (requires Vercel CLI)