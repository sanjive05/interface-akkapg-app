# PG Management UI and Billing Performance Update

## User-facing changes
- Tenants: added sorting by joining date (newest/oldest), room number, and tenant name.
- Tenants: room IDs are displayed as human-readable room numbers when the room workbook is available.
- Rooms: added sorting by room number, floor, occupied beds, available beds, and rent.
- Payments: added a tenant search field that filters pending bills by tenant name, room number, or tenant ID. Recording a payment continues to update PAID / PARTIAL / PENDING automatically from payment records; payment history remains immutable.
- Billing: added a Room column and sorting by room, tenant name, and highest outstanding balance.

## Billing loading improvements
- The shared frontend data hook now aborts stale requests when the page changes or React StrictMode re-runs an effect in development. This avoids leaving duplicate obsolete XHRs running.
- Excel workbook schema validation is now cached per workbook path for the lifetime of the backend process. Previously every read validated the XLSX by opening it, then opened it again to read records. This removes one full workbook open/parse from each subsequent read.
- The React Router future-flag messages and React DevTools message are development notices, not billing API failures.

## Important
- No imported AKKA PG or SUBASH PG Excel data was modified by these changes.
- Restart the Spring Boot backend after replacing the backend source file so the workbook-validation optimization takes effect.
- Frontend npm install and Maven build could not be completed in the build environment; verify locally after applying the patch.
