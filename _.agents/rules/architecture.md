# Travel Desk - Architecture & Core Integration Guardrails

> [!IMPORTANT]
> The Travel Desk module operates strictly as a Core HRMS consumer and follows a strict adapter-driven service architecture.

## 1. Core HRMS Master Governance (Strict Read-Only)

- **Do NOT duplicate or modify Core Masters**:
  - Employee profiles, reporting managers, grades, designations, work locations, and security groups reside in Core HRMS.
  - Travel Desk must treat Core HRMS data as read-only.
  - Foreign key references to employees must reference Core `employee_id`.

## 2. Approval Workflow Delegation

- **Do NOT build a parallel approval engine**:
  - All multi-level approval tasks, escalation rules, out-of-office delegation, and notifications must be dispatched through the **Core Workflow Engine**.
  - Travel Desk requests create workflow tasks and listen for completion callbacks.

## 3. Document Vault & Storage

- **Do NOT store binary files in database tables**:
  - All e-tickets, hotel vouchers, expense receipts, and digital boarding passes must be uploaded to the **Core Document Service**.
  - Travel Desk records only store the immutable `document_id` reference and metadata.

## 4. Policy Snapshot Immutability

- Policy evaluation must be frozen at request submission.
- Store a serialized JSON snapshot of the policy rules evaluated in `c9001_policy_snapshot_json` to guarantee reproducible audit trails regardless of subsequent policy modifications.
