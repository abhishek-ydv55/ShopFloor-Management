# ManuVya™ — Angular 21 Migration

Shop Floor Management System migrated from vanilla HTML/CSS/JS to Angular 21.

## Quick Start

```bash
npm install
ng serve          # Dev server → http://localhost:4200
ng build          # Production build → dist/shopfloor-angular
ng test           # Run unit tests with Karma/Jasmine
ng test --code-coverage   # Coverage report → coverage/
```

## Default Login Credentials

| Role             | Email              | Password     |
|------------------|--------------------|--------------|
| Admin            | admin@tcs.com      | Password1!   |
| Manager          | man@tcs.com        | Password1!   |
| Supervisor       | super@tcs.com      | Password1!   |
| Technician       | tech@tcs.com       | Password1!   |
| Maintenance Sup. | main@tcs.com       | Password1!   |
| Procurement      | proc@tcs.com       | Password1!   |
| Inventory        | invent@tcs.com     | Password1!   |
| Worker           | work@tcs.com       | Password1!   |

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # AuthService, WorkerService, TicketService
│   ├── ui/                  # Reusable standalone UI components
│   │   ├── button/
│   │   ├── card/
│   │   ├── dashboard-topbar/
│   │   ├── form-field/
│   │   ├── modal/
│   │   ├── navbar/
│   │   ├── notification/
│   │   └── sidebar/
│   └── features/
│       ├── landing/         # Home, About, Contact pages
│       ├── login/           # Login page
│       ├── admin/           # Admin shell + pages
│       ├── manager/         # Manager shell + pages
│       ├── supervisor/      # Supervisor shell + pages
│       ├── technician/      # Technician shell + pages
│       ├── maintenance/     # Maintenance shell + pages
│       ├── inventory/       # Inventory page
│       ├── procurement/     # Procurement page
│       └── worker/          # Worker page
└── styles/
    ├── _tokens.css          # Design tokens (CSS variables)
    ├── _typography.css      # Global typography reset
    └── _layout.css          # Layout primitives + utilities
```

## Original → Angular Mapping

| Original File                         | Angular Component / Service                                       |
|---------------------------------------|-------------------------------------------------------------------|
| Landing/index.html + style.css        | features/landing/pages/home.component.*                          |
| Landing/about.html                    | features/landing/pages/about.component.ts                        |
| Landing/contact_us.html               | features/landing/pages/contact.component.ts                      |
| Login/login.html + script.js          | features/login/login.component.* + AuthService                   |
| Admin/index.html + js/*.js            | features/admin/* + WorkerService                                  |
| Admin/registernewuser.html            | features/admin/pages/register-worker.component.ts                |
| Admin/removeworker.html               | features/admin/pages/remove-worker.component.ts                  |
| Admin/worker-list.html                | features/admin/pages/worker-list.component.ts                    |
| Manager/index.html                    | features/manager/pages/manager-dashboard.component.ts            |
| Manager/maintenance.html              | features/manager/pages/manager-maintenance.component.ts          |
| Manager/assign-technician.html        | features/manager/pages/assign-technician.component.ts            |
| Manager/procurement.html              | features/manager/pages/manager-procurement.component.ts          |
| Manager/manage-machines.html          | features/manager/pages/manage-machines.component.ts              |
| Supervisor/supervisor.html + script.js| features/supervisor/pages/supervisor-home.component.ts           |
| Supervisor/dashboard.html             | features/supervisor/pages/supervisor-dashboard.component.ts      |
| Supervisor/createTicket.html          | features/supervisor/pages/create-ticket.component.ts             |
| Technician/home.html                  | features/technician/pages/technician-home.component.ts           |
| Technician/mytask.html                | features/technician/pages/my-tasks.component.ts                  |
| Technician/spare-request.html         | features/technician/pages/spare-requests.component.ts            |
| Maintenance/dashboard.html            | features/maintenance/pages/maintenance-dashboard.component.ts    |
| Maintenance/issue-report.html + .js   | features/maintenance/pages/issue-report.component.ts             |
| Maintenance/issue-status.html + .js   | features/maintenance/pages/issue-status.component.ts             |
| Maintenance/status dashboard.html     | features/maintenance/pages/status-dashboard.component.ts         |
| Maintenance/use hour.html + .js       | features/maintenance/pages/use-hour.component.ts                 |
| Inventory/inventory.html              | features/inventory/inventory.component.ts                        |
| Procurement/procurement.html          | features/procurement/procurement.component.ts                    |

## Design Tokens

All design tokens live in `src/styles/_tokens.css` as CSS custom properties. Key tokens:

- Colors: `--brown-900`, `--brown-700`, `--brown-500`, `--red-700`, `--red-500`, `--red-300`
- Gradients: `--grad-header`, `--grad-brand`, `--grad-dark`, `--grad-footer`
- Typography: `--font-xs` through `--font-4xl`
- Spacing: `--space-1` through `--space-16`
- Radius: `--radius-sm` through `--radius-full`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-brand`

## Tech Stack

- Angular 21 (standalone components, signals)
- TypeScript strict mode
- CSS variables (design tokens)
- Angular Router (lazy-loaded feature routes)
- Karma + Jasmine (unit tests)
- localStorage for persistence (auth, workers, tickets, issues)
