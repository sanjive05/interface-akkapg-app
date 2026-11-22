# Existing rent-sheet data import

The application package now includes preloaded Excel workbooks under `pg-management-backend/data/akka-pg/` and `pg-management-backend/data/subash-pg/`.

## Imported data
- AKKA PG: 69 active tenants from November 2026, 23 rooms, monthly bill history from June 2025 through November 2026.
- SUBASH PG: 75 active tenants from November 2026, 15 rooms, monthly bill history from July 2025 through November 2026.
- Historical tenant profiles are also retained and marked `VACATED` when they do not appear as a room-assigned tenant in November 2026.
- Room IDs are linked to the room numbers in the source sheets.
- Phone numbers are stored as text to preserve their digits.
- Monthly rent, food, per-tenant electricity, pending balance, total and received amounts are imported. UPI/Cash splits are used where available.
- Rows with room/rent but no tenant name are retained as `Unassigned slot` bills. Food-only rows with no room are also retained as separate bills.
- See `MIGRATION-REPORT.xlsx` for monthly counts, totals, unresolved phone numbers, duplicate rows and assumptions.

## Important source-data limitations
- Advance amounts/advance received were not in either workbook. Both advance fields start at ₹0; enter verified advance details manually.
- The sheets do not provide verified joining/vacating dates, age, gender, email, address, emergency contact or bed number. Unknown fields remain blank. The app-required joining date is initialized to the first day of the earliest month found for that tenant and is explicitly noted as approximate.
- Historical EB values are already per-tenant charges. Meter readings and room totals are not present, so no historical meter readings were invented. Use the Electricity readings page for future room-level readings.
- Where a payment date was not supplied, the imported payment date is the last day of that billing month and the note identifies it as a placeholder.
- A small number of historic phone values are missing or ambiguous. Those profile phone fields remain blank; no numbers were fabricated.
- The AKKA PG November 2026 bottom TOTAL row differs from the itemized rows. The application imports itemized rows, and the report shows both figures. Verify the original sheet before relying on the AKKA November aggregate as an accounting close.
- Some repeated same-person/same-room/same-month lines appeared to be duplicate or residual-balance lines. These were consolidated; see the Duplicate review sheet.

## First run
1. Extract this project into a new folder.
2. Keep the included `pg-management-backend/data/` folder intact.
3. Start the backend from `pg-management-backend` with `mvn spring-boot:run`.
4. Start the frontend from `pg-management-frontend` with `npm install` and `npm run dev`.
5. Sign in using the configured admin credentials. By default, the backend bootstrap uses username `admin` and password `ChangeMe123!` unless environment variables override them.
6. Choose AKKA PG or SUBASH PG in the top bar. The two properties have separate tenants, rooms, bills and payments.

If you already have a `pg-management-backend/data/` folder from an earlier run, back it up before replacing it with this imported data. Do not merge old and imported workbooks by hand.
