# Tentwenty Technical Assessment

A full-stack Timesheet Management application built with Next.js, React, Supabase, and NextAuth.

## Planning & Documentation

Before starting development, I used Claude to help plan the application architecture and prepare the complete technical documentation. This planning phase took approximately **30 minutes** and helped define the data model, API structure, business rules, and implementation approach before writing code.

The complete technical specification can be found here:

- **[TECH_SPEC.md](TECH_SPEC.md)**

---

## Live Demo

**Application:** https://tentwenty-technical-assessment.vercel.app/

**Repository:** https://github.com/Rao-Abrar-Ahmad/tentwenty-technical-assessment

---

## Demo Credentials

Email:
```
user@example.com
```

Password:
```
password123
```

---

# Tech Stack

### Framework

- Next.js 16 (App Router)
- React 19
- TypeScript

### Authentication

- NextAuth (Credentials Provider)
- bcryptjs

### Database

- Supabase (PostgreSQL)
- @supabase/supabase-js

### Styling

- Tailwind CSS v4
- shadcn/ui
- Base UI
- Lucide React Icons

### Validation

- Zod

### Utilities

- date-fns
- clsx
- class-variance-authority
- tailwind-merge

### Deployment

- Vercel

---

# Project Structure

```
.
├── docs/
│   ├── ...
├── scripts/
│   └── seed.ts
├── src/
├── TECH_SPEC.md
└── README.md
```

---

# Setup Instructions

## 1. Clone the repository

```bash
git clone https://github.com/Rao-Abrar-Ahmad/tentwenty-technical-assessment.git
```

```bash
cd tentwenty-technical-assessment
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create environment variables

Create a `.env.local` file and add:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## 4. Create the database schema

Run the SQL from the provided Supabase schema in your Supabase SQL Editor.

---

## 5. Seed the database

```bash
npm run seed
```

This creates the demo user and sample timesheet data.

---

## 6. Run the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
```

Runs the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run seed
```

Seeds the Supabase database with demo data.

---

# Assumptions & Notes

- Signup functionality is intentionally omitted as per the assessment requirements.
- Authentication uses a Credentials Provider with seeded users.
- Status (`Missing`, `Incomplete`, `Completed`) is computed dynamically instead of being stored in the database.
- Only Monday–Friday are considered working days.
- One timesheet exists per user per ISO week.
- The application uses Supabase only on the server; no service-role credentials are exposed to the client.
- Documentation and architecture decisions are included in `TECH_SPEC.md` and the `docs/` directory.

---

# Time Spent

- **Planning & documentation:** ~30 minutes (using Claude to structure the application before development)
- **Development:** Approximately **8–10 hours**

This was not completed in one dedicated session. Development was spread across multiple sittings while I was also occupied with other work, so the total elapsed time was longer than the focused development time.