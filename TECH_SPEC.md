# Timesheet Management App — Technical Specification

Handoff spec for implementation by a coding agent. This document is self-contained: data model, API contract, page-by-page UI spec, and business rules are all defined below. See `CONTEXT.md` for the canonical glossary and `docs/adr/` for the reasoning behind the two non-obvious architectural decisions.

## 1. Tech Stack

- **Framework**: Next.js (latest, App Router), TypeScript
- **Auth**: NextAuth.js, Credentials provider
- **Database**: Supabase Postgres via `@supabase/supabase-js` in server-side route handlers
- **Validation**: Zod (shared schemas for API route input validation + form validation on client)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Font**: Inter
- **Deployment**: Vercel
- **Tests**: none for this build (explicitly out of scope)

### Environment variables

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=          # http://localhost:3000 in dev
```
## 2. Data Model

Run `supabase-schema.sql` before starting the app or running the seed script.

### `users` table

```ts
{
  id: uuid,
  email: string,          // unique, lowercase
  password_hash: string,  // bcrypt
  name: string,
  created_at: timestamptz
}
```

Seeded only - no signup flow. See section 7 Seed Script.

### `timesheets` table

```ts
{
  id: uuid,
  user_id: uuid,          // owner - every query is scoped to req.session.user.id
  year: number,           // e.g. 2026
  week_number: number,    // ISO week number, 1-53
  week_start: timestamptz, // Monday of that ISO week
  week_end: timestamptz,   // Friday of that ISO week
  created_at: timestamptz,
  updated_at: timestamptz
}
```

Unique constraint on `(user_id, year, week_number)` - one Timesheet per user per ISO week. This is what makes "does a row exist for this week" a simple lookup.

### `timesheet_entries` table

```ts
{
  id: uuid,
  timesheet_id: uuid,     // references timesheets.id, cascade delete
  date: timestamptz,      // must fall Mon-Fri within week_start/week_end
  project: string,        // one of the hardcoded PROJECT list
  type_of_work: string,   // one of the hardcoded TYPE_OF_WORK list
  task_description: string,
  hours_worked: number    // > 0
}
```

API responses map Supabase snake_case columns back to the existing camelCase UI contract, including `_id` for `timesheet.id` and entry ids.
### Hardcoded lists (used in Add/Edit Entry form dropdowns)

```ts
export const PROJECTS = [
  'Internal Tools',
  'Client Website Redesign',
  'Mobile App',
  'Marketing Site',
];

export const TYPES_OF_WORK = [
  'Development',
  'Design',
  'Meeting',
  'Code Review',
  'QA/Testing',
];
```

### Zod schemas

```ts
export const entryInputSchema = z.object({
  date: z.coerce.date(),
  project: z.enum(PROJECTS as [string, ...string[]]),
  typeOfWork: z.enum(TYPES_OF_WORK as [string, ...string[]]),
  taskDescription: z.string().min(1, 'Task description is required'),
  hoursWorked: z.number().positive('Hours must be greater than 0'),
});

export const createTimesheetSchema = z.object({
  year: z.number(),
  weekNumber: z.number().min(1).max(53),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

## 3. Business Rules (glossary — see `CONTEXT.md` for full definitions)

- **Week** = Monday–Friday only. No weekend data anywhere.
- **Week #** = ISO calendar week number, scoped per year.
- **Status**: Missing (0 entries) / Incomplete (>0 and <40 hrs) / Completed (≥40 hrs) — always computed, never stored.
- **Row Action** (Timesheets table) — depends on document existence AND Status:
  - No document for that week → **Create**
  - Document exists, Status Missing or Incomplete → **Update**
  - Document exists, Status Completed → **View**
  - All three actions navigate to `/timesheets/[id]`; Create additionally performs `POST /api/timesheets` first to obtain the `id`.
- **Status sort order**: severity order Missing → Incomplete → Completed, not alphabetical.
- Empty Timesheet rows (0 entries) are valid and expected — they still display as "Missing." See ADR 0002.

## 4. API Routes (internal — all client data fetching goes through these, never direct DB/mock access from components)

All routes below (except `/api/auth/*`) require a valid NextAuth session; enforce via `middleware.ts` on `/api/timesheets/*` and page-level via NextAuth session check on `/timesheets/*`.

### `POST /api/auth/[...nextauth]` — NextAuth Credentials provider
Validates email/password against `users` collection (bcrypt compare). Returns session with `user.id`, `user.email`, `user.name`.

### `GET /api/timesheets`
List the current user's Timesheets for a given date range, generating "virtual" Missing rows for weeks with no document.

Query params:
- `from` (date, required)
- `to` (date, required)
- `status` (optional: `Missing` | `Incomplete` | `Completed`)
- `sortBy` (optional: `week` | `date` | `status`, default `week`)
- `sortDir` (optional: `asc` | `desc`, default `asc`)
- `page` (default 1)
- `pageSize` (default 5)

Logic:
1. Compute every ISO week that intersects `[from, to]`.
2. Fetch all existing Timesheet rows for this user within that week range.
3. Left-join: weeks without a matching document become virtual rows `{ id: null, weekNumber, year, weekStart, weekEnd, status: 'Missing', entries: [] }`.
4. Apply `status` filter if present.
5. Sort (status uses severity order: Missing=0, Incomplete=1, Completed=2).
6. Paginate.

Response:
```ts
{
  rows: Array<{
    id: string | null,       // null = virtual (no document yet)
    weekNumber: number,
    year: number,
    weekStart: string,
    weekEnd: string,
    status: 'Missing' | 'Incomplete' | 'Completed',
    action: 'Create' | 'Update' | 'View'
  }>,
  total: number,
  page: number,
  pageSize: number
}
```

### `POST /api/timesheets`
Body: `{ year, weekNumber }`. Computes `weekStart`/`weekEnd` server-side from ISO week (do not trust client-provided dates). Upserts — if a document already exists for `{ userId, year, weekNumber }`, return the existing one instead of erroring (defensive against double-clicks). Returns `{ id }`.

### `GET /api/timesheets/[id]`
Returns the full Timesheet row (must belong to `req.session.user.id` — 404 otherwise, not 403, to avoid leaking existence). Response includes `entries` grouped is NOT done server-side — return flat `entries` array; grouping by day happens client-side for rendering.

### `POST /api/timesheets/[id]/entries`
Body validated against `entryInputSchema`. Appends to `entries` array. Returns the updated Timesheet.

### `PUT /api/timesheets/[id]/entries/[entryId]`
Body validated against `entryInputSchema`. Replaces that entry's fields. Returns the updated Timesheet.

### `DELETE /api/timesheets/[id]/entries/[entryId]`
Removes that entry from the array. Returns the updated Timesheet.

## 5. Pages

### `/login`
Two-column layout, 50/50, full height, responsive (stacks to single column on mobile — left panel becomes a compact header banner, or hides below a certain breakpoint, form takes full width).

- **Left panel**: background `#1C64F2`, white text, centered vertically, left-aligned text block — a heading + short supporting copy introducing the app.
- **Right panel**: white background, full height.
  - Heading: "Welcome back" (left-aligned)
  - Email field
  - Password field
  - "Remember me" checkbox — **only pre-fills the email field on next visit (localStorage), does not affect session length**
  - Sign in button, background `#1A56DB`
  - Inline validation errors (Zod, via `loginSchema`) and a general error message on auth failure ("Invalid email or password")
- On success: NextAuth `signIn('credentials', { redirect: false, ... })`, then router push to `/timesheets`.

### `/timesheets` (dashboard)
Protected by middleware.

- Card, heading "Your Timesheet"
- Filter row: single date-range picker (shadcn `Calendar` range mode in a `Popover`), Status select (All / Missing / Incomplete / Completed)
- Table columns: Week #, Date, Status, Action — Week/Date/Status headers have a sort toggle icon; Status sorts by severity order
- Row rendering: `1-5 January 2026` style date range (month names spelled out on both ends when a week crosses a month boundary, e.g. `28 January – 1 February 2026`)
- Action button per row per §3 rule. Clicking:
  - **Create** → `POST /api/timesheets` → navigate to `/timesheets/[id]` with returned id
  - **Update** / **View** → navigate directly to `/timesheets/[id]` (id already known)
- Footer: rows-per-page select (5 / 10), pagination with numbered page buttons + Prev/Next

### `/timesheets/[id]`
Protected by middleware. `id` is always a real Supabase UUID (see ADR 0002).

- Card, top heading "This Week Timesheet," date range on the right (e.g. "21–26 January")
- Left side of header: progress bar showing `X/40 hours` and a percentage (e.g. "50%"), capped visually at 100% even if hours exceed 40
- Below: one block per weekday (Mon–Fri) of that week, in order
  - Left column (15–20% width): day label, e.g. "21 Jan"
  - Right column (remaining width): one row per Entry for that day — left side task description, right side hours + a project pill + 3-dot menu (Edit / Delete, Delete asks for confirmation via AlertDialog)
  - Below the entry rows for that day: a full-width light-blue "+ Add new task" button
  - Days with zero entries show only the "+ Add new task" button, no rows
- "Add new task" / Edit both open the same modal component (title changes "Add Task" / "Edit Task", pre-filled on edit):
  - Project — select + info icon (tooltip) next to the label
  - Type of Work — select + info icon (tooltip) next to the label
  - Task Description — textarea
  - Hours — quantity-selector input (− / count / +)
  - All fields required (Zod `entryInputSchema`)
  - CTAs: "Add Entry" (or "Save" on edit) and "Cancel"

## 6. Middleware

`middleware.ts` using NextAuth's `withAuth`, matcher covering `/timesheets/:path*` (pages) and `/api/timesheets/:path*` (API routes). Unauthenticated requests to page routes redirect to `/login`; to API routes return 401.

## 7. Seed Script

`scripts/seed.ts` (run via `npm run seed`), connects to Supabase using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` and:
- Inserts 1–2 mock users into `users` (bcrypt-hash a known password, log the plaintext credentials to console for local testing)
- Inserts a handful of sample Timesheet rows and `timesheet_entries` rows across recent weeks for one seeded user, covering all three Status states (one with 0 entries → Missing, one with <40 hrs → Incomplete, one with ≥40 hrs → Completed) so the dashboard has representative data on first run

## 8. Suggested Folder Structure

```
src/
  app/
    login/page.tsx
    timesheets/
      page.tsx
      [id]/page.tsx
    api/
      auth/[...nextauth]/route.ts
      timesheets/
        route.ts
        [id]/
          route.ts
          entries/
            route.ts
            [entryId]/route.ts
  components/
    login/LoginForm.tsx
    timesheets/
      TimesheetsTable.tsx
      DateRangeFilter.tsx
      StatusFilter.tsx
      PaginationControls.tsx
    timesheet-detail/
      ProgressBar.tsx
      DayEntryList.tsx
      EntryRow.tsx
      EntryFormModal.tsx
  lib/
    supabase.ts`n    supabaseMappers.ts
    auth.ts              # NextAuth config
    zodSchemas.ts
    status.ts             # getStatus(), week helpers
    constants.ts           # PROJECTS, TYPES_OF_WORK
    middleware.ts
CONTEXT.md
docs/adr/0001-computed-status.md
docs/adr/0002-eager-timesheet-creation.md
```

## 9. Reference documents

- [docs/CONTEXT.md](docs/CONTEXT.md) — canonical glossary (Timesheet, Entry, Status, Week, Row Action)
- [docs/0001-computed-status.md](docs/0001-computed-status.md) — why Status is computed, not stored
- [docs/0002-eager-timesheet-creation.md](docs/0002-eager-timesheet-creation.md) — why Timesheet docs are created eagerly on "Create" click, giving every detail-page route a real Supabase UUID

## 10. Supabase setup

Run the SQL in supabase-schema.sql in the Supabase SQL editor before running 
pm run seed. The application uses the service-role key only on the server in route handlers and the seed script; do not expose it as a NEXT_PUBLIC_ variable.


