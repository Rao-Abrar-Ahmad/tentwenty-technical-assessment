# ADR 0001: Timesheet Status is computed, not stored

## Status
Accepted

## Context
A Timesheet's Status (Missing / Incomplete / Completed) could either be stored as a field on the Timesheet document and kept in sync whenever Entries change, or computed on every read from the sum of that week's Entry hours.

## Decision
Status is never persisted. It's derived at read time:
- 0 Entries → Missing
- Entries sum to < 40 hours → Incomplete
- Entries sum to ≥ 40 hours → Completed

## Consequences
- No risk of Status drifting out of sync with its Entries (e.g. after a delete) — there's nothing to forget to update.
- Slightly more computation per read, but negligible at this scale (5 entries max per week).
- Filtering/sorting by Status in the API layer means computing it in the query or in application code post-fetch, rather than an indexed field — acceptable for this app's scale.
