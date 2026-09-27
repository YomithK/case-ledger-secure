# Case Ledger — Frontend v1.1.0

> React-based web application for the Human Rights Case Tracking System.

**Classification: Public-SLIIT**

---

## Table of Contents

- [Live URL](#live-url)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [Application Routes](#application-routes)
- [Deployment](#deployment)

---

## Live URL

The frontend is deployed on **Vercel**.

> **App URL:** `https://case-ledger-fe.vercel.app`

---

## Tech Stack

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Framework       | React 19                        |
| Build Tool      | Vite 6                          |
| Routing         | React Router DOM v7             |
| Styling         | Tailwind CSS v4                 |
| UI Components   | shadcn/ui (Radix UI primitives) |
| Charts          | Recharts                        |
| HTTP Client     | Axios                           |
| Notifications   | Sonner v2                       |
| Form Handling   | React Hook Form + Zod           |
| Package Manager | pnpm                            |

---

## Setup Instructions

### Prerequisites

- **Node.js** v18+
- **pnpm** v10+ — install with `npm install -g pnpm`
- A running instance of the [Case Ledger Backend API](../case-ledger-be/README.md)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd case-ledger-fe
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to point to your running backend — see [Environment Variables](#environment-variables).

### 4. Start the Development Server

```bash
pnpm run dev
```

The app opens at `http://localhost:5173` by default.

### 5. Build for Production

```bash
pnpm run build
```

The production-ready output is written to the `dist/` directory.

### 6. Preview the Production Build Locally

```bash
pnpm run preview
```

---

## Environment Variables

| Variable            | Required | Description                                                            |
| ------------------- | -------- | ---------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | ✅       | Full base URL of the backend API (e.g. `http://localhost:8080/api/v1`) |

> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser bundle.

---

## Features

### Public Landing Page

A marketing-style landing page at `/` introduces the platform with a hero section, feature highlights, and call-to-action buttons directing visitors to register or log in. Accessible without authentication.

### Authentication

- **Register** — Create an account with role selection (NGO, Investigator). Role-specific fields (organisation name for NGO, NIC and date of birth for Investigators) are shown conditionally.
- **Login** — Email and password authentication. A JWT token is stored in `localStorage` and attached to every subsequent API request.
- **Logout** — Clears the token and redirects to the login page.

### Role-Based Access Control

The application enforces three roles throughout the UI:

| Role           | Access                                                                            |
| -------------- | --------------------------------------------------------------------------------- |
| `ADMIN`        | Full access — users, all cases, assignments, status updates, reports, analytics   |
| `NGO`          | Create and view own cases, assign investigators, view analytics and saved reports |
| `INVESTIGATOR` | View assigned cases, log progress updates, upload and view evidence               |

Protected routes redirect unauthenticated users to `/login`. Role-restricted routes redirect unauthorised users to `/dashboard`.

### Dashboard

An overview page displaying key metrics and charts:

- Total cases, users, investigators, NGOs, and evidence items
- Cases by status (pie chart)
- Cases by priority (pie chart)
- Monthly case submission trend (bar chart)

Accessible to **ADMIN** users. Data is fetched from the `/reports/dashboard/summary` endpoint.

### Case Management

- **Case List** — Paginated, searchable table of all cases. Supports filtering by status, priority, and category. Rows-per-page selector (10 / 25 / 50). NGO users see only their own cases; Investigators see only assigned cases; Admins see all.
- **Case Detail** — Full case information split across tabs:
  - _Details_ — case metadata, related persons, description
  - _Progress_ — chronological progress timeline
  - _Evidence_ — list of uploaded evidence files
- **Create Case** — Form for NGO users to submit a new human rights case with title, description, category, priority, incident date, location, and confidentiality level.
- **Edit Case** — Update case details. Available to Admins and assigned Investigators.
- **Assign Investigator** — Search and select an investigator to assign to a case. Available to Admins and NGOs.
- **Update Status** — Change the case status following valid workflow transitions. Available to Admins and assigned Investigators.
- **Delete Case** — Soft-archives a case with a confirmation dialog. Admin only.

### Case Progress Timeline

A chronological log of updates attached to a case. Investigators can:

- Add a new progress update with an optional status snapshot (which also updates the case status)
- Edit their own entries within a 15-minute window
- Admins can delete any entry

### Evidence Management

Per-case evidence panel listing all uploaded files with type, description, uploader, and verification status. Investigators can upload new evidence; Admins can verify or delete evidence items.

### User Management

- **User List** — Paginated table of all users. Filterable by role, status (active/inactive), and name search. Admin only.
- **User Detail** — View full profile, role badge, activity status, and associated cases.

### Reports & Analytics

A dedicated reports section (Admin and NGO) with the following pages:

| Page                         | Description                                                           |
| ---------------------------- | --------------------------------------------------------------------- |
| **Reports Dashboard**        | Entry point linking to all analytics views                            |
| **Case Analytics**           | Bar and pie charts for cases by status, priority, category, and trend |
| **Investigator Performance** | Stats for an individual investigator — cases handled, resolution rate |
| **Evidence Analytics**       | Evidence distribution by type and verification ratio                  |
| **Saved Reports**            | List of saved report snapshots with download details. Admin only.     |

### Profile Management

Users can update their name, phone number, and (for NGO accounts) organisation name. Changes are reflected immediately in the navigation header without a page reload.

### Toast Notifications

All create, update, assign, and delete operations display colour-coded toast notifications — green for success, red for errors — using Sonner.

---

## Application Routes

| Path                         | Access              | Description                        |
| ---------------------------- | ------------------- | ---------------------------------- |
| `/`                          | Public              | Landing page                       |
| `/login`                     | Public              | Login form                         |
| `/register`                  | Public              | Registration form                  |
| `/dashboard`                 | All roles           | Dashboard with metrics and charts  |
| `/cases`                     | All roles           | Case list with filters             |
| `/cases/new`                 | NGO, ADMIN          | Create a new case                  |
| `/cases/:id`                 | All roles           | Case detail with progress/evidence |
| `/cases/:id/edit`            | ADMIN, INVESTIGATOR | Edit case details                  |
| `/users`                     | ADMIN               | User list                          |
| `/users/:id`                 | ADMIN               | User detail                        |
| `/reports`                   | ADMIN, NGO          | Reports dashboard                  |
| `/reports/cases`             | ADMIN, NGO          | Case analytics charts              |
| `/reports/evidence`          | ADMIN, NGO          | Evidence analytics                 |
| `/reports/investigators/:id` | ADMIN, INVESTIGATOR | Investigator performance           |
| `/reports/saved`             | ADMIN               | Saved report snapshots             |
| `/profile`                   | All roles           | Edit own profile                   |

---

## Deployment

The frontend is deployed on **Vercel**.

### Vercel Deployment Steps

1. **Import the repository** into Vercel from the Vercel dashboard or CLI.

2. **Set the framework preset** to **Vite** (Vercel detects this automatically).

3. **Set the environment variable** under _Project Settings → Environment Variables_:

   | Variable            | Value                                                                                   |
   | ------------------- | --------------------------------------------------------------------------------------- |
   | `VITE_API_BASE_URL` | Production backend URL (e.g. `https://case-ledger-be-production.up.railway.app/api/v1`) |

4. **Set the build settings** (Vercel auto-detects from `package.json`, but verify):

   | Setting          | Value            |
   | ---------------- | ---------------- |
   | Build Command    | `pnpm run build` |
   | Output Directory | `dist`           |
   | Install Command  | `pnpm install`   |

5. **Add a `vercel.json`** in the project root to enable SPA routing (client-side routing with React Router):

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

6. **Deploy** — Vercel builds and deploys on every push to the connected branch.

7. **Verify** by visiting the live URL and confirming the landing page loads correctly.

---

## Changelog

### v1.1.0 — April 2026

**New Features**

- **Victim Role**: New victim dashboard with access to associated cases and public evidence. Victim-specific sidebar navigation and protected routes.
- **Profile Photo Upload**: Users can upload a profile photo from their profile settings. Photos are stored on Cloudinary and displayed across the app.
- **Mobile Responsive Layout**: Slide-in sidebar with hamburger menu and overlay for mobile and tablet screen sizes.
- **Victim Assignment UI**: Case detail page supports assigning a victim from registered users or inviting an unregistered user by email.
- **Report CSV Download**: Each saved report now has an individual Download CSV button. Report creation modal includes date range filters (start date / end date).
- **Email Notifications**: Visual flows reflect email triggers for investigator assignment, victim assignment, case progress updates, and victim invitations.

**Bug Fixes**

- "Assign" and "Victim" buttons in Case Detail renamed to "Assign Investigator" and "Assign Victim" for clarity.
- Assignment buttons are now hidden when the case is already resolved/closed or already has an investigator/victim assigned.
- Removed search bar from assign investigator and assign victim modals.
- Fixed dropdown data path so investigator and victim lists populate correctly from the API response.
- Removed duplicate `assignVictim` export from `case.api.js`.
- Removed top-level Download CSV button from Saved Reports page; per-report download now available on each report card.
