# Meeting Cockpit

Web app para transformar reunioes capturadas no Read AI e organizadas no Notion em um hub operacional de triage, tarefas, decisoes, riscos, dependencias e memoria.

O Notion funciona como banco de dados. A camada de IA recomendada e uma automacao nativa do ChatGPT usando MCP/Notion: ela le as reunioes das ultimas 24h, processa o bruto e preenche databases derivadas. O Meeting Cockpit vira a interface de gestao.

## Notion-native Hub

Databases derivadas esperadas:

- `Meeting Cockpit - Triage`
- `Meeting Cockpit - Tasks`
- `Meeting Cockpit - Decisions`
- `Meeting Cockpit - Risks`
- `Meeting Cockpit - Questions`
- `Meeting Cockpit - Companies / Pillars`

Variaveis de ambiente para a Vercel:

```text
NOTION_TOKEN
NOTION_TRIAGE_DATABASE_ID
NOTION_TASKS_DATABASE_ID
NOTION_DECISIONS_DATABASE_ID
NOTION_RISKS_DATABASE_ID
NOTION_QUESTIONS_DATABASE_ID
```

Quando essas variaveis existem, o endpoint `/api/notion-hub` le as databases derivadas e o check de tarefas atualiza o `Status` no Notion. Quando elas nao existem, o app usa o dataset analitico local como fallback.

## ChatGPT Automation

Use [`docs/chatgpt-notion-automation.md`](./docs/chatgpt-notion-automation.md) como prompt/spec da automacao nativa do ChatGPT.

Fluxo desejado:

1. Automacao busca reunioes criadas ou editadas nas ultimas 24h.
2. IA extrai Tasks, Decisions, Risks e Questions.
3. Cada item entra primeiro em `Triage`, com `Stable Key`, origem, trecho e confianca.
4. Itens aprovados podem virar registros operacionais nas databases finais.
5. Meeting Cockpit le o Notion e permite gerir execucao.

## Meeting Analytics Fallback

O fallback local ainda existe para desenvolvimento e demo:

1. `data/meeting_notes_seed.json` guarda uma amostra inicial extraida da database `Read AI Meeting Notes`.
2. `scripts/analyze_meetings.py` normaliza datas, tokeniza texto, remove stopwords, calcula recorrencias, TF-IDF por `Pillar`, action items, blockers, decisoes, perguntas e timeline.
3. `public/data/meeting_analytics.json` e gerado como artefato estatico para a web app consumir.
4. `src/App.jsx` renderiza Triage, Task Hub, Riscos, Memoria, Questions, word cloud e lista auditavel de reunioes.

Comandos:

```bash
pip install -r requirements.txt
npm run analyze:data
npm run dev
npm run build
```

O `prebuild` roda o pipeline Python automaticamente antes do build, entao o deploy na Vercel sempre empacota o JSON mais recente que estiver no repo.

## Next Steps

- Criar as databases derivadas no Notion.
- Configurar as variaveis de ambiente no Vercel.
- Configurar a automacao nativa do ChatGPT com MCP/Notion.
- Evoluir o fluxo de Triage para aprovar/rejeitar/mover itens diretamente pelo app.

---

# SF Rapid Prototyping Codex

SF Rapid Prototyping Codex is a React/Vite web project for creating high-fidelity Salesforce prototypes with Codex. The goal is simple: describe the Salesforce page you want, and Codex can assemble a realistic screen using Salesforce Lightning Design System styling and React components.

The app now opens on a project dashboard. From there, users can create Salesforce prototype projects, choose a starter template, and open a navigable workspace that renders Salesforce-style screens with live object relationships and executable prototype actions.

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

- A project dashboard for managing multiple Salesforce prototype projects
- A new-project form for creating prototype workspaces from Salesforce starter templates
- A living Salesforce workspace with Account, Opportunity, Contract, and Product objects
- A navigable prototype workspace with list views, record pages, relationship maps, and guided action flows
- Executable actions such as create opportunity, advance stage, activate contract, reserve inventory, and create task
- A landing page that explains the project and the prototyping workflow
- A prompt contract section that documents how to ask Codex for new screens
- A high-fidelity office supplies and peripherals sales demo
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

## Product Flow

The intended product loop is:

1. Open the project dashboard.
2. Review existing prototype projects.
3. Create a new project from a Salesforce starter template.
4. Add a prototype brief that describes the desired Salesforce experience.
5. Open the workspace.
6. Navigate between generated screens such as list views, record pages, and guided flows.
7. Iterate with Codex until the prototype is review-ready.

The current implementation stores projects in local React state. Persistence can be added later with a database, local storage, or a backend service.

## Replication Playbook

Use [`SALESFORCE_PROTOTYPE_PLAYBOOK.md`](./SALESFORCE_PROTOTYPE_PLAYBOOK.md) when another AI agent needs to recreate this product style in a different project. It documents the required dependencies, SLDS import, Salesforce visual patterns, state architecture, data modeling rules, relationship navigation, executable actions, prompt template, Vercel settings, and validation checklist.

## Data Model

The included demo uses a fictional B2B company that sells office supplies and peripherals. The prototype connects four Salesforce-style objects:

- Account: customer or prospect organizations
- Opportunity: revenue pursuits linked to accounts, products, and contracts
- Contract: supply agreements linked to accounts, opportunities, and covered products
- Product: office supplies, peripherals, and warehouse devices linked to open pipeline and active contracts

The relationships are intentionally navigable. From an Account, users can click into related Opportunities, Contracts, and Products. From a Product, users can see the Accounts, Opportunities, and Contracts where that product appears.

## Executable Prototype Actions

The workspace includes actions that mutate the mock state so the prototype feels alive:

- Create Opportunity: adds a new opportunity and navigates to it
- Advance Stage: moves an opportunity to Contracting
- Activate Contract: updates contract status and risk
- Reserve Inventory: updates product inventory state
- Create Task: adds a task to the activity panel

These actions are not backend operations yet. They are front-end state transitions that make stakeholder reviews more realistic.

## Starter Templates

The first starter templates are:

- Sales operating system
- Contract renewal workspace
- Product catalog planning

Each template is designed to give Codex a Salesforce-specific starting point while keeping the app flexible enough for custom objects and bespoke enterprise workflows.

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
  App.jsx       Project dashboard, workspace, landing page, and Salesforce demo components
  App.css       Dashboard, workspace, landing page, and Salesforce prototype styling
  index.css     Global reset and font defaults
  main.jsx      React entrypoint and SLDS stylesheet import
public/
  favicon.svg
  icons.svg
```

## Design Notes

- The landing page explains the project before showing the live Salesforce prototype.
- The dashboard is the first product screen because the tool is meant to manage many prototype projects.
- The workspace uses object navigation, mode navigation, record links, modals, toasts, and state updates to make prototypes feel alive.
- The demo intentionally uses realistic office supplies and peripheral sales data so reviewers can judge density, hierarchy, labels, and Salesforce behavior.
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

### 2026-05-06 - Replication playbook

- Added `SALESFORCE_PROTOTYPE_PLAYBOOK.md` as a portable guide for recreating this Salesforce prototype identity in other AI tools.
- Documented the required dependencies and SLDS stylesheet import.
- Documented architecture patterns for dashboards, workspaces, object metadata, related records, executable actions, modals, and toasts.
- Added a reusable prompt template and quality checklist for future Salesforce-style prototypes.
- Validated documentation-only change with `npm run lint` and `npm run build`.

### 2026-05-06 - Living multi-object Salesforce prototype

- Added a connected mock data model for Accounts, Opportunities, Contracts, and Products.
- Added office supplies and peripherals sample data for a fictional B2B supplier.
- Added object navigation for all four Salesforce-style objects.
- Added list views, record pages, relationship maps, and guided action flow modes.
- Added clickable related records across Account, Opportunity, Contract, and Product relationships.
- Added executable prototype actions: create opportunity, advance opportunity stage, activate contract, reserve inventory, and create task.
- Added modal and toast feedback for live prototype actions.
- Reworked the landing demo to showcase the connected living prototype.
- Validated with `npm run lint` and `npm run build`.

### 2026-05-06 - Project dashboard and navigable workspace

- Added a first-screen project dashboard for managing multiple Salesforce prototype projects.
- Added starter templates for Account, Opportunity, and Case-style prototype workspaces.
- Added a new-project form with project name, Salesforce starter, and prototype brief fields.
- Added a prototype workspace with left navigation between list view, record detail, and guided flow screens.
- Kept the existing landing page available from the product navigation as the project explainer.
- Validated with `npm run lint` and `npm run build`.

### 2026-05-06 - Landing page and Salesforce Account demo

- Renamed the project package to `sfrapidprototypingcodex`.
- Added a landing page explaining the Codex + Salesforce rapid prototyping workflow.
- Added a prompt contract section for requesting new Salesforce prototype pages.
- Added a high-fidelity Account record page demo using SLDS patterns.
- Installed `@salesforce/design-system-react` and `@salesforce-ux/design-system`.
- Imported the official Salesforce Lightning Design System stylesheet.
- Updated the app title for Vercel deployment.
- Validated with `npm run build`.
