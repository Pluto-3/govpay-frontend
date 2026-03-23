# GovPay Frontend

The citizen-facing web application for the GovPay digital wallet and government payment platform.

Built with React 18, Vite 5, Tailwind CSS 3, and Axios. Connects to the [GovPay Backend](https://github.com/<your-username>/govpay-backend) REST API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| HTTP | Axios with JWT interceptor + auto token refresh |
| Routing | React Router v6 |
| State | React Context API (AuthContext) |

---

## Getting Started

### Prerequisites
- Node.js v20.18+
- GovPay backend running on `localhost:8080`

### Install & Run

```bash
git clone https://github.com/<your-username>/govpay-frontend.git
cd govpay-frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. The Vite dev server proxies all `/api/*` requests to `http://localhost:8080` — no CORS configuration needed in development.

### Production Build

```bash
npm run build
```

Output in `dist/`. Point your web server at `dist/index.html`.

---

## Project Structure

```
src/
├── api/
│   └── axios.js                 ← Axios instance, JWT interceptor, auto token refresh
├── context/
│   └── AuthContext.jsx          ← Global auth state (user, login, register, logout)
├── components/
│   ├── ProtectedRoute.jsx       ← Route guard for auth and admin access
│   ├── Sidebar.jsx              ← Navigation sidebar (user and admin variants)
│   ├── WalletCard.jsx           ← Balance display with top-up and transfer actions
│   ├── TopUpModal.jsx           ← Top-up form with quick amount buttons
│   ├── TransferModal.jsx        ← P2P transfer form
│   └── TransactionList.jsx      ← Paginated transaction history
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx            ← Wallet dashboard
│   ├── Bills.jsx                ← Utility billing
│   ├── Kyc.jsx                  ← KYC submission and status
│   └── admin/
│       ├── AdminDashboard.jsx   ← Platform stats
│       ├── AdminUsers.jsx       ← User management
│       ├── AdminKyc.jsx         ← KYC review queue
│       └── AdminTransactions.jsx ← Transaction report
└── App.jsx                      ← Router and route definitions
```

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/dashboard` | Auth | Wallet dashboard |
| `/bills` | Auth | Utility bill payments |
| `/kyc` | Auth | Identity verification |
| `/admin` | Admin | Platform stats dashboard |
| `/admin/users` | Admin | User management |
| `/admin/kyc` | Admin | KYC review queue |
| `/admin/transactions` | Admin | Transaction report |

---

## Key Design Decisions

**Token auto-refresh** — the Axios response interceptor catches 401s, silently refreshes the token pair, and retries the original request. Users are never interrupted unless the refresh token is also expired.

**Amount handling** — all monetary values are sent to the API as integers (smallest currency unit × 100). The frontend converts on both ends: `Math.round(parseFloat(amount) * 100)` before sending, `toLocaleString` for display.

**Wallet auto-creation** — the Dashboard calls `POST /wallet` automatically if `GET /wallet` returns 404. Users never need a manual wallet creation step.

**Status-aware KYC page** — the KYC page renders completely different UI depending on the user's `kycStatus` (PENDING, SUBMITTED, APPROVED, REJECTED) rather than using conditional fragments throughout.

---

## Related Repositories

- **Backend:** [govpay-backend](https://github.com/<your-username>/govpay-backend) — Spring Boot 3.2, Java 17, PostgreSQL
