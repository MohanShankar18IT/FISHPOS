---
name: pos-implement
description: >-
  Executes step-by-step implementation of full-stack Fish POS features covering FastAPI backend services,
  SQLAlchemy models, Pydantic schemas, and React TypeScript UI components.
---

# Fish POS — Implementation Skill

This skill standardizes the code generation and testing process for the **Fish POS** platform.

## Implementation Steps

1. **Backend Layering**:
   - `BACKEND/app/models/`: Entity definition in SQLAlchemy.
   - `BACKEND/app/schemas/`: Pydantic validation contracts.
   - `BACKEND/app/services/`: Authoritative business logic and atomic transactions.
   - `BACKEND/app/api/v1/endpoints/`: Thin router endpoints.

2. **Frontend Layering**:
   - `FRONTEND/src/types/`: Domain TypeScript types.
   - `FRONTEND/src/services/api.ts`: API client with mock fallback.
   - `FRONTEND/src/context/POSContext.tsx`: State management.
   - `FRONTEND/src/components/`: Modular, touch-friendly UI components.
