# WhatsApp Selenium export guide

1. In AKKA PG or SUBASH PG, open Reports.
2. Select the billing month and click **WhatsApp script Excel**.
3. Copy the downloaded workbook to `C:\pg_data\` (or set `PATH` to its actual location).
4. Open `C:\pg_data\input.txt` and set `sheet_to_process` to the exact worksheet name. The export worksheet name is the month in `YYYY-MM` format, e.g. `2026-11`.
5. Set `PATH` to the downloaded workbook. Keep your UPI ID, payment phone number, payment date and `is_food` values as needed.
6. Run your existing `selinium_script.py` separately on the same Windows machine where Chrome and WhatsApp Web are configured.

The export deliberately uses row 2 (Excel row number 2; pandas `header=1`) for the exact column names:

`NAME`, `PHONE NUMBER`, `RENT`, `FOOD`, `ELECTRICITY`, `PENDINGS`, `TOTAL`

Amounts are rounded to whole rupees because the supplied script converts numeric columns to integers. `PENDINGS` combines previous balance + other charges - discount so the script's displayed total reconciles to the amount shown. Tenants without food have FOOD = 0. Advance/security deposit is not part of the recurring monthly message total.

The script's `is_food` flag is global for the selected worksheet. The export still supplies a per-tenant FOOD value (including zero for tenants without food), but the script's food-timing paragraph is controlled by that one global flag. If AKKA PG and SUBASH PG use different message styles or food timings, set the flag before running each PG's export separately.
