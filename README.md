# Energy B2B Portal (MERN)

B2B energy and utilities portal for wholesale energy trading, customer self-service (usage, billing, service requests), and grid integration foundations:

- **backend/**: Node/Express API + MongoDB + JWT (access) + refresh token rotation + MFA (email OTP) + RBAC + Socket.io. Energy domain: service points, usage readings, tariffs, multi-service bills, trading contracts, market bids, grid status, audit logs, anomaly detection.
- **frontend/**: React dashboards (Portal for clients; Operations for admin/personnel) with role-based routing, usage charts (Recharts), and real-time updates.

## Quick start (dev)

### 1) Backend env

Copy and edit:

```bash
cp backend/.env.example backend/.env
```

Required:
- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `ERP_SYNC_KEY`

### 2) Install + run

```bash
npm run dev
```

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

### 3) Seed sample data (optional)

From the project root:

```bash
cd backend && npm run seed
```

Creates sample users, service points (power/gas/water), tariffs, usage readings, bills, trade contracts, market bids, grid snapshots, and audit logs. All seed users use password: **Password123!** — see `backend/scripts/README.md` for accounts.

## Documentation

- **Protocol integration**: [docs/protocol-integration.md](docs/protocol-integration.md) — Modbus TCP, IEC 60870, DNP3; gateways push data via HTTP/WebSockets; environmental specs (-10°C to 75°C, NEMA/UL) apply to field devices, not the app server.
- **RFP template**: [docs/rfp-template.md](docs/rfp-template.md) — Company background, scope, technical requirements, security/compliance, timelines, evaluation criteria.

## Security and compliance

- HTTPS and secure cookies for auth; no PAN/card storage (use payment tokens + last4 only). PII and billing access are audited.
- RBAC: client (portal), admin/personnel (operations, trading, billing, anomalies). Anomaly scan: `POST /api/v1/security/anomalies/scan` (admin/personnel).

## Notes

- Admin MFA is enabled by default (email OTP). If SMTP is not configured, the OTP is logged in the backend console.
- First admin can be created via `POST /auth/register` only when `ALLOW_ADMIN_BOOTSTRAP=true` and no admin exists yet.
