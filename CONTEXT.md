# Context: Timesheet Management App

## Terms

**Authentication**: Real credential validation via NextAuth Credentials provider against a MongoDB `users` collection (bcrypt-hashed passwords). "Dummy" refers to how accounts are provisioned (seeded via script, no self-serve signup) — not to how login is verified.

**Mock data**: Seed data written into MongoDB via a seed script, not static JSON imported directly into components. All reads happen through internal API routes.

**Timesheet**: The weekly container. One per week per user. Has a Week #, a date range, and a computed Status. A single-role, single-user-scoped entity — every user only ever sees their own Timesheets. Not pre-created for every week: a document is created the moment the user clicks "Create" on a Missing week (empty Entries array), then routed to via its real Mongo `_id`. It's valid for a Timesheet document to exist with zero Entries (still shows Status "Missing" until an Entry is added).

**Entry**: A single task logged against one day within a Timesheet. Fields: `project` (selected from a fixed project list), `typeOfWork` (selected from a fixed list), `taskDescription` (free text), `hoursWorked` (number). A single day can have multiple Entries (their hours sum for that day). Entries roll up to determine their parent Timesheet's Status.

**Status** (computed from the sum of Entry hours within a Timesheet's week, not stored as an independent field):
- **Completed** = total hours worked in the week ≥ 40
- **Incomplete** = total hours worked in the week > 0 and < 40
- **Missing** = no Entries exist for the week (0 hours)

**Row Action** (Timesheets table): a single contextual button per row, determined by whether a Timesheet document already exists for that week, combined with Status:
- No document exists → **"Create"** (creates an empty Timesheet document, then navigates to its detail page)
- Document exists, Status is Missing or Incomplete → **"Update"** (navigates to its detail page)
- Document exists, Status is Completed → **"View"** (navigates to its detail page)

**Week**: A Monday–Friday, 5-day work week. Weekends are not tracked — Entries only ever cover weekdays. This is why 40 hours (5 × 8hr) is the Completed threshold.

**Week #**: ISO calendar week number, scoped per year (e.g. Week 1 of 2026). Computed from a date, not user-relative.

**Status sort order**: Missing → Incomplete → Completed (severity order, toggleable ascending/descending), not alphabetical. Week and Date columns sort chronologically.
