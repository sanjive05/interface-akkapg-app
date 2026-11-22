# AKKA PG + SUBASH PG Management System

Single local admin application with two isolated PG workspaces. Choose **AKKA PG** or **SUBASH PG** from the workspace selector in the top bar. Each workspace has its own Excel files; admin login (`users.xlsx`) is shared.

## Data layout

```text
pg-management-backend/data/
  users.xlsx                 # shared admin login
  akka-pg/                   # AKKA PG workbooks
    tenants.xlsx
    rooms.xlsx
    billing.xlsx
    payments.xlsx
    electricity_readings.xlsx
    settings.xlsx
    backups/
  subash-pg/                 # SUBASH PG workbooks, separate data
    tenants.xlsx
    rooms.xlsx
    billing.xlsx
    payments.xlsx
    electricity_readings.xlsx
    settings.xlsx
    backups/
```

This package includes preloaded data from the two supplied rent workbooks. The workbooks are already placed in `data/akka-pg/` and `data/subash-pg/`. Keep these folders intact when starting the backend. See `MIGRATION-NOTES.md` and `MIGRATION-REPORT.xlsx` for import assumptions and data-quality notes.

## New tenant billing fields
- Monthly rent is separate from food.
- Food inclusion and monthly food amount are configured per tenant.
- Agreed advance and advance received are recorded separately from monthly bills.
- Advance balance = agreed advance - advance received.

## Electricity workflow
1. Create rooms and assign active tenants to rooms/beds.
2. Open Electricity readings and choose room + billing month.
3. Enter previous reading, current reading and per-unit charge.
4. Units = current - previous; room charge = units × rate.
5. Room charge is divided equally among tenants assigned to that room during the selected month. The saved share is included in each tenant's bill as a separate electricity charge.
6. Enter readings before generating bills for that month. If readings are changed after bills exist, regenerate is intentionally non-destructive; edit those existing bills or use the bill edit action to adjust electricity.

## WhatsApp Selenium script compatible export
The Reports page now has **WhatsApp script Excel**. It creates an `.xlsx` with:
- Worksheet name equal to the selected month in `YYYY-MM` format (example: `2026-11`)
- Row 1: title
- Row 2: exact headers expected by `selinium_script.py` with `header=1`: `NAME`, `PHONE NUMBER`, `RENT`, `FOOD`, `ELECTRICITY`, `PENDINGS`, `TOTAL`. `PENDINGS` includes previous balance plus any other charges less discounts so the script message total reconciles to the bill.
- Values are rounded to whole rupees because the supplied script converts these columns to integer.

In `C:\pg_data\input.txt`, set `sheet_to_process=2026-11` and `PATH` to the exported workbook path. Keep the script's `is_food`, payment date, UPI and phone settings as needed. Food is `0` for tenants who do not receive food.

The report is compatible with the columns and sheet selection used by the linked script; the script itself remains a separate Python/Selenium process and is not run by the Java application.

## Run
Backend: `mvn spring-boot:run` in `pg-management-backend`.
Frontend: `npm install` then `npm run dev` in `pg-management-frontend`.


## Existing rent-sheet import

The current tenant rosters and available monthly billing/payment history from the supplied AKKA PG and SUBASH PG workbooks are preloaded. The import keeps the two PG workspaces isolated. Review `MIGRATION-NOTES.md` and `MIGRATION-REPORT.xlsx` before relying on historical totals; missing advance data, exact occupancy dates and historical meter readings were not fabricated.
