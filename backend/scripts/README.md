# Backend scripts

## Seed (`npm run seed`)

Seeds the database with sample data that **simulates the full end-to-end process** for the energy B2B portal.

**Requirements:** `MONGODB_URI` in `backend/.env` (same as running the API). MongoDB must be running.

**Run from project root:**

```bash
cd backend && npm run seed
```

Or from `backend/`:

```bash
npm run seed
```

### End-to-end flows to try after seeding

1. **Client:** Log in as `acme@client.com` → **Portal** → open **Service points**, **Usage** (charts and history), **Bills** (issued, paid, overdue, draft). Submit a **Service request**.
2. **Operations:** Log in as `personnel@b2b.example.com` → **Operations** → **Service points** (search), **Usage ingest** (optional), **Billing run** (run for the **current month** to create new bills from existing usage), **Anomalies** (list and run **Anomaly scan**).
3. **Trading:** **Contracts** and **Market bids** (draft/submitted); **Grid status** for dashboards.

### Sample credentials (password for all: **Password123!**)

| Role       | Email                     | Name               |
|-----------|---------------------------|--------------------|
| Admin     | admin@b2b.example.com     | System Admin       |
| Personnel | personnel@b2b.example.com | Warehouse Personnel |
| Personnel | ops@b2b.example.com       | Operations Staff   |
| Client    | acme@client.com           | Acme Corp          |
| Client    | globex@client.com         | Globex Inc         |
| Client    | initech@client.com        | Initech LLC        |
| Client    | umbrella@client.com       | Umbrella Corp      |
| Client    | wayne@client.com         | Wayne Enterprises  |
| Client    | stark@client.com         | Stark Industries   |

### What gets created

- **Users:** 1 admin, 2 personnel, 6 clients
- **Tariffs:** Standard power, gas, and water (USD)
- **Service points:** 18 (3 per client: power, gas, water) with account numbers, meter IDs, locations, grid zones
- **Usage readings:** Current month (day-by-day) + previous 3 full months per service point so **Billing run** for the current month creates new bills
- **Bills:** Past 3 months only (no bills for current month — run **Billing run** to demo e2e). Mix of **issued**, **paid**, **overdue** (Acme), and **draft** (Globex power)
- **Trade contracts:** 3 bilateral contracts (base-load, peak, renewable)
- **Market bids:** 10 day-ahead bids (ISO-NE, draft/submitted)
- **Grid status:** 72 snapshots (region, frequency, load, renewables %, alerts)
- **Device endpoints:** 3 (Modbus TCP, DNP3, IEC 60870) for protocol integration
- **Anomaly flags:** Usage spike, access, and billing overdue
- **Audit log:** portal login, service request, usage ingest, billing run, bill issued, contract signed, bid placed, anomaly scan

Re-running the seed **clears** all seeded collections and recreates the dataset.
