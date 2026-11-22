# Excel to SQLite migration

## What changes
- The backend now stores application records in `pg-management-backend/data/pg-management.db`.
- AKKA PG and SUBASH PG are isolated by workspace inside the same SQLite database.
- The admin account is stored in the GLOBAL workspace.
- Existing Excel workbooks in `data/akka-pg` and `data/subash-pg` are imported automatically on first startup, collection by collection, only when that SQLite collection is empty.
- Existing React APIs and service operations remain compatible because the storage adapter preserves the prior read/append/update/delete interface.
- Monthly and WhatsApp Excel report generation remains available through Apache POI.

## First startup
1. Stop both frontend and backend.
2. Make a complete copy of the existing `pg-management-backend/data` directory. Keep the original `.xlsx` files unchanged.
3. Apply this project update and run the backend from `pg-management-backend` using `mvn spring-boot:run`.
4. Watch the backend console for `[PG STORAGE] Imported ...` messages for both workspaces.
5. Confirm `/api/health` reports `storage: SQLite` and the `databaseFile` path.
6. Log in, check AKKA PG and SUBASH PG separately, and compare tenant, room, bill and payment counts with the migration report.
7. Test creating/updating a tenant, recording a payment, generating billing, and downloading the monthly/WhatsApp Excel report.
8. Only after validation, continue normal use. Keep the original Excel files as a read-only backup until satisfied.

## Important behaviour
- Do not delete the original Excel files. They are the migration source and your rollback copy.
- The importer does not overwrite a non-empty SQLite collection. If an import is interrupted, stop the application and inspect the database before retrying; do not delete the DB without first backing it up.
- Back up the `.db` file while the backend is stopped. SQLite WAL may create `pg-management.db-wal` and `pg-management.db-shm` while running; include these if copying a live data directory. A stopped-backend backup is simplest.
- SQLite supports multiple readers but serializes writes. This is suitable for this local PG app and its expected usage; it is not intended for many simultaneous writers across multiple machines/network shares.
- SQLite JDBC is included as a Maven dependency; no SQLite server installation or separate service is needed.

## Data layout
`data/pg-management.db` contains `pg_records` with `workspace`, `collection`, `record_id`, and JSON payload columns. A composite primary key keeps records isolated by workspace and collection. This generic adapter keeps the current application code/API stable while changing persistence from workbooks to SQLite.
