# Expected first-import record counts

These counts were read from the supplied Excel workbooks included in this project ZIP. The SQLite importer reads each workbook's named sheet and imports non-empty rows that have the required primary key.

| Workspace | Tenants | Rooms | Bills | Payments | Electricity readings | Settings |
|---|---:|---:|---:|---:|---:|---:|
| AKKA PG | 195 | 23 | 1,338 | 1,030 | 0 | 1 |
| SUBASH PG | 248 | 15 | 1,150 | 939 | 0 | 1 |

Tenant totals are historical profile rows, not active tenant counts. The application derives active tenants using each tenant's status/joining/vacating data.

All non-empty primary keys were unique in the supplied workbooks during pre-packaging checks. The importer uses each workbook's declared key (for example `tenantId`, `billId`, `paymentId`) to preserve identity.
