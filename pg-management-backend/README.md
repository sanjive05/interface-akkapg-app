# PG Management System — Phase 1 + Phase 2

## Requirements
- JDK 17
- Maven 3.9+
- Node.js 20.19+ or 22.12+
- npm

## Backend setup
```bash
cd pg-management-backend
```

Set a strong initial admin password before the first run.

PowerShell:
```powershell
$env:PG_ADMIN_USERNAME="admin"
$env:PG_ADMIN_PASSWORD="Choose-A-Strong-Password-Here"
mvn spring-boot:run
```

macOS/Linux:
```bash
export PG_ADMIN_USERNAME=admin
export PG_ADMIN_PASSWORD='Choose-A-Strong-Password-Here'
mvn spring-boot:run
```

The first run creates Excel workbooks in `pg-management-backend/data/`. If `users.xlsx` is empty, it creates one ADMIN account and stores a BCrypt password hash. Bootstrap credentials are only used when the Users sheet is empty.

If you already ran Phase 1, the existing `users.xlsx` will be empty, so the bootstrap admin is created. If you have already created a user row, no default user is added.

## Frontend setup
```bash
cd ../pg-management-frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## API
- `GET http://localhost:8080/api/health` — public health check
- `POST http://localhost:8080/api/auth/login` — public login
- `GET http://localhost:8080/api/auth/me` — requires `Authorization: Bearer <token>`

Example login body:
```json
{ "username": "admin", "password": "your-initial-password" }
```

## Security notes
- Passwords are stored as BCrypt hashes in `users.xlsx`, never as plain text.
- API authentication uses signed JWT bearer tokens; default expiry is 8 hours.
- Frontend stores the token in sessionStorage (cleared when the browser tab/session ends).
- The app is intended for one local PC and one application process. Do not expose it directly to the public internet.
- The default JWT secret is a development-only value. Set `PG_JWT_SECRET` to a private Base64-encoded secret of at least 32 bytes before using real tenant data.
- If the initial admin password is set through environment variables, keep it private. To reset a forgotten password, use a future admin password-reset workflow rather than editing the hash manually.


## Phase 3 — Tenant APIs (JWT protected)

- `GET /api/tenants?search=&status=ALL`
- `GET /api/tenants/{tenantId}`
- `POST /api/tenants`
- `PUT /api/tenants/{tenantId}`
- `PATCH /api/tenants/{tenantId}/vacate?date=2026-11-10`

Tenant status values: `ACTIVE`, `VACATED`. There is intentionally no delete endpoint: vacating a tenant preserves the record and protects future billing/payment history.

New tenants are assigned IDs such as `TEN-000001`. Duplicate phone numbers are rejected. All writes go through the Excel storage service and trigger a workbook backup before replacement.


## Multi-PG workspaces and billing updates
Select AKKA PG or SUBASH PG in the React top bar. Requests include `X-PG-CODE`; tenant, room, bill, payment, electricity reading and settings workbooks are isolated by workspace. The admin login workbook remains shared.

Monthly food amount is stored per tenant. Advance amount and advance received are stored on the tenant profile and are not mixed into monthly rent bills. Electricity readings are room/month scoped and split equally among tenants staying in that room during the selected month.

The WhatsApp report export creates the exact seven columns and second-row header layout expected by the linked Selenium script (`pandas.read_excel(..., header=1)`).
