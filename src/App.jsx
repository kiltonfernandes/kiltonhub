import { useMemo, useState } from 'react'
import { Button } from '@salesforce/design-system-react'
import heroImage from './assets/hero.png'
import './App.css'

const objectMeta = {
  accounts: {
    singular: 'Account',
    plural: 'Accounts',
    icon: 'A',
    color: '#5867e8',
    fields: ['type', 'industry', 'revenue', 'owner', 'health'],
  },
  opportunities: {
    singular: 'Opportunity',
    plural: 'Opportunities',
    icon: 'O',
    color: '#ff5d2d',
    fields: ['stage', 'amount', 'closeDate', 'owner', 'forecast'],
  },
  contracts: {
    singular: 'Contract',
    plural: 'Contracts',
    icon: 'C',
    color: '#06a59a',
    fields: ['status', 'value', 'startDate', 'endDate', 'renewalRisk'],
  },
  products: {
    singular: 'Product',
    plural: 'Products',
    icon: 'P',
    color: '#8a5cf6',
    fields: ['sku', 'category', 'price', 'inventory', 'margin'],
  },
}

const initialData = {
  accounts: [
    {
      id: 'acc-aurora',
      name: 'Aurora Workspaces',
      type: 'Customer - Direct',
      industry: 'Corporate Services',
      revenue: '$18.4M',
      owner: 'Camila Rocha',
      health: 'Green',
      phone: '(11) 4002-8800',
      website: 'auroraworkspaces.example',
      address: 'Av. Paulista, 1000, Sao Paulo, SP',
      summary:
        'Regional workspace operator standardizing office supplies, meeting room devices, and help desk peripherals.',
      contacts: ['Marina Costa', 'Rafael Mendes', 'Ana Carvalho'],
    },
    {
      id: 'acc-northstar',
      name: 'Northstar Logistics',
      type: 'Prospect',
      industry: 'Logistics',
      revenue: '$7.8M',
      owner: 'Daniel Lima',
      health: 'Amber',
      phone: '(21) 3003-4411',
      website: 'northstarlogistics.example',
      address: 'Rua do Porto, 42, Rio de Janeiro, RJ',
      summary: 'Logistics group evaluating warehouse label printers, scanners, ergonomic kits, and support contracts.',
      contacts: ['Bianca Torres', 'Lucas Neri'],
    },
    {
      id: 'acc-bluepeak',
      name: 'BluePeak Manufacturing',
      type: 'Customer - Channel',
      industry: 'Manufacturing',
      revenue: '$12.1M',
      owner: 'Marina Costa',
      health: 'Green',
      phone: '(31) 3555-0177',
      website: 'bluepeakmfg.example',
      address: 'Av. Industrial, 790, Contagem, MG',
      summary: 'Manufacturer buying standardized peripherals and contract replenishment for administrative sites.',
      contacts: ['Pedro Almeida', 'Clara Viana'],
    },
  ],
  opportunities: [
    {
      id: 'opp-office-refresh',
      accountId: 'acc-aurora',
      name: 'Aurora office refresh Q3',
      stage: 'Negotiation',
      amount: '$240,000',
      closeDate: 'May 28, 2026',
      owner: 'Camila Rocha',
      forecast: 'Commit',
      probability: '80%',
      nextStep: 'Confirm product bundle and legal terms',
      productIds: ['prod-ergokit', 'prod-dock', 'prod-printer'],
      contractId: 'con-master-aurora',
    },
    {
      id: 'opp-logistics-peripherals',
      accountId: 'acc-northstar',
      name: 'Warehouse peripherals rollout',
      stage: 'Proposal',
      amount: '$118,500',
      closeDate: 'Jun 14, 2026',
      owner: 'Daniel Lima',
      forecast: 'Best Case',
      probability: '55%',
      nextStep: 'Send revised scanner pricing',
      productIds: ['prod-scanner', 'prod-printer'],
      contractId: 'con-northstar-pilot',
    },
    {
      id: 'opp-executive-kits',
      accountId: 'acc-bluepeak',
      name: 'Executive peripheral kits',
      stage: 'Discovery',
      amount: '$74,000',
      closeDate: 'Jul 03, 2026',
      owner: 'Marina Costa',
      forecast: 'Pipeline',
      probability: '30%',
      nextStep: 'Map locations and procurement calendar',
      productIds: ['prod-webcam', 'prod-dock', 'prod-ergokit'],
      contractId: 'con-bluepeak-supplies',
    },
  ],
  contracts: [
    {
      id: 'con-master-aurora',
      accountId: 'acc-aurora',
      opportunityId: 'opp-office-refresh',
      name: 'Aurora master supply agreement',
      status: 'In Review',
      value: '$680,000',
      startDate: 'Jun 01, 2026',
      endDate: 'May 31, 2027',
      renewalRisk: 'Low',
      terms: 'Quarterly replenishment, 48-hour replacement SLA, price lock for standard catalog.',
      productIds: ['prod-paper', 'prod-ergokit', 'prod-dock', 'prod-printer'],
    },
    {
      id: 'con-northstar-pilot',
      accountId: 'acc-northstar',
      opportunityId: 'opp-logistics-peripherals',
      name: 'Northstar warehouse pilot',
      status: 'Draft',
      value: '$96,000',
      startDate: 'Jul 01, 2026',
      endDate: 'Dec 31, 2026',
      renewalRisk: 'Medium',
      terms: 'Pilot covering scanners, label printers, spare batteries, and depot support.',
      productIds: ['prod-scanner', 'prod-printer'],
    },
    {
      id: 'con-bluepeak-supplies',
      accountId: 'acc-bluepeak',
      opportunityId: 'opp-executive-kits',
      name: 'BluePeak recurring supplies',
      status: 'Activated',
      value: '$310,000',
      startDate: 'Jan 01, 2026',
      endDate: 'Dec 31, 2026',
      renewalRisk: 'Low',
      terms: 'Monthly office supply replenishment and annual hardware refresh credit.',
      productIds: ['prod-paper', 'prod-webcam', 'prod-dock'],
    },
  ],
  products: [
    {
      id: 'prod-paper',
      name: 'CopyPro Premium Paper Case',
      sku: 'OFF-PAPER-5000',
      category: 'Office Supplies',
      price: '$42.00',
      inventory: '8,400 cases',
      margin: '31%',
      description: 'High-volume premium copy paper for managed office supply programs.',
    },
    {
      id: 'prod-ergokit',
      name: 'ErgoDesk Starter Kit',
      sku: 'PER-ERGO-110',
      category: 'Peripherals',
      price: '$189.00',
      inventory: '1,120 kits',
      margin: '38%',
      description: 'Keyboard, mouse, wrist rest, and monitor riser bundle for hybrid work.',
    },
    {
      id: 'prod-dock',
      name: 'Apex USB-C Docking Station',
      sku: 'PER-DOCK-8K',
      category: 'Peripherals',
      price: '$249.00',
      inventory: '640 units',
      margin: '42%',
      description: 'Dual display USB-C dock for executive, sales, and operations teams.',
    },
    {
      id: 'prod-printer',
      name: 'LabelJet Pro 420',
      sku: 'WH-LBL-420',
      category: 'Warehouse Devices',
      price: '$399.00',
      inventory: '210 units',
      margin: '35%',
      description: 'Compact thermal label printer for warehouses, mail rooms, and supply cages.',
    },
    {
      id: 'prod-scanner',
      name: 'ScanSwift Rugged Scanner',
      sku: 'WH-SCAN-R2',
      category: 'Warehouse Devices',
      price: '$529.00',
      inventory: '180 units',
      margin: '33%',
      description: 'Rugged barcode scanner with depot replacement and cradle options.',
    },
    {
      id: 'prod-webcam',
      name: 'ClearMeet 4K Webcam',
      sku: 'PER-CAM-4K',
      category: 'Peripherals',
      price: '$159.00',
      inventory: '900 units',
      margin: '40%',
      description: '4K webcam for meeting rooms, executive kits, and remote teams.',
    },
  ],
}

const starterProjects = [
  {
    id: 'office-supply-growth',
    name: 'Office supply growth cockpit',
    templateId: 'sales',
    status: 'Ready for review',
    updated: 'Today',
    description: 'Multi-object Salesforce prototype for accounts, opportunities, contracts, and products.',
  },
  {
    id: 'peripheral-renewals',
    name: 'Peripheral renewal desk',
    templateId: 'renewal',
    status: 'Draft',
    updated: 'Yesterday',
    description: 'Contract renewal experience for office peripherals and managed replenishment.',
  },
]

const templates = [
  {
    id: 'sales',
    name: 'Sales operating system',
    summary: 'Account, opportunity, contract, and product record pages connected through a live sales workflow.',
  },
  {
    id: 'renewal',
    name: 'Contract renewal workspace',
    summary: 'Renewal pipeline, account health, product coverage, contract actions, and follow-up tasks.',
  },
  {
    id: 'catalog',
    name: 'Product catalog planning',
    summary: 'Product list, demand signals, active deals, contract coverage, and inventory-sensitive actions.',
  },
]

function currencyToNumber(value) {
  return Number(value.replace(/[^0-9.-]+/g, ''))
}

function findById(items, id) {
  return items.find((item) => item.id === id)
}

function getRelated(data, objectKey, record) {
  if (!record) {
    return {}
  }

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

  if (objectKey === 'opportunities') {
    return {
      account: findById(data.accounts, record.accountId),
      contract: findById(data.contracts, record.contractId),
      products: data.products.filter((product) => record.productIds.includes(product.id)),
    }
  }

  if (objectKey === 'contracts') {
    return {
      account: findById(data.accounts, record.accountId),
      opportunity: findById(data.opportunities, record.opportunityId),
      products: data.products.filter((product) => record.productIds.includes(product.id)),
    }
  }

  return {
    opportunities: data.opportunities.filter((opportunity) => opportunity.productIds.includes(record.id)),
    contracts: data.contracts.filter((contract) => contract.productIds.includes(record.id)),
    accounts: data.accounts.filter((account) =>
      data.opportunities.some(
        (opportunity) => opportunity.accountId === account.id && opportunity.productIds.includes(record.id),
      ),
    ),
  }
}

function LandingPage({ onOpenApp }) {
  return (
    <>
      <button className="floating-dashboard-button" type="button" onClick={onOpenApp}>
        Open project dashboard
      </button>
      <section className="hero-section" id="top" style={{ '--hero-image': `url(${heroImage})` }}>
        <header className="landing-nav">
          <a className="landing-logo" href="#top" aria-label="SF Rapid Prototyping Codex">
            <span>SF</span>
            <strong>Rapid Prototyping Codex</strong>
          </a>
          <nav aria-label="Project sections">
            <a href="#workflow">Workflow</a>
            <a href="#demo">Live demo</a>
            <a href="#stack">Stack</a>
          </nav>
        </header>
        <div className="hero-content">
          <p className="eyebrow">React + SLDS + Codex</p>
          <h1>Living Salesforce prototypes from plain language</h1>
          <p>
            Create multi-object, high-fidelity Salesforce demos with Accounts, Opportunities, Contracts, Products,
            relationships, record pages, list views, and executable actions.
          </p>
          <div className="hero-actions">
            <button className="primary-link button-reset" type="button" onClick={onOpenApp}>
              Open app
            </button>
            <a className="secondary-link" href="#workflow">
              View workflow
            </a>
          </div>
        </div>
      </section>
      <section className="section-band" id="workflow">
        <div className="section-heading">
          <p className="eyebrow">Prototype loop</p>
          <h2>From page request to navigable Salesforce system</h2>
          <p>
            Describe the objects, users, fields, relationships, actions, and states. Codex turns that into a web
            prototype that can be deployed to Vercel and reviewed by stakeholders.
          </p>
        </div>
        <div className="workflow-grid">
          {['Model objects', 'Render Salesforce pages', 'Execute prototype actions'].map((title, index) => (
            <article className="workflow-card" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>
                {index === 0
                  ? 'Use mock business data with relationships instead of disconnected screenshots.'
                  : null}
                {index === 1 ? 'Use SLDS patterns for record pages, lists, tabs, cards, and action bars.' : null}
                {index === 2 ? 'Let buttons open modals, create tasks, update statuses, and move through flows.' : null}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="demo-section" id="demo">
        <div className="section-heading">
          <p className="eyebrow">Included demo</p>
          <h2>Office supplies and peripherals sales prototype</h2>
          <p>The app includes a live connected dataset for a fictional B2B supplier.</p>
        </div>
        <LivingSalesforcePrototype compact />
      </section>
      <section className="section-band stack-band" id="stack">
        <div className="section-heading">
          <p className="eyebrow">Vercel ready</p>
          <h2>Small web stack, Salesforce visual system</h2>
        </div>
        <div className="stack-grid">
          {['React 19', 'Vite', 'SLDS CSS', 'Design System React'].map((item) => (
            <article className="stack-item" key={item}>
              <h3>{item}</h3>
              <p>Part of the deployable web prototype stack.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function ProductTopBar({ onShowLanding }) {
  return (
    <header className="product-topbar">
      <a className="product-logo" href="#projects" aria-label="SF Rapid Prototyping Codex">
        <span>SF</span>
        <strong>Rapid Prototyping Codex</strong>
      </a>
      <nav aria-label="Product navigation">
        <a href="#projects">Projects</a>
        <a href="#create">New prototype</a>
        <button type="button" onClick={onShowLanding}>
          About
        </button>
      </nav>
    </header>
  )
}

function Dashboard({ projects, onCreateProject, onOpenProject, onShowLanding }) {
  const [draft, setDraft] = useState({
    name: '',
    templateId: 'sales',
    description: '',
  })
  const selectedTemplate = templates.find((template) => template.id === draft.templateId) ?? templates[0]

  function handleSubmit(event) {
    event.preventDefault()
    const name = draft.name.trim() || 'New Salesforce prototype'
    onCreateProject({
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name,
      templateId: draft.templateId,
      status: 'Draft',
      updated: 'Just now',
      description: draft.description.trim() || selectedTemplate.summary,
    })
    setDraft({ name: '', templateId: 'sales', description: '' })
  }

  return (
    <div className="product-shell">
      <ProductTopBar onShowLanding={onShowLanding} />
      <main className="dashboard-page" id="projects">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Prototype command center</p>
            <h1>Manage living Salesforce prototypes</h1>
            <p>
              Create projects with connected objects, then open a live workspace where every record page, related list,
              and action is clickable.
            </p>
          </div>
          <div className="dashboard-metrics" aria-label="Prototype metrics">
            <MetricCard label="Objects" value="04" />
            <MetricCard label="Actions" value="12" />
            <MetricCard label="Vercel" value="Ready" />
          </div>
        </section>
        <section className="dashboard-grid">
          <div className="projects-panel">
            <div className="panel-heading-row">
              <div>
                <p className="eyebrow">Projects</p>
                <h2>Prototype library</h2>
              </div>
              <a className="small-action" href="#create">
                Create
              </a>
            </div>
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div className="project-accent" />
                  <div>
                    <span className="project-object">Salesforce prototype</span>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                  </div>
                  <div className="project-meta">
                    <span>{project.status}</span>
                    <span>{project.updated}</span>
                  </div>
                  <button type="button" onClick={() => onOpenProject(project.id)}>
                    Open prototype
                  </button>
                </article>
              ))}
            </div>
          </div>
          <form className="create-panel" id="create" onSubmit={handleSubmit}>
            <p className="eyebrow">New project</p>
            <h2>Create a navigable prototype</h2>
            <label>
              <span>Project name</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="Example: Contract renewal desk"
              />
            </label>
            <label>
              <span>Prototype starter</span>
              <select
                value={draft.templateId}
                onChange={(event) => setDraft({ ...draft, templateId: event.target.value })}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Brief</span>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                placeholder="Describe pages, actions, fields, and relationships."
                rows="5"
              />
            </label>
            <div className="template-preview">
              <strong>{selectedTemplate.name}</strong>
              <p>{selectedTemplate.summary}</p>
            </div>
            <button className="primary-link button-reset" type="submit">
              Create project
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Workspace({ project, onBack }) {
  return (
    <div className="workspace-product-shell">
      <aside className="workspace-sidebar">
        <button className="back-button" type="button" onClick={onBack}>
          Back to projects
        </button>
        <div className="workspace-title">
          <span>SF</span>
          <div>
            <p>Living prototype</p>
            <h1>{project.name}</h1>
          </div>
        </div>
        <div className="workspace-brief">
          <strong>Office supplies and peripherals</strong>
          <p>{project.description}</p>
        </div>
        <div className="relationship-map">
          <span>Account</span>
          <span>Opportunity</span>
          <span>Contract</span>
          <span>Product</span>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Prototype workspace</p>
            <h2>Connected Salesforce operating system</h2>
            <p>Navigate every object, inspect relationships, and execute actions directly inside the prototype.</p>
          </div>
          <div className="workspace-actions">
            <Button label="Share" />
            <Button label="Request review" variant="brand" />
          </div>
        </header>
        <LivingSalesforcePrototype />
      </main>
    </div>
  )
}

function AppHeader({ toast }) {
  return (
    <header className="slds-global-header app-global-header">
      <div className="slds-global-header__item">
        <div className="slds-global-header__logo">
          <span className="brand-mark">sf</span>
        </div>
      </div>
      <div className="slds-global-header__item slds-global-header__item_search">
        <label className="slds-assistive-text" htmlFor="global-search">
          Search Salesforce
        </label>
        <input className="slds-input search-input" id="global-search" placeholder="Search Accounts and more..." />
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
      {toast ? <div className="prototype-toast">{toast}</div> : null}
    </header>
  )
}

function AppNav({ activeObject, onSelectObject }) {
  return (
    <div className="slds-context-bar app-nav">
      <div className="slds-context-bar__primary">
        <div className="slds-context-bar__item slds-no-hover">
          <span className="slds-context-bar__label-action">
            <span className="slds-truncate app-name" title="OfficeOps Sales">
              OfficeOps Sales
            </span>
          </span>
        </div>
      </div>
      <nav className="slds-context-bar__secondary" aria-label="Sales app">
        <ul className="slds-grid">
          {Object.entries(objectMeta).map(([key, meta]) => (
            <li className={`slds-context-bar__item ${key === activeObject ? 'slds-is-active' : ''}`} key={key}>
              <button className="slds-context-bar__label-action nav-tab-button" type="button" onClick={() => onSelectObject(key)}>
                <span className="slds-truncate">{meta.plural}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function LivingSalesforcePrototype({ compact = false }) {
  const [data, setData] = useState(initialData)
  const [activeObject, setActiveObject] = useState('accounts')
  const [selectedIds, setSelectedIds] = useState({
    accounts: 'acc-aurora',
    opportunities: 'opp-office-refresh',
    contracts: 'con-master-aurora',
    products: 'prod-ergokit',
  })
  const [mode, setMode] = useState('record')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [tasks, setTasks] = useState([
    'Confirm Aurora product bundle',
    'Send Northstar scanner discount approval',
    'Check BluePeak renewal inventory reserve',
  ])

  const meta = objectMeta[activeObject]
  const records = data[activeObject]
  const selectedRecord = findById(records, selectedIds[activeObject]) ?? records[0]
  const related = getRelated(data, activeObject, selectedRecord)

  function flash(message) {
    setToast(message)
    window.clearTimeout(flash.timeout)
    flash.timeout = window.setTimeout(() => setToast(''), 2500)
  }

  function selectRecord(objectKey, id, nextMode = 'record') {
    setSelectedIds((current) => ({ ...current, [objectKey]: id }))
    setActiveObject(objectKey)
    setMode(nextMode)
  }

  function runAction(action) {
    if (action === 'new-opportunity') {
      setModal({
        title: 'New opportunity',
        body: 'Create a new office supplies opportunity for the selected account.',
        confirm: 'Create opportunity',
        onConfirm: () => {
          const newOpportunity = {
            id: `opp-${Date.now()}`,
            accountId: activeObject === 'accounts' ? selectedRecord.id : 'acc-aurora',
            name: 'Workplace supplies expansion',
            stage: 'Qualification',
            amount: '$52,000',
            closeDate: 'Aug 15, 2026',
            owner: 'Camila Rocha',
            forecast: 'Pipeline',
            probability: '20%',
            nextStep: 'Schedule discovery with procurement',
            productIds: ['prod-paper', 'prod-ergokit'],
            contractId: 'con-master-aurora',
          }
          setData((current) => ({ ...current, opportunities: [newOpportunity, ...current.opportunities] }))
          setSelectedIds((current) => ({ ...current, opportunities: newOpportunity.id }))
          setActiveObject('opportunities')
          setMode('record')
          setModal(null)
          flash('Opportunity created')
        },
      })
      return
    }

    if (action === 'activate-contract') {
      setData((current) => ({
        ...current,
        contracts: current.contracts.map((contract) =>
          contract.id === selectedRecord.id ? { ...contract, status: 'Activated', renewalRisk: 'Low' } : contract,
        ),
      }))
      flash('Contract activated')
      return
    }

    if (action === 'reserve-inventory') {
      setModal({
        title: 'Reserve inventory',
        body: `Reserve stock for ${selectedRecord.name} across active opportunities and contracts.`,
        confirm: 'Reserve stock',
        onConfirm: () => {
          setData((current) => ({
            ...current,
            products: current.products.map((product) =>
              product.id === selectedRecord.id ? { ...product, inventory: 'Reserved for active deals' } : product,
            ),
          }))
          setModal(null)
          flash('Inventory reserved')
        },
      })
      return
    }

    if (action === 'create-task') {
      const task = `Follow up on ${selectedRecord.name}`
      setTasks((current) => [task, ...current])
      flash('Task added to activity')
      return
    }

    if (action === 'advance-stage') {
      setData((current) => ({
        ...current,
        opportunities: current.opportunities.map((opportunity) =>
          opportunity.id === selectedRecord.id ? { ...opportunity, stage: 'Contracting', probability: '90%' } : opportunity,
        ),
      }))
      flash('Opportunity moved to Contracting')
    }
  }

  return (
    <div className={`salesforce-shell ${compact ? 'compact-prototype' : ''}`}>
      <AppHeader toast={toast} />
      <AppNav activeObject={activeObject} onSelectObject={(key) => { setActiveObject(key); setMode('list') }} />
      <main className="page-frame">
        <div className="prototype-modebar">
          <div>
            <p className="eyebrow">OfficeOps Distribution</p>
            <h2>Office supplies and peripherals relationship model</h2>
          </div>
          <div className="segmented-control">
            {['list', 'record', 'relationships', 'flow'].map((item) => (
              <button className={mode === item ? 'active' : ''} type="button" key={item} onClick={() => setMode(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {mode === 'list' ? (
          <ObjectList meta={meta} records={records} activeObject={activeObject} onSelectRecord={selectRecord} />
        ) : null}
        {mode === 'record' ? (
          <RecordPage
            meta={meta}
            objectKey={activeObject}
            record={selectedRecord}
            related={related}
            tasks={tasks}
            onSelectRecord={selectRecord}
            onAction={runAction}
          />
        ) : null}
        {mode === 'relationships' ? (
          <RelationshipExplorer
            data={data}
            activeObject={activeObject}
            record={selectedRecord}
            related={related}
            onSelectRecord={selectRecord}
          />
        ) : null}
        {mode === 'flow' ? <ActionFlow record={selectedRecord} objectKey={activeObject} onAction={runAction} /> : null}
      </main>
      {modal ? <ActionModal modal={modal} onClose={() => setModal(null)} /> : null}
    </div>
  )
}

function ObjectList({ meta, records, activeObject, onSelectRecord }) {
  return (
    <section className="slds-card related-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <span className="object-icon list-object-icon" style={{ background: meta.color }}>
            {meta.icon}
          </span>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span>{meta.plural}</span>
            </h2>
          </div>
        </header>
      </div>
      <div className="slds-card__body">
        <table className="slds-table slds-table_cell-buffer slds-table_bordered">
          <thead>
            <tr>
              <th>Name</th>
              {meta.fields.map((field) => (
                <th key={field}>{field}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>
                  <button className="record-link" type="button" onClick={() => onSelectRecord(activeObject, record.id)}>
                    {record.name}
                  </button>
                </td>
                {meta.fields.map((field) => (
                  <td key={`${record.id}-${field}`}>{record[field]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function RecordPage({ meta, objectKey, record, related, tasks, onSelectRecord, onAction }) {
  const actions = {
    accounts: [
      ['new-opportunity', 'New Opportunity'],
      ['create-task', 'Create Task'],
    ],
    opportunities: [
      ['advance-stage', 'Advance Stage'],
      ['create-task', 'Create Task'],
    ],
    contracts: [
      ['activate-contract', 'Activate Contract'],
      ['create-task', 'Create Task'],
    ],
    products: [
      ['reserve-inventory', 'Reserve Inventory'],
      ['create-task', 'Create Task'],
    ],
  }[objectKey]

  return (
    <>
      <section className="slds-page-header slds-page-header_record-home record-header">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="object-icon" style={{ background: meta.color }}>
                  {meta.icon}
                </span>
              </div>
              <div className="slds-media__body">
                <h1>
                  <span>{meta.singular}</span>
                  <span className="slds-page-header__title slds-truncate">{record.name}</span>
                </h1>
              </div>
            </div>
          </div>
          <div className="slds-page-header__col-actions">
            <div className="slds-button-group" role="group">
              {actions.map(([id, label]) => (
                <Button key={id} label={label} variant={id === actions[0][0] ? 'brand' : undefined} onClick={() => onAction(id)} />
              ))}
            </div>
          </div>
        </div>
        <div className="slds-page-header__row slds-page-header__row_gutters">
          <ul className="slds-page-header__detail-row">
            {meta.fields.map((field) => (
              <li className="slds-page-header__detail-block" key={field}>
                <div className="slds-text-title slds-truncate">{field}</div>
                <div className="metric-value slds-truncate">{record[field]}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="content-layout">
        <div className="primary-column">
          <DetailsCard objectKey={objectKey} record={record} />
          <RelatedCards objectKey={objectKey} related={related} onSelectRecord={onSelectRecord} />
        </div>
        <aside className="side-column">
          <ActivityCard tasks={tasks} record={record} />
          <InsightCard objectKey={objectKey} record={record} related={related} />
        </aside>
      </div>
    </>
  )
}

function DetailsCard({ objectKey, record }) {
  const entries = Object.entries(record).filter(([key]) => !['id', 'productIds', 'accountId', 'opportunityId', 'contractId'].includes(key))
  return (
    <section className="slds-card detail-panel">
      <div className="slds-card__header">
        <h2 className="slds-card__header-title">
          <span>{objectMeta[objectKey].singular} Details</span>
        </h2>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <div className="detail-grid">
          {entries.map(([key, value]) => (
            <div className={key === 'summary' || key === 'description' || key === 'terms' ? 'field-row field-row_wide' : 'field-row'} key={key}>
              <dt>{key}</dt>
              <dd>{Array.isArray(value) ? value.join(', ') : value}</dd>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RelatedCards({ objectKey, related, onSelectRecord }) {
  const relatedMap = {
    accounts: [
      ['opportunities', related.opportunities],
      ['contracts', related.contracts],
      ['products', related.products],
    ],
    opportunities: [
      ['accounts', related.account ? [related.account] : []],
      ['contracts', related.contract ? [related.contract] : []],
      ['products', related.products],
    ],
    contracts: [
      ['accounts', related.account ? [related.account] : []],
      ['opportunities', related.opportunity ? [related.opportunity] : []],
      ['products', related.products],
    ],
    products: [
      ['accounts', related.accounts],
      ['opportunities', related.opportunities],
      ['contracts', related.contracts],
    ],
  }[objectKey]

  return relatedMap.map(([key, rows]) => (
    <section className="slds-card related-card" key={key}>
      <div className="slds-card__header">
        <h2 className="slds-card__header-title">
          <span>{objectMeta[key].plural}</span>
        </h2>
      </div>
      <div className="slds-card__body">
        {rows.length ? (
          <table className="slds-table slds-table_cell-buffer slds-table_bordered">
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <button className="record-link" type="button" onClick={() => onSelectRecord(key, row.id)}>
                      {row.name}
                    </button>
                  </td>
                  <td>{row.owner || row.status || row.category || row.stage || row.type}</td>
                  <td>{row.amount || row.value || row.price || row.revenue || row.health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-related">No related records.</p>
        )}
      </div>
    </section>
  ))
}

function ActivityCard({ tasks, record }) {
  return (
    <section className="slds-card">
      <div className="slds-card__header">
        <h2 className="slds-card__header-title">
          <span>Activity</span>
        </h2>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <div className="composer slds-box">
          <div className="composer-tabs">
            <button className="active">Task</button>
            <button>Email</button>
            <button>Call</button>
          </div>
          <textarea className="slds-textarea" defaultValue={`Follow up on ${record.name}`} rows="3" />
        </div>
        <ol className="activity-list">
          {tasks.slice(0, 5).map((task) => (
            <li key={task}>
              <span className="timeline-dot timeline-dot_info" />
              <div>
                <h3>{task}</h3>
                <p>Open task in prototype queue</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function InsightCard({ objectKey, record, related }) {
  const total = objectKey === 'accounts' ? related.opportunities.reduce((sum, item) => sum + currencyToNumber(item.amount), 0) : 0
  return (
    <section className="slds-card insight-card">
      <div className="slds-card__header">
        <h2 className="slds-card__header-title">
          <span>Prototype intelligence</span>
        </h2>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <strong>{objectKey === 'accounts' ? `$${total.toLocaleString()} open pipeline` : record.name}</strong>
        <p>
          {objectKey === 'accounts'
            ? 'Account view connects pipeline, contracts, and covered products.'
            : 'This record is linked to the wider office supplies operating model.'}
        </p>
      </div>
    </section>
  )
}

function RelationshipExplorer({ data, activeObject, record, related, onSelectRecord }) {
  const nodes = [
    { key: activeObject, record },
    ...Object.entries(related).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => ({ key, record: item }))
      }
      return value ? [{ key, record: value }] : []
    }),
  ]

  return (
    <section className="relationship-canvas">
      <div className="section-heading">
        <p className="eyebrow">Relationship map</p>
        <h2>{record.name}</h2>
        <p>Click any node to jump to that Salesforce record page.</p>
      </div>
      <div className="relationship-grid">
        {nodes.map((node) => {
          const key = node.key === 'account' ? 'accounts' : node.key === 'contract' ? 'contracts' : node.key === 'opportunity' ? 'opportunities' : node.key
          const meta = objectMeta[key]
          return (
            <button className="relationship-node" key={`${key}-${node.record.id}`} type="button" onClick={() => onSelectRecord(key, node.record.id)}>
              <span style={{ background: meta.color }}>{meta.icon}</span>
              <strong>{node.record.name}</strong>
              <small>{meta.singular}</small>
            </button>
          )
        })}
      </div>
      <div className="relationship-summary">
        <strong>System model</strong>
        <p>
          {data.accounts.length} accounts, {data.opportunities.length} opportunities, {data.contracts.length} contracts,
          and {data.products.length} products are connected in this prototype.
        </p>
      </div>
    </section>
  )
}

function ActionFlow({ record, objectKey, onAction }) {
  const primaryAction = {
    accounts: ['new-opportunity', 'Create opportunity'],
    opportunities: ['advance-stage', 'Advance stage'],
    contracts: ['activate-contract', 'Activate contract'],
    products: ['reserve-inventory', 'Reserve inventory'],
  }[objectKey]

  return (
    <section className="slds-card flow-screen">
      <div className="slds-card__header">
        <h2 className="slds-card__header-title">
          <span>{objectMeta[objectKey].singular} action flow</span>
        </h2>
      </div>
      <div className="slds-card__body slds-card__body_inner">
        <div className="flow-path-row">
          {['Select record', 'Review relationships', 'Execute action', 'Confirm outcome'].map((step, index) => (
            <div className={`flow-step ${index === 2 ? 'active' : ''}`} key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
        <div className="flow-form-grid">
          <label>
            <span>Record</span>
            <input className="slds-input" value={record.name} readOnly />
          </label>
          <label>
            <span>Priority</span>
            <select className="slds-select" defaultValue="High">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <label className="flow-wide">
            <span>Action note</span>
            <textarea className="slds-textarea" defaultValue={`Execute next best action for ${record.name}.`} rows="4" />
          </label>
        </div>
        <div className="flow-footer">
          <Button label="Create Task" onClick={() => onAction('create-task')} />
          <Button label={primaryAction[1]} variant="brand" onClick={() => onAction(primaryAction[0])} />
        </div>
      </div>
    </section>
  )
}

function ActionModal({ modal, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="slds-modal slds-fade-in-open prototype-modal" role="dialog" aria-modal="true">
        <div className="slds-modal__container">
          <header className="slds-modal__header">
            <h2 className="slds-modal__title">{modal.title}</h2>
          </header>
          <div className="slds-modal__content slds-p-around_medium">
            <p>{modal.body}</p>
          </div>
          <footer className="slds-modal__footer">
            <Button label="Cancel" onClick={onClose} />
            <Button label={modal.confirm} variant="brand" onClick={modal.onConfirm} />
          </footer>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [view, setView] = useState('dashboard')
  const [projects, setProjects] = useState(starterProjects)
  const [activeProjectId, setActiveProjectId] = useState(starterProjects[0].id)
  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId, projects],
  )

  function createProject(project) {
    setProjects((current) => [project, ...current])
    setActiveProjectId(project.id)
    setView('workspace')
  }

  if (view === 'landing') {
    return <LandingPage onOpenApp={() => setView('dashboard')} />
  }

  if (view === 'workspace' && activeProject) {
    return <Workspace project={activeProject} onBack={() => setView('dashboard')} />
  }

  return (
    <Dashboard
      projects={projects}
      onCreateProject={createProject}
      onOpenProject={(projectId) => {
        setActiveProjectId(projectId)
        setView('workspace')
      }}
      onShowLanding={() => setView('landing')}
    />
  )
}

export default App
