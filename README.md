# Timesheet Management App

Next.js App Router timesheet app using NextAuth credentials and Supabase Postgres.

## Environment

Create `.env.local` with:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Database setup

Run the SQL in `supabase-schema.sql` in the Supabase SQL editor, then seed sample data:

```bash
npm run seed
```

Seeded credentials:

```text
user@example.com / password123
user1@example.com / password123
```

## Development

```bash
npm run dev
```

Open http://localhost:3000.
