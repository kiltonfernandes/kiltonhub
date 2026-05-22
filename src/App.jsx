import { useEffect, useMemo, useState } from 'react'
import './App.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' })

const statusLabel = {
  Approved: 'Aprovado',
  Blocked: 'Bloqueado',
  Canceled: 'Cancelado',
  Done: 'Concluido',
  'In progress': 'Em andamento',
  Merged: 'Mesclado',
  New: 'Novo',
  Open: 'Aberto',
  Rejected: 'Rejeitado',
  Waiting: 'Aguardando',
  'Needs review': 'Revisar',
  checked: 'Concluido',
  done: 'Fechado',
  open: 'Aberto',
  waiting: 'Aguardando',
}

const groupOptions = [
  ['company', 'Empresa'],
  ['pillar', 'Pillar'],
  ['owner', 'Owner'],
  ['status', 'Status'],
  ['severity', 'Severidade'],
  ['source', 'Origem'],
  ['date', 'Data'],
  ['type', 'Tipo'],
  ['dependency', 'Dependencia'],
]

const sortOptions = [
  ['updated_at', 'Atualizacao'],
  ['date', 'Data'],
  ['severity', 'Severidade'],
  ['priority', 'Prioridade'],
  ['confidence', 'Confianca'],
  ['company', 'Empresa'],
  ['pillar', 'Pillar'],
  ['status', 'Status'],
]

const completedStorageKey = 'meeting-cockpit.completed-actions.v1'

function readCompletedActions() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(completedStorageKey) ?? '{}')
  } catch {
    return {}
  }
}

function formatDate(date) {
  if (!date) return 'Sem data'
  return dateFormatter.format(new Date(`${date.slice(0, 10)}T00:00:00Z`)).replace('.', '')
}

function formatMonth(month) {
  return monthFormatter.format(new Date(`${month}-01T00:00:00Z`)).replace('.', '')
}

function normalizeText(value, fallback = 'TBD') {
  return value && String(value).trim() ? String(value).trim() : fallback
}

function severityRank(value) {
  return { Critical: 5, High: 4, Medium: 3, Low: 2, Info: 1 }[value] ?? 0
}

function priorityRank(value) {
  return { Urgent: 5, High: 4, Medium: 3, Low: 2, Backlog: 1 }[value] ?? 0
}

function getComparable(item, key) {
  if (key === 'severity') return severityRank(item.severity)
  if (key === 'priority') return priorityRank(item.priority)
  if (key === 'confidence') return Number(item.confidence ?? 0)
  if (key === 'updated_at' || key === 'date') return new Date(item[key] || item.date || 0).getTime()
  return String(item[key] ?? '').toLowerCase()
}

function sortItems(items, sortBy) {
  return [...items].sort((left, right) => {
    const a = getComparable(left, sortBy)
    const b = getComparable(right, sortBy)
    if (typeof a === 'number' && typeof b === 'number') return b - a
    return String(a).localeCompare(String(b), 'pt-BR')
  })
}

function groupItems(items, groupBy) {
  return items.reduce((groups, item) => {
    const value = normalizeText(item[groupBy], 'Sem valor')
    groups[value] = groups[value] ?? []
    groups[value].push(item)
    return groups
  }, {})
}

function fallbackHub(analytics, completedActions) {
  const tasks = analytics.actions.map((item) => ({
    ...item,
    company: item.company ?? item.pillar,
    confidence: item.confidence ?? 0.72,
    dependency: item.dependency ?? 'TBD',
    priority: item.priority ?? 'Medium',
    source: item.meeting_title,
    source_excerpt: item.text,
    status: completedActions[item.id] ? 'Done' : statusLabel[item.status] ?? 'Open',
    type: 'Task',
    updated_at: item.date,
  }))
  const risks = analytics.blockers.map((item, index) => ({
    ...item,
    id: `${item.date}-${item.pillar}-${index}-${item.text.slice(0, 32)}`,
    company: item.company ?? item.pillar,
    confidence: item.confidence ?? 0.7,
    dependency: item.dependency ?? 'TBD',
    owner: item.owner ?? 'TBD',
    priority: item.priority ?? 'High',
    severity: item.severity ?? 'High',
    source: item.meeting_title,
    source_excerpt: item.text,
    status: item.status ?? 'Open',
    type: 'Risk',
    updated_at: item.date,
  }))
  const decisions = analytics.decisions.map((item, index) => ({
    ...item,
    id: item.id ?? `decision-${index}`,
    company: item.company ?? item.pillar,
    confidence: item.confidence ?? 0.68,
    source: item.meeting_title,
    source_excerpt: item.text,
    status: item.status ?? 'Approved',
    type: 'Decision',
    updated_at: item.date,
  }))
  const questions = analytics.questions.map((item, index) => ({
    ...item,
    id: item.id ?? `question-${index}`,
    company: item.company ?? item.pillar,
    confidence: item.confidence ?? 0.62,
    source: item.meeting_title,
    source_excerpt: item.text,
    status: item.status ?? 'Open',
    type: 'Question',
    updated_at: item.date,
  }))
  return {
    source: 'fallback',
    generated_at: analytics.generated_at,
    triage: [...tasks.slice(0, 16), ...risks.slice(0, 8), ...decisions.slice(0, 8), ...questions.slice(0, 8)].map((item) => ({
      ...item,
      triage_status: item.triage_status ?? 'New',
    })),
    tasks,
    decisions,
    risks,
    questions,
  }
}

function App() {
  const [analytics, setAnalytics] = useState(null)
  const [hub, setHub] = useState(null)
  const [selectedPillar, setSelectedPillar] = useState('Todos')
  const [selectedEpic, setSelectedEpic] = useState('Todos')
  const [query, setQuery] = useState('')
  const [riskQuery, setRiskQuery] = useState('')
  const [expandedRiskId, setExpandedRiskId] = useState(null)
  const [completedActions, setCompletedActions] = useState(readCompletedActions)
  const [showCompletedActions, setShowCompletedActions] = useState(false)
  const [riskGroupBy, setRiskGroupBy] = useState('company')
  const [riskSortBy, setRiskSortBy] = useState('severity')
  const [taskWriteState, setTaskWriteState] = useState('idle')

  useEffect(() => {
    fetch('/data/meeting_analytics.json')
      .then((response) => response.json())
      .then(setAnalytics)
  }, [])

  useEffect(() => {
    fetch('/api/notion-hub')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.ready) setHub(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem(completedStorageKey, JSON.stringify(completedActions))
  }, [completedActions])

  const hubData = useMemo(() => {
    if (hub) return hub
    if (analytics) return fallbackHub(analytics, completedActions)
    return null
  }, [analytics, completedActions, hub])

  const pillars = analytics?.pillars ?? []
  const epics = analytics?.epics ?? []

  const filteredMeetings = useMemo(() => {
    if (!analytics) return []
    const needle = query.trim().toLowerCase()
    return analytics.meetings.filter((meeting) => {
      const matchesPillar = selectedPillar === 'Todos' || meeting.pillar === selectedPillar
      const matchesEpic = selectedEpic === 'Todos' || meeting.epic === selectedEpic
      const matchesQuery =
        !needle ||
        [meeting.title, meeting.summary, meeting.pillar, meeting.epic].join(' ').toLowerCase().includes(needle)
      return matchesPillar && matchesEpic && matchesQuery
    })
  }, [analytics, query, selectedEpic, selectedPillar])

  const selectedPillarData = pillars.find((pillar) => pillar.name === selectedPillar)
  const wordCloud =
    selectedPillar === 'Todos'
      ? analytics?.word_cloud ?? []
      : analytics?.word_cloud_by_pillar?.[selectedPillar] ?? []

  const visibleTasks = useMemo(() => {
    if (!hubData) return []
    const needle = query.trim().toLowerCase()
    return hubData.tasks
      .filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar)
      .filter((item) => showCompletedActions || item.status !== 'Done')
      .filter((item) => !needle || [item.text, item.company, item.pillar, item.owner, item.source].join(' ').toLowerCase().includes(needle))
      .slice(0, 14)
  }, [hubData, query, selectedPillar, showCompletedActions])

  const taskProgress = useMemo(() => {
    if (!hubData) return { total: 0, done: 0, open: 0 }
    const scoped = hubData.tasks.filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar)
    const done = scoped.filter((item) => item.status === 'Done').length
    return { total: scoped.length, done, open: scoped.length - done }
  }, [hubData, selectedPillar])

  const visibleTriage = useMemo(() => {
    if (!hubData) return []
    const needle = query.trim().toLowerCase()
    return hubData.triage
      .filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar)
      .filter((item) => !needle || [item.text, item.company, item.pillar, item.type, item.source].join(' ').toLowerCase().includes(needle))
      .slice(0, 10)
  }, [hubData, query, selectedPillar])

  const visibleRisks = useMemo(() => {
    if (!hubData) return []
    const needle = riskQuery.trim().toLowerCase()
    return sortItems(
      hubData.risks
        .filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar)
        .filter((item) => !needle || [item.text, item.company, item.pillar, item.owner, item.source, item.dependency].join(' ').toLowerCase().includes(needle)),
      riskSortBy,
    )
  }, [hubData, riskQuery, riskSortBy, selectedPillar])

  const groupedRisks = useMemo(() => groupItems(visibleRisks, riskGroupBy), [riskGroupBy, visibleRisks])

  const visibleDecisions = useMemo(() => {
    if (!hubData) return []
    return hubData.decisions.filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar).slice(0, 8)
  }, [hubData, selectedPillar])

  const visibleQuestions = useMemo(() => {
    if (!hubData) return []
    return hubData.questions.filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar).slice(0, 8)
  }, [hubData, selectedPillar])

  async function toggleTask(item) {
    const nextStatus = item.status === 'Done' ? 'Open' : 'Done'
    if (hub?.source === 'notion' && item.notion_page_id) {
      setTaskWriteState('saving')
      try {
        const response = await fetch('/api/notion-hub', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: item.notion_page_id, status: nextStatus }),
        })
        if (!response.ok) throw new Error('Notion update failed')
        setHub((current) => ({
          ...current,
          tasks: current.tasks.map((task) => (task.notion_page_id === item.notion_page_id ? { ...task, status: nextStatus } : task)),
        }))
        setTaskWriteState('saved')
      } catch {
        setTaskWriteState('error')
      }
      return
    }
    setCompletedActions((current) => {
      const next = { ...current }
      if (next[item.id]) delete next[item.id]
      else next[item.id] = new Date().toISOString()
      return next
    })
  }

  if (!analytics || !hubData) {
    return (
      <main className="app-shell loading-shell">
        <div className="loader">Carregando Meeting Cockpit...</div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-mark">MC</span>
          <div>
            <p>Notion-native task and memory hub</p>
            <h1>Meeting Cockpit</h1>
            <small>Atualizado em {new Date(hubData.generated_at ?? analytics.generated_at).toLocaleString('pt-BR')}</small>
          </div>
        </div>
        <button type="button" onClick={() => { setSelectedPillar('Todos'); setSelectedEpic('Todos'); setQuery('') }}>
          Limpar filtros
        </button>
      </header>

      <section className="summary-grid" aria-label="Resumo geral">
        <Metric label="Triage" value={hubData.triage.length} hint="Itens aguardando revisao" />
        <Metric label="Tasks" value={taskProgress.open} hint={`${taskProgress.done} concluidas`} tone="warn" />
        <Metric label="Riscos" value={hubData.risks.length} hint="Bloqueios e dependencias" tone="risk" />
        <Metric label="Memoria" value={hubData.decisions.length + hubData.questions.length} hint="Decisoes e perguntas" />
      </section>

      <section className="control-panel">
        <label>
          <span>Buscar</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="routing, Revenue Cloud, catalogo..." />
        </label>
        <label>
          <span>Pillar</span>
          <select value={selectedPillar} onChange={(event) => setSelectedPillar(event.target.value)}>
            <option>Todos</option>
            {pillars.map((pillar) => <option key={pillar.name}>{pillar.name}</option>)}
          </select>
        </label>
        <label>
          <span>Epic</span>
          <select value={selectedEpic} onChange={(event) => setSelectedEpic(event.target.value)}>
            <option>Todos</option>
            {epics.map((epic) => <option key={epic.name}>{epic.name}</option>)}
          </select>
        </label>
      </section>

      <section className="insight-strip" aria-label="Principais sinais">
        <div>
          <strong>Notion como banco</strong>
          <span>{hubData.source === 'notion' ? 'Lendo databases derivadas diretamente do Notion.' : 'Fallback local ativo ate configurar as databases derivadas.'}</span>
        </div>
        <div>
          <strong>ChatGPT Automation</strong>
          <span>Prompt e schema prontos para capturar 24h, processar e alimentar Triage/Tasks/Memory via MCP.</span>
        </div>
        <div>
          <strong>Fonte rastreavel</strong>
          <span>Cada item operacional mantem reuniao, trecho, confianca e status.</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel triage-panel">
          <PanelTitle kicker="Triage" title="Capturas aguardando revisao" />
          <TriageList items={visibleTriage} />
        </article>

        <article className="panel today-panel">
          <PanelTitle kicker="Hoje" title="Plano operacional sugerido" />
          <TodayList items={visibleTasks.slice(0, 6)} />
        </article>

        <article className="panel word-panel">
          <PanelTitle kicker="Assuntos extraidos por NLP" title={selectedPillar === 'Todos' ? 'Temas recorrentes nas reunioes' : `Temas recorrentes: ${selectedPillar}`} />
          <WordCloud words={wordCloud} />
        </article>

        <article className="panel tasks-panel">
          <div className="panel-heading action-heading">
            <div>
              <p>Task Hub</p>
              <h2>{taskProgress.open} tarefas abertas</h2>
            </div>
            <label className="toggle-done">
              <input
                checked={showCompletedActions}
                onChange={(event) => setShowCompletedActions(event.target.checked)}
                type="checkbox"
              />
              <span>Concluidas</span>
            </label>
          </div>
          <div className="action-progress">
            <span style={{ width: `${taskProgress.total ? (taskProgress.done / taskProgress.total) * 100 : 0}%` }} />
          </div>
          <small className={`action-progress-label ${taskWriteState}`}>
            {taskProgress.done} concluidas de {taskProgress.total} tarefas neste filtro
            {taskWriteState === 'saving' ? ' | Salvando no Notion...' : ''}
            {taskWriteState === 'saved' ? ' | Notion atualizado' : ''}
            {taskWriteState === 'error' ? ' | Falha ao atualizar Notion' : ''}
          </small>
          <TaskList items={visibleTasks} onToggle={toggleTask} />
        </article>

        <article className="panel blockers-panel">
          <div className="panel-heading risk-heading">
            <div>
              <p>Risco e dependencias</p>
              <h2>Explorador granular</h2>
            </div>
          </div>
          <div className="risk-controls">
            <label>
              <span>Buscar</span>
              <input value={riskQuery} onChange={(event) => setRiskQuery(event.target.value)} placeholder="approval, UAT, catalogo, fila..." />
            </label>
            <label>
              <span>Agrupar</span>
              <select value={riskGroupBy} onChange={(event) => setRiskGroupBy(event.target.value)}>
                {groupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>Ordenar</span>
              <select value={riskSortBy} onChange={(event) => setRiskSortBy(event.target.value)}>
                {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <GroupedRiskList
            expandedId={expandedRiskId}
            groups={groupedRisks}
            onToggle={(item) => setExpandedRiskId(expandedRiskId === item.id ? null : item.id)}
          />
        </article>

        <article className="panel decisions-panel">
          <PanelTitle kicker="Memoria" title="Decisoes capturadas" />
          <MemoryList items={visibleDecisions} empty="Nenhuma decisao nesse filtro." />
        </article>

        <article className="panel questions-panel">
          <PanelTitle kicker="Follow-up" title="Perguntas abertas" />
          <MemoryList items={visibleQuestions} empty="Nenhuma pergunta nesse filtro." />
        </article>

        <article className="panel timeline-panel">
          <PanelTitle kicker="Cadencia" title="Reunioes por periodo" />
          <Timeline data={analytics.timeline} />
        </article>

        <article className="panel pillars-panel">
          <PanelTitle kicker="Acompanhamento" title="Pillars em foco" />
          <div className="pillar-list">
            {pillars.map((pillar) => (
              <button
                className={selectedPillar === pillar.name ? 'active' : ''}
                key={pillar.name}
                type="button"
                onClick={() => setSelectedPillar(selectedPillar === pillar.name ? 'Todos' : pillar.name)}
              >
                <span>
                  <strong>{pillar.name}</strong>
                  <small>{pillar.meetings} reunioes | {pillar.open_actions} pendencias | {pillar.blockers} bloqueios</small>
                </span>
                <em>{pillar.top_terms.slice(0, 3).map((term) => term.term).join(', ')}</em>
              </button>
            ))}
          </div>
        </article>

        <article className="panel meetings-panel">
          <PanelTitle kicker="Fonte auditavel" title={`${filteredMeetings.length} reunioes filtradas`} />
          <div className="meeting-list">
            {filteredMeetings.map((meeting) => (
              <a key={meeting.id} href={meeting.url} target="_blank" rel="noreferrer">
                <span>
                  <strong>{meeting.title}</strong>
                  <small>{formatDate(meeting.date)} | {meeting.pillar} | {meeting.epic}</small>
                </span>
                <p>{meeting.summary}</p>
                <em>{meeting.actions} actions | {meeting.blockers} blockers | {meeting.questions} perguntas</em>
              </a>
            ))}
          </div>
        </article>

        <aside className="panel detail-panel">
          <PanelTitle kicker="Leitura rapida" title={selectedPillarData ? selectedPillarData.name : 'Visao geral'} />
          {selectedPillarData ? (
            <PillarDetail pillar={selectedPillarData} />
          ) : (
            <div className="overview-copy">
              <p>O Meeting Cockpit agora separa captura, triage, execucao e memoria. O Notion fica como banco operacional; a automacao do ChatGPT via MCP alimenta as databases derivadas.</p>
              <p>Quando os IDs das databases derivadas estiverem configurados no Vercel, checks de tarefas passam a persistir no Notion.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  )
}

function Metric({ label, value, hint, tone = 'default' }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  )
}

function PanelTitle({ kicker, title }) {
  return (
    <div className="panel-heading">
      <div>
        <p>{kicker}</p>
        <h2>{title}</h2>
      </div>
    </div>
  )
}

function WordCloud({ words }) {
  if (!words.length) return <div className="empty-state">Sem palavras suficientes para montar a nuvem.</div>
  return (
    <div className="word-cloud">
      {words.map((word) => (
        <button
          className={`tone-${word.tone}`}
          key={word.term}
          type="button"
          style={{ fontSize: `${word.size}px` }}
          title={`${word.term}: ${word.count} ocorrencias`}
        >
          {word.term}
        </button>
      ))}
    </div>
  )
}

function Timeline({ data }) {
  const max = Math.max(...data.flatMap((month) => month.pillars.map((pillar) => pillar.meetings)), 1)
  return (
    <div className="timeline">
      {data.map((month) => (
        <div key={month.month}>
          <strong>{formatMonth(month.month)}</strong>
          <div>
            {month.pillars.map((pillar) => (
              <span key={pillar.name} style={{ height: `${Math.max((pillar.meetings / max) * 100, 12)}%` }}>
                <i>{pillar.name}</i>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TriageList({ items }) {
  if (!items.length) return <div className="empty-state">Nenhum item em triage.</div>
  return (
    <div className="triage-list">
      {items.map((item) => (
        <article key={`${item.id}-${item.type}`}>
          <span>{item.type}</span>
          <div>
            <strong>{item.text}</strong>
            <small>{item.company} | {item.pillar} | {statusLabel[item.triage_status] ?? item.triage_status} | {Math.round((item.confidence ?? 0) * 100)}% confianca</small>
          </div>
        </article>
      ))}
    </div>
  )
}

function TodayList({ items }) {
  if (!items.length) return <div className="empty-state">Nenhuma tarefa sugerida para hoje.</div>
  return (
    <div className="today-list">
      {items.map((item, index) => (
        <article key={item.id}>
          <span>{index + 1}</span>
          <div>
            <strong>{item.text}</strong>
            <small>{item.priority} | {item.owner} | {item.company}</small>
          </div>
        </article>
      ))}
    </div>
  )
}

function TaskList({ items, onToggle }) {
  if (!items.length) return <div className="empty-state">Nenhuma tarefa para esse filtro.</div>
  return (
    <div className="action-list">
      {items.map((item) => (
        <article className={item.status === 'Done' ? 'checked' : ''} key={item.id}>
          <button
            aria-label={item.status === 'Done' ? 'Marcar tarefa como aberta' : 'Marcar tarefa como concluida'}
            className="check-button"
            onClick={() => onToggle(item)}
            type="button"
          >
            {item.status === 'Done' ? '✓' : ''}
          </button>
          <div>
            <strong>{item.text}</strong>
            <small>
              {item.company} | {item.pillar} | {item.owner} | {statusLabel[item.status] ?? item.status} | {item.priority}
            </small>
            <a href={item.meeting_url} target="_blank" rel="noreferrer">{item.source}</a>
          </div>
        </article>
      ))}
    </div>
  )
}

function GroupedRiskList({ groups, expandedId, onToggle }) {
  const entries = Object.entries(groups)
  if (!entries.length) return <div className="empty-state">Nenhum risco nesse filtro.</div>
  return (
    <div className="grouped-risk-list">
      {entries.map(([group, items]) => (
        <section key={group}>
          <h3>{group} <span>{items.length}</span></h3>
          <RiskList expandedId={expandedId} items={items.slice(0, 12)} onToggle={onToggle} />
        </section>
      ))}
    </div>
  )
}

function RiskList({ items, expandedId, onToggle }) {
  return (
    <div className="risk-list">
      {items.map((item) => {
        const expanded = expandedId === item.id
        return (
          <article className={expanded ? 'expanded' : ''} key={item.id}>
            <button className="risk-summary" onClick={() => onToggle(item)} type="button">
              <span className="status-dot risk" />
              <span>
                <strong>{item.text}</strong>
                <small>{item.company} | {item.pillar} | {item.severity} | {formatDate(item.date)}</small>
              </span>
              <em>{expanded ? 'Fechar' : 'Entender'}</em>
            </button>
            {expanded ? (
              <div className="risk-detail">
                <dl>
                  <div><dt>Owner</dt><dd>{item.owner}</dd></div>
                  <div><dt>Dependencia</dt><dd>{item.dependency}</dd></div>
                  <div><dt>Status</dt><dd>{item.status}</dd></div>
                </dl>
                <p>{item.source_excerpt ?? item.text}</p>
                <div className="risk-actions">
                  <a href={item.meeting_url ?? '#'} target="_blank" rel="noreferrer">Abrir reuniao no Notion</a>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(item.text)}>Copiar risco</button>
                </div>
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

function MemoryList({ items, empty }) {
  if (!items.length) return <div className="empty-state">{empty}</div>
  return (
    <div className="item-list memory-list">
      {items.map((item) => (
        <article key={item.id}>
          <span className={item.type === 'Question' ? 'status-dot waiting' : 'status-dot done'} />
          <div>
            <strong>{item.text}</strong>
            <small>{item.company} | {item.pillar} | {item.source} | {formatDate(item.date)}</small>
            <a className="inline-source-link" href={item.meeting_url} target="_blank" rel="noreferrer">Abrir origem</a>
          </div>
        </article>
      ))}
    </div>
  )
}

function PillarDetail({ pillar }) {
  return (
    <div className="pillar-detail">
      <dl>
        <div><dt>Periodo</dt><dd>{formatDate(pillar.first_meeting)} ate {formatDate(pillar.last_meeting)}</dd></div>
        <div><dt>Volume</dt><dd>{pillar.meetings} reunioes, {pillar.open_actions} pendencias</dd></div>
        <div><dt>Sinais</dt><dd>{pillar.questions} perguntas, {pillar.decisions} decisoes, {pillar.blockers} bloqueios</dd></div>
      </dl>
      <h3>Epics principais</h3>
      <div className="tag-row">
        {pillar.top_epics.map((epic) => <span key={epic.name}>{epic.name} ({epic.count})</span>)}
      </div>
      <h3>Termos fortes</h3>
      <div className="tag-row">
        {pillar.top_terms.map((term) => <span key={term.term}>{term.term}</span>)}
      </div>
      <h3>Ultimas reunioes</h3>
      <div className="mini-meetings">
        {pillar.recent_meetings.map((meeting) => (
          <a key={meeting.id} href={meeting.url} target="_blank" rel="noreferrer">
            <strong>{meeting.title}</strong>
            <small>{formatDate(meeting.date)} | {meeting.epic}</small>
          </a>
        ))}
      </div>
    </div>
  )
}

export default App
