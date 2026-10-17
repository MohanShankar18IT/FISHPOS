# Travel Desk - Database Naming & Tenancy Guardrails

> [!CRITICAL]
> All database objects, SQL queries, ORM models, and migrations for the Travel Desk module MUST adhere to the following standards.

## 1. Table & Column Prefix Standards

| Category | Table Prefix | Column Prefix | Example Table | Example Columns |
| :--- | :--- | :--- | :--- | :--- |
| **Master Tables** | `T101_` | `C101_` | `T101_CATEGORY_MASTER` | `c101_CATEGORY_id`, `C101_CATEGORY_name` |
| **Transaction Tables** | `T1001_` | `c1001_|

- **No Exceptions**: Every column in `T101_*` tables MUST start with `c101_`. Every column in `T1001_*` tables MUST start with `c1001_`.
- Do not create tables without the designated module prefix (`101` for masters, `1001` for transactions).

## 2. Multi-Tenancy

- **STRUCTURE BASED ON MULTIPLE TENANT.

## 3. Mandatory Audit Columns

Every table must include standard audit fields:
- Master (`T101_`): `c101_created_by`, `c101_created_at`, `c101_updated_by`, `c101_updated_at`, `c101_is_active`, `c101_is_deleted`.
- Transaction (`T1001_`): `c1001_created_by`, `c1001_created_at`, `c1001_updated_by`, `c1001_updated_at`, `c1001_is_deleted`.
