# Salesforce Rapid Prototype Playbook

Use this document as an instruction guide for another AI agent that needs to create high-fidelity Salesforce-style web products with the same identity, stack, and behavior patterns used in this repository.

## Goal

Create complete, navigable, high-fidelity Salesforce prototypes as React web apps. The result should feel like a living Salesforce product, not a static mockup. Users must be able to click records, move between related objects, open modals, execute actions, see state changes, and review realistic business workflows.

## Required Stack

Use this exact application stack:

```json
{
  "dependencies": {
    "@salesforce-ux/design-system": "^2.25.0-alpha.2",
    "@salesforce/design-system-react": "^0.10.65",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.1",
    "vite": "^8.0.10",
    "eslint": "^10.2.1"
  }
}
```

The app must import the Salesforce Lightning Design System stylesheet in the React entrypoint:

```jsx
import '@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css'
```

Use `@salesforce/design-system-react` for primitives that work cleanly, especially `Button`:

```jsx
import { Button } from '@salesforce/design-system-react'
```

Important compatibility note: `@salesforce/design-system-react` is older than React 19 and may emit peer dependency warnings. Keep the implementation conservative. Prefer SLDS CSS classes for layout-heavy Salesforce surfaces and use React components from the package where they compile cleanly.

## Product Standard

The prototype must satisfy these rules:

- It opens as a real web product, not a landing page only.
- It has a dashboard or command center when there are multiple prototypes or workflows.
- It uses realistic mock data with relationships, not isolated cards.
- It contains list views, record pages, related lists, detail panels, action bars, modals, toasts, and guided flows when relevant.
- It supports clicking between objects and records.
- It supports actions that mutate local state.
- It can be deployed to Vercel with a standard Vite build.

## Visual Identity

Use Salesforce Lightning Design System as the visual base:

- Global header: `slds-global-header`
- App navigation: `slds-context-bar`
- Record header: `slds-page-header slds-page-header_record-home`
- Cards: `slds-card`
- Tables: `slds-table slds-table_cell-buffer slds-table_bordered`
- Tabs: `slds-tabs_default`
- Modal: `slds-modal slds-fade-in-open`
- Form controls: `slds-input`, `slds-select`, `slds-textarea`
- Boxes and layout helpers: `slds-box`, `slds-grid`, `slds-media`

Use Salesforce-like color decisions:

- Salesforce blue for primary actions: `#0176d3`
- Deep Salesforce navy for text and headers: `#032d60`
- Neutral app background: `#f3f2f2` or `#f3f6fb`
- Borders: `#dddbda`, `#d8dde6`, `#c9c9c9`

Avoid generic SaaS visuals that break the Salesforce feel:

- Do not make the UI look like a marketing landing page once inside the app.
- Do not use decorative gradients inside operational screens.
- Do not replace Salesforce density with oversized cards.
- Do not use invented UI metaphors when a Salesforce pattern exists.

## Recommended App Architecture

Use a state-driven architecture:

```jsx
const [view, setView] = useState('dashboard')
const [activeObject, setActiveObject] = useState('accounts')
const [selectedIds, setSelectedIds] = useState({
  accounts: 'acc-001',
  opportunities: 'opp-001',
  contracts: 'con-001',
  products: 'prod-001',
})
const [mode, setMode] = useState('record')
const [data, setData] = useState(initialData)
```

Recommended top-level views:

- `dashboard`: project library and new prototype form
- `workspace`: the live Salesforce prototype
- `landing` or `about`: optional explainer page

Recommended workspace modes:

- `list`: list view for the selected object
- `record`: Salesforce record page for the selected record
- `relationships`: relationship map with clickable related records
- `flow`: guided action flow

## Data Modeling Rules

Always start by defining object metadata and mock data.

Object metadata should include:

```jsx
const objectMeta = {
  accounts: {
    singular: 'Account',
    plural: 'Accounts',
    icon: 'A',
    color: '#5867e8',
    fields: ['type', 'industry', 'revenue', 'owner', 'health'],
  },
}
```

Mock records should use stable ids and foreign keys:

```jsx
const initialData = {
  accounts: [
    {
      id: 'acc-aurora',
      name: 'Aurora Workspaces',
      owner: 'Camila Rocha',
      health: 'Green',
    },
  ],
  opportunities: [
    {
      id: 'opp-office-refresh',
      accountId: 'acc-aurora',
      contractId: 'con-master-aurora',
      productIds: ['prod-ergokit', 'prod-dock'],
      name: 'Aurora office refresh Q3',
    },
  ],
}
```

Use arrays of ids for many-to-many-like prototype relationships, such as products attached to opportunities or contracts.

## Relationship Pattern

Create a helper that resolves relationships from the current object and selected record:

```jsx
function getRelated(data, objectKey, record) {
  if (objectKey === 'accounts') {
    return {
      opportunities: data.opportunities.filter((item) => item.accountId === record.id),
      contracts: data.contracts.filter((item) => item.accountId === record.id),
      products: data.products.filter((product) =>
        data.opportunities
          .filter((opportunity) => opportunity.accountId === record.id)
          .some((opportunity) => opportunity.productIds.includes(product.id)),
      ),
    }
  }
}
```

Every related record row should be clickable:

```jsx
<button
  className="record-link"
  type="button"
  onClick={() => onSelectRecord('opportunities', opportunity.id)}
>
  {opportunity.name}
</button>
```

Selecting a related record should update the object, selected id, and view mode:

```jsx
function selectRecord(objectKey, id, nextMode = 'record') {
  setSelectedIds((current) => ({ ...current, [objectKey]: id }))
  setActiveObject(objectKey)
  setMode(nextMode)
}
```

## Page Types To Build

### Dashboard

The dashboard should contain:

- Product/project header
- Project cards
- Status and updated metadata
- New project form
- Starter template selector
- Prototype brief field

### List View

A list view should contain:

- Object icon and object plural name
- Table with key fields from `objectMeta`
- Clickable record names
- Primary action button, when relevant

### Record Page

A record page should contain:

- SLDS record header
- Object icon
- Record type label
- Record name
- Header action buttons
- Highlight fields
- Detail card
- Related list cards
- Activity card
- Insight or summary side panel

### Relationship Map

A relationship map should contain:

- Current record as the central context
- Related records as clickable nodes
- Object icons and colors
- Summary explaining how many records are connected

### Action Flow

A guided flow should contain:

- Step indicator
- Current active step
- Form fields
- Primary and secondary actions
- State-changing action handlers

## Executable Actions

Actions should mutate local state so the prototype feels alive.

Examples:

```jsx
function runAction(action) {
  if (action === 'advance-stage') {
    setData((current) => ({
      ...current,
      opportunities: current.opportunities.map((opportunity) =>
        opportunity.id === selectedRecord.id
          ? { ...opportunity, stage: 'Contracting', probability: '90%' }
          : opportunity,
      ),
    }))
    flash('Opportunity moved to Contracting')
  }
}
```

Use modals for confirmable actions:

```jsx
setModal({
  title: 'Reserve inventory',
  body: `Reserve stock for ${selectedRecord.name}.`,
  confirm: 'Reserve stock',
  onConfirm: () => {
    setData(...)
    setModal(null)
    flash('Inventory reserved')
  },
})
```

Use toast feedback:

```jsx
function flash(message) {
  setToast(message)
  window.clearTimeout(flash.timeout)
  flash.timeout = window.setTimeout(() => setToast(''), 2500)
}
```

## Component Guidelines

Use compact, reusable components:

- `Dashboard`
- `Workspace`
- `LivingSalesforcePrototype`
- `AppHeader`
- `AppNav`
- `ObjectList`
- `RecordPage`
- `DetailsCard`
- `RelatedCards`
- `ActivityCard`
- `RelationshipExplorer`
- `ActionFlow`
- `ActionModal`

Keep object-specific logic in metadata and relationship helpers where possible. Avoid hardcoding one page per object unless the object has a genuinely unique workflow.

## CSS Guidelines

Use SLDS classes for Salesforce primitives and custom CSS only to compose the app shell and bridge missing layout needs.

Good custom CSS responsibilities:

- Dashboard layout
- Workspace sidebar
- Object color chips
- Relationship map grid
- Toast positioning
- Modal backdrop
- Responsive behavior

Avoid overriding SLDS deeply unless necessary. Keep cards at small radii such as `4px`, `6px`, or `8px`.

## Prompt Template For Another AI

Use this prompt when asking an AI to create a new product with this style:

```text
Build a high-fidelity Salesforce-style React/Vite prototype using:
- @salesforce-ux/design-system
- @salesforce/design-system-react
- React

Import the SLDS stylesheet globally.
Use SLDS classes for Salesforce page structure.
Use @salesforce/design-system-react Button where appropriate.

Create a living prototype, not a static mockup.
It must include:
- dashboard or workspace entry point
- realistic mock data
- at least 3 related Salesforce-style objects
- list views
- record pages
- related lists
- relationship navigation
- executable actions that mutate local state
- modal confirmation
- toast feedback
- Vercel-ready build

Domain:
[describe the business domain]

Objects:
[list objects and relationships]

Primary users:
[list personas]

Actions:
[list executable actions]

Make the UI feel like Salesforce Lightning, with dense operational layouts, SLDS cards, tables, page headers, global navigation, and record actions.
```

## Quality Checklist

Before finishing, validate:

- `npm run lint`
- `npm run build`
- Every object tab opens
- Every list view has clickable records
- Every record page shows related records
- Relationship map nodes navigate correctly
- At least one modal action works
- At least one direct state update action works
- Toast feedback appears after actions
- The app can deploy to Vercel with output directory `dist`

## Vercel Settings

Use standard Vite settings:

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

## Changelog Discipline

Every meaningful commit should update the main project README changelog with:

- Date
- Summary
- Files or surfaces changed
- Validation performed

Keep the newest changelog entry at the top.
