---
name: implement-ui
description: >-
  Prepares a comprehensive step-by-step implementation plan for a UI screen based on a provided UI Spec document.
  Activate this skill when the user invokes /implement-ui or provides a UI spec document name/path to plan
  frontend component implementation.
---

# Implement UI Skill (`/implement-ui`)

This skill standardizes the transition from UI specification to concrete frontend implementation in the Novanta SaaS platform (`ess-web` or `admin-web`).

---

## Mandatory Common UI & CSS Guidelines

To guarantee consistent pixel-perfect alignment and prevent layout regressions:

1. **Avoid Conflicting Generic Card Containers**:
   - **DO NOT USE Bootstrap `<Card>`, `<Card.Header>`, `<Card.Body>`** on admin/master screens. The codebase has global `.card` flex-row styles in `cardList.scss` that cause headers and bodies to render side-by-side into distorted narrow columns.
   - **DO USE standard Novanta master containers**: `<div className="container-fluid px-0">`, `<Form className="<module>-form">`, and `<div className="grid-container">`.

2. **Reuse Existing Shared Form Components (`src/components/form-fields/`)**:
   - **Dropdowns**: ALWAYS use `SelectField` (`src/components/form-fields/PrimeSelectField.tsx`) with Formik integration instead of raw dropdown implementations.
   - **Inputs**: Standardize text, number, and textarea inputs with `Form.Group`, `Form.Label` (using `<span style={{ color: 'red' }}>*</span>` for required), and `Form.Control`.
   - **Switches & Toggles**: Use `Form.Check type="switch" className="custom-toggle"` with standard label. Do not place custom badge overlays on switch knobs.
   - **Action Buttons**: Align in `<div className="form-buttons">` using `.submit-button` (`Submit` / `Update`) and `.btn-outline-secondary` / `.btn-outline-danger` (`Clear` / `Cancel`).

3. **Reuse Existing Grid & Table Patterns**:
   - **Container**: Wrap data tables in `<div className="grid-container">`.
   - **DataTable**: Use PrimeReact `DataTable` with `filterDisplay="row"` and `Column` filters matching `DepartmentGrid.tsx`.
   - **Pagination**: ALWAYS integrate `GridPaginator` (`src/components/ui-kit/grid-paginator/GridPaginator.tsx`) passing `options={{ first, rows, totalRecords }}` or `paginatorLeft={leftTemplate}`.
   - **Action Icons**: Use standard SVG icons:
     - Edit: `src/assets/images/edit.svg`
     - View Details: `src/assets/images/EyeSvg.svg` or `src/assets/images/eye.svg`
     - Delete: `src/assets/images/delete.svg`
   - **Confirmation**: Use PrimeReact `ConfirmDialog` for delete actions.

4. **Screen Decoupling Discipline**:
   - For operational, transaction, and multi-step workflows (e.g. Work Queue, Request Wizard), always decouple the high-density **List Screen** (triage, filters, KPIs, data table) from the **Entry / Fulfillment Screen** (deep form inputs, step-by-step procurement, validation, document attachments) into dedicated routes and files.

5. **Common SCSS & Theme Tokens**:
   - Always `@import './theme/default.scss';` in module SCSS files.
   - Reuse variables: `$header-title-color`, `$font-size-form-label`, `$font-size-table-header`, `$background-grey-color`, `$table-header-color`, `$cancle-btn-bg`, `$cancle-btn-clr`, and `var(--primary-color)`.

---

## Workflow Steps

### Step 1: UI Spec Discovery & Ingestion
1. **Identify Spec Document**:
   - Extract the spec argument provided by the user (e.g. `/implement-ui new_travel_request_ui_spec.md` or `/implement-ui docs/travel-desk/ui-specs/travel_dashboard_ui_spec.md`).
   - If only the screen name or basename is provided, locate the corresponding file in `docs/travel-desk/ui-specs/`.
2. **Read & Parse Spec**:
   - Read the UI Spec document in full using `view_file`.
   - Identify:
     - Target App (`ess-web` vs `admin-web`).
     - Components tree, Formik state, Yup validation schemas, Redux slices, and UI states (loading, empty, warning).

---

### Step 2: Codebase Architecture & Dependency Audit
1. **Target Module Structure**:
   - Check existing directory structure in `d:/NOVANTA/FRONTEND/<target-app>/src/modules/travel-desk/`.
2. **Reusable Component Audit**:
   - Check available PrimeReact components, React-Bootstrap layouts, Lucide icons, and shared hooks in the target application.
3. **State & Router Audit**:
   - Inspect Redux store configuration and routing setup in `src/App.tsx` or module router.

---

### Step 3: Generate Implementation Plan Artifact
1. Following Antigravity Planning Mode, generate or update the `implementation_plan.md` artifact (and optionally create `docs/travel-desk/plans/<screen_name>_implementation_plan.md`).
2. The implementation plan must detail:
   - **Target Files List**: Categorized into Types, Schemas, Slices, Components, Screens, and Routes.
   - **Component Breakdown**: Specific PrimeReact / Bootstrap elements used per widget.
   - **State Slicing & Formik Schema**: Field models, validation constraints, and Redux async thunks.
   - **Surgical Rule Compliance**: Explicitly confirming no unrelated files or existing shared components are altered.
   - **Verification Plan**: Exact commands (`npm run build`, `npm run lint`) and interactive UI checks.
3. Set `ArtifactMetadata` with `RequestFeedback: true` and `UserFacing: true`.

---

### Step 4: User Review & Confirmation
1. Present a concise summary of the implementation strategy and file plan to the user.
2. Prompt the user for confirmation before executing the source code changes.
