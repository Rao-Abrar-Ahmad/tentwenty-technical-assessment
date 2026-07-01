# ADR 0002: Timesheet documents are created eagerly on "Create" click

## Status
Accepted

## Context
A week with no logged hours ("Missing") has no natural MongoDB document. Two options were considered for the detail page route `/timesheets/[id]`:
1. Generate Missing weeks on-the-fly for display using a computed id (e.g. `2026-W04`), and only persist a real document once the first Entry is saved.
2. Create a real (empty) Timesheet document — `{ entries: [] }` — the moment the user clicks "Create," and route to its detail page using the real Mongo `_id` immediately.

## Decision
Option 2. Clicking "Create" issues `POST /api/timesheets` which inserts an empty-Entries document and returns its `_id`; the app then navigates to `/timesheets/[id]`.

## Consequences
- Routing is uniform — `[id]` is always a real Mongo `_id`, no special-casing a computed week-string id for not-yet-created weeks.
- A week can have a real document with 0 Entries. This is expected and still correctly shows Status "Missing" (see ADR 0001 — Status is computed from Entries, not document existence).
- The Action button label on the Timesheets table depends on *both* document existence and Status (Create / Update / View), not Status alone — see CONTEXT.md "Row Action."
- Trade-off accepted: a user can click "Create" and abandon the page, leaving an empty document behind. This is harmless (it just displays as "Missing," same as if it never existed) but does mean orphaned empty documents accumulate in the collection over time.
