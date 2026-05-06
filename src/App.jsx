import { Button } from '@salesforce/design-system-react'
import heroImage from './assets/hero.png'
import './App.css'

const contacts = [
  {
    name: 'Ana Carvalho',
    title: 'Chief Operations Officer',
    email: 'ana.carvalho@acme.example',
    phone: '(11) 4002-8844',
  },
  {
    name: 'Rafael Mendes',
    title: 'VP Procurement',
    email: 'rafael.mendes@acme.example',
    phone: '(11) 4002-8845',
  },
  {
    name: 'Julia Santos',
    title: 'Finance Director',
    email: 'julia.santos@acme.example',
    phone: '(11) 4002-8846',
  },
]

const opportunities = [
  {
    name: 'Cloud migration rollout',
    stage: 'Negotiation',
    amount: '$240,000',
    closeDate: 'May 28, 2026',
    owner: 'Camila Rocha',
  },
  {
    name: 'Field service expansion',
    stage: 'Proposal',
    amount: '$118,500',
    closeDate: 'Jun 14, 2026',
    owner: 'Daniel Lima',
  },
  {
    name: 'Einstein analytics pilot',
    stage: 'Discovery',
    amount: '$74,000',
    closeDate: 'Jul 03, 2026',
    owner: 'Marina Costa',
  },
]

const activity = [
  {
    title: 'Follow up on procurement timeline',
    meta: 'Task due today at 4:00 PM',
    tone: 'warning',
  },
  {
    title: 'Quarterly business review completed',
    meta: 'Call logged yesterday by Camila Rocha',
    tone: 'success',
  },
  {
    title: 'Legal requested revised MSA terms',
    meta: 'Email from Rafael Mendes',
    tone: 'info',
  },
]

const workflowSteps = [
  {
    title: 'Describe the Salesforce page',
    text: 'Write the object, target user, fields, actions, related lists, states, and any special behavior in plain language.',
  },
  {
    title: 'Codex assembles the prototype',
    text: 'The React page is composed with Lightning Design System CSS and Salesforce React primitives where they fit cleanly.',
  },
  {
    title: 'Review at product speed',
    text: 'Run it locally or publish to Vercel, then iterate on layout, fields, copy, and interactions directly from feedback.',
  },
]

const promptRules = [
  'Name the Salesforce object and the page type: record page, list view, wizard, console, dashboard, or flow screen.',
  'List visible regions: header actions, highlights panel, tabs, activity, related lists, right rail, modal, or empty state.',
  'Provide realistic record data so the prototype feels like a business review, not a wireframe.',
  'Call out user intent: seller update, service triage, admin setup, executive summary, or approval flow.',
]

function LandingHeader() {
  return (
    <header className="landing-nav">
      <a className="landing-logo" href="#top" aria-label="SF Rapid Prototyping Codex">
        <span>SF</span>
        <strong>Rapid Prototyping Codex</strong>
      </a>
      <nav aria-label="Project sections">
        <a href="#workflow">Workflow</a>
        <a href="#demo">Account demo</a>
        <a href="#stack">Stack</a>
      </nav>
    </header>
  )
}

function LandingHero() {
  return (
    <section className="hero-section" id="top" style={{ '--hero-image': `url(${heroImage})` }}>
      <LandingHeader />
      <div className="hero-content">
        <p className="eyebrow">React + SLDS + Codex</p>
        <h1>SF Rapid Prototyping Codex</h1>
        <p>
          A web project for building high-fidelity Salesforce prototypes from a short page description. Ask for an
          Account, Opportunity, Case, Flow, or console experience and turn it into a deployable React/Vite screen.
        </p>
        <div className="hero-actions">
          <a className="primary-link" href="#demo">
            View Account demo
          </a>
          <a className="secondary-link" href="#prompt-contract">
            Prompt format
          </a>
        </div>
      </div>
    </section>
  )
}

function WorkflowSection() {
  return (
    <section className="section-band" id="workflow">
      <div className="section-heading">
        <p className="eyebrow">Prototype loop</p>
        <h2>From Salesforce idea to reviewable UI in one pass</h2>
      </div>
      <div className="workflow-grid">
        {workflowSteps.map((step, index) => (
          <article className="workflow-card" key={step.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PromptContract() {
  return (
    <section className="split-section" id="prompt-contract">
      <div>
        <p className="eyebrow">Prompt contract</p>
        <h2>Give Codex the page shape, not a pixel spec</h2>
        <p>
          The project is designed for fast product conversations. A good request names the Salesforce surface, the
          record data, the expected actions, and the sections that need to look real enough for stakeholder review.
        </p>
      </div>
      <div className="rules-panel">
        {promptRules.map((rule) => (
          <div className="rule-row" key={rule}>
            <span />
            <p>{rule}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function StackSection() {
  return (
    <section className="section-band stack-band" id="stack">
      <div className="section-heading">
        <p className="eyebrow">Vercel ready</p>
        <h2>Small web stack, Salesforce visual system</h2>
      </div>
      <div className="stack-grid">
        <StackItem title="React 19" text="Component-driven prototype screens with Vite development speed." />
        <StackItem title="SLDS CSS" text="Official Lightning Design System stylesheet for Salesforce visual fidelity." />
        <StackItem title="Design System React" text="Salesforce React components used where the package integrates cleanly." />
        <StackItem title="Vercel" text="Static Vite build output in dist, ready for preview or production deploys." />
      </div>
    </section>
  )
}

function StackItem({ title, text }) {
  return (
    <article className="stack-item">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function AppHeader() {
  return (
    <header className="slds-global-header app-global-header">
      <div className="slds-global-header__item">
        <div className="slds-global-header__logo">
          <span className="brand-mark">sf</span>
        </div>
      </div>
      <div className="slds-global-header__item slds-global-header__item_search">
        <div className="slds-form-element search-shell">
          <label className="slds-assistive-text" htmlFor="global-search">
            Search Salesforce
          </label>
          <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
            <span className="slds-icon_container slds-input__icon slds-input__icon_left">
              <span className="search-dot" />
            </span>
            <input
              className="slds-input slds-input_bare"
              id="global-search"
              placeholder="Search Accounts and more..."
              type="search"
            />
          </div>
        </div>
      </div>
      <nav className="slds-global-header__item app-header-actions" aria-label="Global actions">
        <button className="icon-button" aria-label="Favorites">
          *
        </button>
        <button className="icon-button" aria-label="Create">
          +
        </button>
        <button className="avatar-button" aria-label="User profile">
          CK
        </button>
      </nav>
    </header>
  )
}

function AppNav() {
  const items = ['Home', 'Accounts', 'Contacts', 'Opportunities', 'Leads', 'Reports', 'Dashboards']

  return (
    <div className="slds-context-bar app-nav">
      <div className="slds-context-bar__primary">
        <div className="slds-context-bar__item slds-no-hover">
          <span className="slds-context-bar__label-action">
            <span className="slds-truncate app-name" title="Sales">
              Sales
            </span>
          </span>
        </div>
      </div>
      <nav className="slds-context-bar__secondary" aria-label="Sales app">
        <ul className="slds-grid">
          {items.map((item) => (
            <li
              className={`slds-context-bar__item ${item === 'Accounts' ? 'slds-is-active' : ''}`}
              key={item}
            >
              <a className="slds-context-bar__label-action" href="#demo">
                <span className="slds-truncate" title={item}>
                  {item}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function RecordHeader() {
  return (
    <section className="slds-page-header slds-page-header_record-home record-header">
      <div className="slds-page-header__row">
        <div className="slds-page-header__col-title">
          <div className="slds-media">
            <div className="slds-media__figure">
              <span className="slds-icon_container slds-icon-standard-account object-icon" title="Account">
                A
              </span>
            </div>
            <div className="slds-media__body">
              <div className="slds-page-header__name">
                <div className="slds-page-header__name-title">
                  <h1>
                    <span>Account</span>
                    <span className="slds-page-header__title slds-truncate" title="Acme Global Holdings">
                      Acme Global Holdings
                    </span>
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="slds-page-header__col-actions">
          <div className="slds-page-header__controls">
            <div className="slds-button-group" role="group">
              <Button label="Follow" />
              <Button label="Edit" />
              <Button label="New Contact" />
              <Button label="New Opportunity" variant="brand" />
            </div>
          </div>
        </div>
      </div>
      <div className="slds-page-header__row slds-page-header__row_gutters">
        <div className="slds-page-header__col-details">
          <ul className="slds-page-header__detail-row">
            <HeaderMetric label="Type" value="Customer - Direct" />
            <HeaderMetric label="Industry" value="Technology" />
            <HeaderMetric label="Annual Revenue" value="$18.4M" />
            <HeaderMetric label="Account Owner" value="Camila Rocha" />
            <HeaderMetric label="Health" value="Green" />
          </ul>
        </div>
      </div>
    </section>
  )
}

function HeaderMetric({ label, value }) {
  return (
    <li className="slds-page-header__detail-block">
      <div className="slds-text-title slds-truncate" title={label}>
        {label}
      </div>
      <div className="slds-truncate metric-value" title={value}>
        {value}
      </div>
    </li>
  )
}

function DetailsPanel() {
  return (
    <section className="slds-card detail-panel">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span>Account Details</span>
            </h2>
          </div>
          <Button label="Edit" />
        </header>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <div className="detail-grid">
          <Field label="Account Name" value="Acme Global Holdings" />
          <Field label="Parent Account" value="Acme Group" />
          <Field label="Phone" value="(11) 4002-8800" />
          <Field label="Website" value="www.acmeglobal.example" />
          <Field label="Billing Address" value="Av. Paulista, 1000, Sao Paulo, SP" wide />
          <Field
            label="Description"
            value="Strategic enterprise account expanding service and analytics programs across LATAM."
            wide
          />
        </div>
      </div>
    </section>
  )
}

function Field({ label, value, wide = false }) {
  return (
    <div className={`field-row ${wide ? 'field-row_wide' : ''}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function ActivityPanel() {
  return (
    <section className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span>Activity</span>
            </h2>
          </div>
          <Button label="Log a Call" />
        </header>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <div className="composer slds-box">
          <div className="composer-tabs">
            <button className="active">Task</button>
            <button>Event</button>
            <button>Email</button>
          </div>
          <textarea className="slds-textarea" placeholder="Create a follow-up..." rows="3" />
          <div className="composer-footer">
            <span>Due today</span>
            <Button label="Save" variant="brand" />
          </div>
        </div>
        <ol className="slds-timeline activity-list">
          {activity.map((item) => (
            <li className="slds-timeline__item" key={item.title}>
              <span className={`timeline-dot timeline-dot_${item.tone}`} />
              <div className="slds-media">
                <div className="slds-media__body">
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function RelatedList({ title, rows, columns }) {
  return (
    <section className="slds-card related-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span>{title}</span>
            </h2>
          </div>
          <Button label="New" />
        </header>
      </div>
      <div className="slds-card__body">
        <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_fixed-layout">
          <thead>
            <tr className="slds-line-height_reset">
              {columns.map((column) => (
                <th scope="col" key={column.key}>
                  <div className="slds-truncate" title={column.label}>
                    {column.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="slds-hint-parent" key={row.name}>
                {columns.map((column, index) => (
                  <td key={column.key}>
                    <div className="slds-truncate" title={row[column.key]}>
                      {index === 0 ? <a href="#demo">{row[column.key]}</a> : row[column.key]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="slds-card__footer">
        <a className="slds-card__footer-action" href="#demo">
          View All
        </a>
      </footer>
    </section>
  )
}

function AccountDemo() {
  return (
    <section className="demo-section" id="demo">
      <div className="section-heading">
        <p className="eyebrow">Example output</p>
        <h2>Account record page prototype</h2>
        <p>
          This sample is intentionally realistic: it uses Salesforce navigation patterns, record metadata, related
          lists, account details, and activity composition so stakeholders can react to a near-product surface.
        </p>
      </div>
      <div className="salesforce-shell">
        <AppHeader />
        <AppNav />
        <main className="page-frame">
          <RecordHeader />
          <div className="slds-tabs_default record-tabs">
            <ul className="slds-tabs_default__nav" role="tablist">
              {['Related', 'Details', 'News', 'Activity'].map((tab, index) => (
                <li
                  className={`slds-tabs_default__item ${index === 0 ? 'slds-is-active' : ''}`}
                  key={tab}
                  role="presentation"
                >
                  <a className="slds-tabs_default__link" href="#demo" role="tab">
                    {tab}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="content-layout">
            <div className="primary-column">
              <RelatedList
                title="Contacts"
                rows={contacts}
                columns={[
                  { key: 'name', label: 'Name' },
                  { key: 'title', label: 'Title' },
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                ]}
              />
              <RelatedList
                title="Opportunities"
                rows={opportunities}
                columns={[
                  { key: 'name', label: 'Opportunity Name' },
                  { key: 'stage', label: 'Stage' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'closeDate', label: 'Close Date' },
                  { key: 'owner', label: 'Owner' },
                ]}
              />
            </div>
            <aside className="side-column">
              <ActivityPanel />
              <DetailsPanel />
            </aside>
          </div>
        </main>
      </div>
    </section>
  )
}

function App() {
  return (
    <>
      <LandingHero />
      <WorkflowSection />
      <PromptContract />
      <AccountDemo />
      <StackSection />
    </>
  )
}

export default App
