# WTF Inventory — Frontend

A responsive, role-based inventory management system frontend, built for a multi-tenant SaaS backend. Owners, admins, and staff manage products, suppliers, categories, and stock transactions through a single company account, with permissions enforced per role throughout the UI.
Each company thatregisters gets its own isolated set of data (products, suppliers, categories,transactions, users) via a company_id scoping enforced on the backend. The frontend's job is to give owners, admins, and staff a single interface to:
 
  - Track what products exist, their price, cost, and current stock level
  - Record purchases, sales, and manual stock adjustments
  - Organize products by category and track which supplier provides them
  - Onboard new team members via email invitation, with role assignment
  - Manage account access (deactivation, session revocation) as the team grows
 
The frontend was built iteratively, phase by phase, directly against a live Laravel backend that was already complete and deployed before frontend work began. This meant the frontend's job was strictly to consume an existing, fixed API contract - not to design one.

**Live app:** https://inventory-frontend-mixp.onrender.com

**Backend API:** https://inventory-backend-3ktz.onrender.com (Laravel 12, deployed separately)

---
## Table of Contents

- [Features](#features)
- [User Flow / Navigation Flow](#user-flow--navigation-flow)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Routing Overview](#routing-overview)
- [Authentication](#authentication)
- [Deployment](#deployment)
---

## Features

- Email/password authentication with Sanctum token-based sessions
- Company registration (creates a company + owner account together)
- Password reset via emailed token
- Invite-based onboarding for admin/staff accounts, with role selection
- Full CRUD for Categories, Suppliers, and Products (role-restricted to owner/admin)
- Product ↔ Category ↔ Supplier relationships, shown inline on the Products list
- Stock transactions (purchase, sale, adjustment) with automatic sign handling — available to all roles
- Dashboard summary: totals, sale/cost value, units sold this/last week and month, low-stock alerts, recent activity
- User management: deactivate/reactivate accounts, revoke sessions (permission rules vary by role and target)
- Self-service "log out everywhere" (revoke own sessions)
- Role-aware in-app help modal, per page
- Light/dark theme, persisted across sessions
- Fully responsive: collapsible desktop sidebar (icon-only collapsed state), off-canvas mobile nav
- Product image thumbnails with click-to-enlarge lightbox and graceful fallback for missing/broken images


## User flow / Navigation flow

  - New user: lands on /register, creates a company + owner account in one step, is immediately logged in and redirected to /dashboard.
  - Existing user: /login, redirected to /dashboard on success.
  - Invited user: receives (or is manually given, during development, due to Resend's sandbox email restrictions) a link to /accept-invite?token=..., sets their name and password, is logged in immediately.
  - Forgotten password: /forgot-password submits an email (always returns a generic success message regardless of whether the email exists, per backend design, for security) then /reset-password?token=.. to set a
    new password.
  - Once authenticated, all navigation happens through the persistent sidebar (desktop) or the hamburger-triggered overlay sidebar (mobile). Nav items are filtered by role: Invitations and Users only appear for
    owner/admin, matching the backend's own access rules on those routes.


## Technology Stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-based `@theme`, no `tailwind.config.js`) |
| Routing | React Router v6 |
| Global state | Zustand (with `persist` middleware) |
| HTTP client | Axios (request/response interceptors) |
| Date formatting | date-fns |
| Icons | lucide-react |
| Fonts | Space Grotesk (display), Manrope (body), IBM Plex Mono (numeric data) |
| Hosting | Render Static Site |

No component library (shadcn, MUI, etc.) is used — all UI is hand-built with Tailwind utility classes against a custom design token system.

## Architecture Overview

- **API layer** (`src/api/`): one file per resource, each wrapping a typed Axios call. `client.ts` holds the shared Axios instance plus two interceptors — one attaches the bearer token to every outgoing request, the other watches for 401 responses and force-logs-out the user (except on the login endpoint itself, where a 401 just means "wrong password").
- **Auth state** (`src/store/auth.ts`): a Zustand store holding `token` and `user`, persisted to `localStorage` under the key `auth-storage`.
- **Routing** (`src/App.tsx`): every authenticated route is wrapped in `ProtectedRoute` (auth + optional role check) and `Layout` (sidebar chrome). Public auth pages use a separate `AuthLayout` wrapper.
- **Permissions** (`src/hooks/usePermission.ts`): a single hook centralizing every role-based rule (who can manage structure data, who can deactivate/reactivate/revoke which users), consumed by both pages and nav rendering.
- **Design tokens** (`src/index.css`): CSS custom properties for six semantic colors (background, surface, ink, accent, warning, danger), each with a light and dark value, mapped into Tailwind via `@theme inline`.


## Folder Structure

```
src/
├── api/            # One file per backend resource (auth, categories, suppliers,
│                   # products, transactions, users, invitations, dashboard) + client.ts
├── components/
│   ├── layout/     # Layout.tsx (authenticated shell), AuthLayout.tsx (public pages)
│   ├── ProtectedRoute.tsx
│   └── HelpModal.tsx
├── hooks/          # usePermission.ts, useDarkMode.ts
├── pages/
│   ├── auth/       # Login, Register, ForgotPassword, ResetPassword
│   ├── AcceptInvite.tsx
│   ├── Dashboard.tsx
│   ├── Categories.tsx / Suppliers.tsx / Products.tsx / Transactions.tsx
│   ├── Invitations.tsx / Users.tsx
│   └── NotFound.tsx
├── store/          # auth.ts (Zustand)
├── types/          # api.ts — all backend resource shapes
├── utils/          # errors.ts, invitationStatus.ts, pageHelp.tsx
├── App.tsx
└── index.css       # design tokens, font registration, Tailwind import
```

## Installation

```bash
git clone <repo-url>
cd inventory-frontend
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=https://inventory-backend-3ktz.onrender.com
```

## Local Development

```bash
npm run dev
```

Runs the Vite dev server, typically at `http://localhost:5173`.

## Routing Overview

| Path | Access | Notes |
|---|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/accept-invite` | Public | Redirect to `/dashboard` if already authenticated (login/register only) |
| `/` , `/dashboard` | Authenticated | Any role |
| `/categories`, `/suppliers`, `/products`, `/transactions` | Authenticated | Any role can view; create/edit/delete restricted to owner/admin (transactions: all roles) |
| `/invitations`, `/users` | Authenticated, owner/admin only | `ProtectedRoute requiredRoles={['owner','admin']}` |
| `*` | Public | 404 page |

## Authentication

Token-based via Laravel Sanctum. On login/register/accept-invite, the backend returns `{ user, token }`; both are stored in the Zustand `auth` store, which persists to `localStorage`. Every subsequent API request automatically attaches `Authorization: Bearer <token>` via an Axios request interceptor. A response interceptor watches for `401` on any endpoint other than `/login` and forces a full client-side logout + redirect, handling expired or revoked tokens without per-page error handling.

## Deployment

Hosted as a **Render Static Site**, auto-deploying from the `main` branch on push.

- **Build Command:** `npm install; npm run build`
- **Publish Directory:** `dist`
- **Environment Variable:** `VITE_API_BASE_URL` set in the Render dashboard

The backend's `config/cors.php` must include this site's exact Render URL in `allowed_origins` for API requests to succeed.

