# CHANGELOG — ShopFloor3.2 → Angular 21 Migration

## Migrated Features

### Authentication
- Login form validation preserved exactly (email regex, password 8+ chars, uppercase, number, special char)
- Role-based redirect preserved for all 8 user roles
- Password toggle (Show/Hide) preserved
- Session persisted to `localStorage` via `AuthService` signal

### Admin Module
- Register New Worker: validation (name regex, password regex, duplicate ID check)
- Remove Worker: two-step confirmation (no browser popups), search by ID/name/role
- Worker List: live search filter, table display
- All state persisted to `localStorage['workers']`

### Supervisor Module
- Ticket list with filter by status and priority
- Ticket detail panel with history timeline
- Close Ticket action (isClosable guard preserved)
- Create Ticket: dynamic department→issueType cascade, form validation
- Analytics Dashboard: stat cards and bar chart (replaces Chart.js with pure CSS bars)

### Technician Module
- Task board with Start/Complete status progression
- Spare Parts Request form + request log table

### Maintenance Module
- Maintenance Dashboard with issue stats
- Issue Report form (machine, type, description, severity, date)
- Issue Status table with inline status progression
- Status Dashboard with machine grid and search/clear
- Machine Use Hour form (hours 2–24 validation preserved)

### Manager Module
- Dashboard KPI cards
- Maintenance Reports ticket table
- Assign Technician to open tickets
- Procurement Requests view
- Manage Machines grid with status indicators

### Landing Pages
- Home: hero, animated highlight cards (rotating highlight every 1.5s preserved), features section, CTA
- About: full-page banner + content
- Contact: contact cards with hover effects

### Inventory / Procurement / Worker
- Migrated to Angular standalone components with sidebar shell

## Known Deviations / Intentional Changes

### Chart.js Removed
- Original Supervisor Dashboard used Chart.js CDN (`cdn.jsdelivr.net/npm/chart.js`)
- Replaced with accessible pure-CSS horizontal bar chart
- Reason: avoids external CDN dependency; same data displayed

### Google Fonts
- Original Supervisor pages loaded Montserrat from Google Fonts
- Retained via `<link>` in `index.html` (no build-time dependency)

### File Names with Spaces
- Original had `status dashboard.html` and `use hour.html` (filenames with spaces)
- Migrated to URL-safe routes: `/maintenance/status-dashboard` and `/maintenance/use-hour`

### Inline `onclick` Handlers
- All `onClick=window.location.href=...` on logout buttons replaced with `AuthService.logout()` via Angular Router

### Worker Dashboard
- Original `Worker/index.html` was referenced in login routing but ZIP did not contain the file
- Created a functional placeholder dashboard with Shift, Tasks Today, and Schedule sections

### No Backend / Real Auth
- Authentication remains client-side (hardcoded credentials) matching original behavior
- In production, replace `AuthService.login()` with a real HTTP call

### Inventory Page
- Original `Inventory/inventory.html` was 36KB with hardcoded static HTML data table
- Migrated to a dynamic Angular component with sample data; full data import not done (no API)

### Procurement Page
- Original `Procurement/procurement.html` was 32KB with static table
- Migrated to dynamic Angular component with new-request form + log table

## Test Coverage

Unit tests provided for:
- `AuthService` (9 tests)
- `WorkerService` (9 tests)
- `TicketService` (7 tests)
- `ButtonComponent` (8 tests)
- `FormFieldComponent` (8 tests)
- `ModalComponent` (7 tests)
- `App` root component (1 test)

Target: ≥60% coverage on migrated logic (services + UI primitives fully covered).
