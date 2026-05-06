# SF Rapid Prototyping Codex

SF Rapid Prototyping Codex is a React/Vite web project for creating high-fidelity Salesforce prototypes with Codex. The goal is simple: describe the Salesforce page you want, and Codex can assemble a realistic screen using Salesforce Lightning Design System styling and React components.

The first included prototype is an Account record page with Salesforce navigation, a record highlights panel, actions, related lists, activity, and account details.

## Why This Exists

Salesforce prototypes are often slow to create when the team needs something that looks close enough to the real product for stakeholder review. Low-fidelity mockups are useful early, but they can fail when the conversation depends on Salesforce-specific patterns: record pages, object navigation, related lists, highlights panels, activity timelines, app navigation, modals, and form flows.

This project gives Codex a working React surface and a Salesforce-flavored component baseline. Instead of starting from a blank page each time, Codex can turn a product request into a Vercel-ready prototype.

## What It Can Prototype

Use this project for Salesforce-style screens such as:

- Account, Contact, Opportunity, Lead, Case, or custom object record pages
- List views with filters, row actions, and status states
- Console-style workspaces with side panels and utility regions
- Admin setup pages and guided configuration flows
- Approval, onboarding, service, sales, or operations flows
- Dashboards and summary pages that need Salesforce visual language

## Current Demo

The current app ships with:

- A landing page that explains the project and the prototyping workflow
- A prompt contract section that documents how to ask Codex for new screens
- A high-fidelity Account record page demo
- Salesforce Lightning Design System CSS loaded globally
- Salesforce Design System React installed for reusable primitives

## Prompt Contract

When asking Codex to build a new Salesforce prototype, include:

1. The Salesforce surface: record page, list view, console, wizard, flow screen, dashboard, or modal.
2. The object or business domain: Account, Opportunity, Case, onboarding, approvals, billing, service, or custom object.
3. The regions that should appear: highlights panel, path, tabs, activity, related lists, right rail, form, table, or empty state.
4. The actions users need: edit, save, submit, approve, assign, convert, log a call, create task, or open modal.
5. Realistic data: record names, stages, amounts, owners, dates, statuses, and business context.
6. Any important states: loading, empty, error, validation, success, read-only, draft, or submitted.

Example request:

```text
Create an Opportunity record page for an enterprise seller.
Use Salesforce Lightning styling.
Show highlights, stage path, key fields, related contacts, products, next steps, and an activity composer.
Use realistic data for a $480k renewal opportunity closing in Q3.
```

## Tech Stack

- React 19
- Vite 8
- Salesforce Lightning Design System CSS
- `@salesforce/design-system-react`
- `@salesforce-ux/design-system`
- ESLint

## Local Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint:

```bash
npm run lint
```

## Vercel Deployment

This is a standard Vite app, so Vercel can deploy it with the default settings:

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

No custom server is required.

## Project Structure

```text
src/
  App.jsx       Main landing page and Account demo components
  App.css       Landing page, layout, and Salesforce prototype styling
  index.css     Global reset and font defaults
  main.jsx      React entrypoint and SLDS stylesheet import
public/
  favicon.svg
  icons.svg
```

## Design Notes

- The landing page explains the project before showing the live Salesforce prototype.
- The Account demo intentionally uses realistic data so reviewers can judge density, hierarchy, labels, and Salesforce behavior.
- SLDS classes are used for Salesforce-native surfaces such as global headers, page headers, tabs, cards, and tables.
- The Salesforce React package is used for button primitives. Because the package is older than the current React version, new prototypes should keep build validation as part of the workflow.

## Commit Workflow

Every meaningful commit should update the changelog below with:

- Date
- Short summary
- Files or surfaces changed
- Validation performed

Keep the newest entry at the top.

## Changelog

### 2026-05-06 - Landing page and Salesforce Account demo

- Renamed the project package to `sfrapidprototypingcodex`.
- Added a landing page explaining the Codex + Salesforce rapid prototyping workflow.
- Added a prompt contract section for requesting new Salesforce prototype pages.
- Added a high-fidelity Account record page demo using SLDS patterns.
- Installed `@salesforce/design-system-react` and `@salesforce-ux/design-system`.
- Imported the official Salesforce Lightning Design System stylesheet.
- Updated the app title for Vercel deployment.
- Validated with `npm run build`.
