# Performance fix notes

## Root cause found

The Excel storage layer opens and parses an XLSX workbook for every `readAll()` call. Two service methods were repeatedly calling it inside loops:

- `rooms()` called `readAll("tenants.xlsx")` once for every room (23 AKKA rooms / 15 SUBASH rooms), plus the room workbook.
- `bills()` called `readAll("payments.xlsx")` once for every bill after filtering the month. The dashboard calls this method, so dashboard latency scaled with the number of bills in the selected month.

## Changes

- Room occupancy is now calculated by reading tenants once and grouping active tenants by room ID.
- Dashboard reuses the tenant list for room occupancy.
- Bills are now enriched by reading payments once and aggregating amounts by bill ID.
- Dashboard reuses the monthly payment list while calculating bill totals.
- Dashboard now shows explicit loading text instead of displaying ₹0 while the API is still responding.
- Rooms table now shows a loading state instead of briefly saying no records.

## Expected impact

For a Rooms request, workbook reads drop from roughly 24 to 2 for AKKA (16 to 2 for SUBASH).
For dashboard, payments workbook reads drop from once per bill to once for the whole request.

## Build/test status

Source changes were reviewed. Maven is not installed in the build environment and npm dependency installation timed out, so a full backend/frontend build could not be completed here. Run `mvn -DskipTests package` in `pg-management-backend` and `npm run build` in `pg-management-frontend` on the Windows machine after extracting this update.
