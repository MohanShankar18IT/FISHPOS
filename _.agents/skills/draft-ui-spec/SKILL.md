---
name: draft-ui-spec
description: >-
  Creates a comprehensive UI specification and implementation plan for screens and front-end components.
  Activate this skill when the user invokes /draft-ui-spec or asks to design, draft, or plan UI screens,
  component breakdowns, and interaction flows based on available documentation in the docs folder.
---

# Draft UI Spec Skill (`/draft-ui-spec`)

This skill standardizes the Agentic SDLC workflow for drafting detailed UI specifications for the enterprise HRMS application (supporting both `ess-web` and `admin-web`).

---

## Mandatory Common UI & CSS Guidelines

Every drafted UI Spec must strictly adhere to the project's existing UI components and styling patterns:

1. **Avoid Conflicting Generic Card Containers**:
   - **DO NOT SPECIFY Bootstrap `<Card>`, `<Card.Header>`, `<Card.Body>`** on admin/master screens. The codebase has global `.card` flex-row styles in `cardList.scss` that cause headers and bodies to render side-by-side into distorted narrow columns.
   - **DO SPECIFY standard Novanta master containers**: `<div className="container-fluid px-0">`, `<Form className="<module>-form">`, and `<div className="grid-container">`.

2. **Reuse Existing Shared Form Components (`src/components/form-fields/`)**:
   - **Dropdowns**: ALWAYS specify `SelectField` (`src/components/form-fields/PrimeSelectField.tsx`) with Formik integration instead of raw dropdown implementations.
   - **Inputs**: Standardize text, number, and textarea inputs with `Form.Group`, `Form.Label` (using `<span style={{ color: 'red' }}>*</span>` for required), and `Form.Control`.
   - **Switches & Toggles**: Specify `Form.Check type="switch" className="custom-toggle"` with standard labels (e.g. 'Yes'/'No', 'Active'/'Inactive'). Do not place custom badge overlays on switch knobs.
   - **Action Buttons**: Align in `<div className="form-buttons">` using `.submit-button` (`Submit` / `Update`) and `.btn-outline-secondary` / `.btn-outline-danger` (`Clear` / `Cancel`).

3. **Reuse Existing Grid & Table Patterns**:
   - **Container**: Wrap data tables in `<div className="grid-container">`.
   - **DataTable**: Specify PrimeReact `DataTable` with `filterDisplay="row"` and `Column` filters matching `DepartmentGrid.tsx`.
   - **Pagination**: ALWAYS specify `GridPaginator` (`src/components/ui-kit/grid-paginator/GridPaginator.tsx`) passing `options={{ first, rows, totalRecords }}` or `paginatorLeft={leftTemplate}`.
   - **Action Icons**: Specify existing SVG icons (`edit.svg`, `EyeSvg.svg` / `eye.svg`, `delete.svg` from `src/assets/images/`).
   - **Confirmation**: Specify PrimeReact `ConfirmDialog` for delete actions.

4. **Screen Decoupling Discipline**:
   - For operational, transaction, and multi-step workflows (e.g. Work Queue, Request Wizard), always decouple the high-density **List Screen** (triage, filters, KPIs, data table) from the **Entry / Fulfillment Screen** (deep form inputs, step-by-step procurement, validation, document attachments) into dedicated routes and files.

5. **Common SCSS & Theme Tokens**:
   - Specify `@import './theme/default.scss';` in module SCSS files.
   - Reuse variables: `$header-title-color`, `$font-size-form-label`, `$font-size-table-header`, `$background-grey-color`, `$table-header-color`, `$cancle-btn-bg`, `$cancle-btn-clr`, and `var(--primary-color)`.

---

## Workflow Steps

### Step 1: Context & Requirement Gathering
1. **Analyze User Input**: Identify the screen, workflow, or component the user wants to design (e.g. *New Travel Request Wizard*, *Approval Drawer*, *Partner Search & Offer Comparison*, *Boarding Hub*, *Desk Operations Console*).
2. **Consult Module Documentation**: Read relevant requirement and architecture specs from `docs/`:
   - [01_requirements_spec.md](file:///d:/NOVANTA/FRONTEND/docs/travel-desk/01_requirements_spec.md) - FR IDs, acceptance criteria, and user roles.
   - [04_frontend_spec.md](file:///d:/NOVANTA/FRONTEND/docs/travel-desk/04_frontend_spec.md) - Screen inventory and UI component mappings.
   - [05_api_and_adapter_contracts.md](file:///d:/NOVANTA/FRONTEND/docs/travel-desk/05_api_and_adapter_contracts.md) - REST endpoints, canonical request/response models.
   - [06_boarding_and_travel_day.md](file:///d:/NOVANTA/FRONTEND/docs/travel-desk/06_boarding_and_travel_day.md) - Travel-day & check-in specific flows.
3. **Inspect Existing UI Patterns**: Check existing modules in `admin-web/src/modules/` or `ess-web/src/modules/` to ensure consistency with existing PrimeReact / React-Bootstrap styling, hooks, and directory structures.

---

### Step 2: Formulate the UI Specification

Using the template in [ui_spec_template.md](./resources/ui_spec_template.md), draft a detailed UI specification covering:

1. **Screen Metadata**:
   - Application target (`ess-web` vs `admin-web`), route URL, and module sub-path.
   - Authorized user roles & RBAC visibility rules.
   - Mapped Functional Requirement IDs (e.g., `TR-REQ-001`, `TR-POL-002`).

2. **Visual Layout & Architecture**:
   - Layout grids using `react-bootstrap` (`Container`, `Row`, `Col`).
   - Visual hierarchy: Page header, progress indicators / steps, main work area, context sidebars/drawers, action footer.

3. **Component Decomposition**:
   - Full component tree diagram.
   - Component catalog detailing file path, existing vs new status, key props, and responsibility.
   - Standard UI components (PrimeReact `DataTable`, `Dialog`, `Calendar`, `SelectField`, `Toast`, `Badge`).

4. **State & Validation Architecture**:
   - Redux Toolkit integration (`travelDeskSlice.ts`) vs component-level state.
   - Formik initial values and field bindings.
   - Yup validation schemas (including async validations, date chronological order, and field inter-dependencies).

5. **State Progression & Feedback Handling**:
   - Loading skeletons (`Skeleton`).
   - Empty states with informative illustrations.
   - Policy warning indicators and exception override modals.
   - Partner error / timeout handling with graceful fallback.

---

### Step 3: Output Delivery

1. Write the completed UI specification to `docs/travel-desk/ui-specs/<screen_name>_ui_spec.md`.
2. Present a clear summary of the UI design, key components, and open decisions to the user for review.
