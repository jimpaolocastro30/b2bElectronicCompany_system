# ERP-B2B Electronics (MERN)

Monorepo skeleton for an ERP ↔ B2B sales integration system:

- `backend/`: Node/Express API + MongoDB + JWT (access) + refresh token rotation + MFA (email OTP) + RBAC + Socket.io
- `frontend/`: React dashboards (Client/Admin/Personnel) with role-based routing and real-time updates

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

## Notes

- Admin MFA is enabled by default (email OTP). If SMTP is not configured, the OTP is logged in the backend console.
- First admin can be created via `POST /auth/register` only when `ALLOW_ADMIN_BOOTSTRAP=true` and no admin exists yet.
