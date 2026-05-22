import { useEffect, useMemo, useState } from 'react'
import './App.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' })

const statusLabel = {
  open: 'Aberto',
  waiting: 'Aguardando',
  done: 'Fechado',
  checked: 'Concluido',
}

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
  return dateFormatter.format(new Date(`${date}T00:00:00Z`)).replace('.', '')
}

function formatMonth(month) {
  return monthFormatter.format(new Date(`${month}-01T00:00:00Z`)).replace('.', '')
}

function App() {
  const [analytics, setAnalytics] = useState(null)
  const [selectedPillar, setSelectedPillar] = useState('Todos')
  const [selectedEpic, setSelectedEpic] = useState('Todos')
  const [query, setQuery] = useState('')
  const [blockerQuery, setBlockerQuery] = useState('')
  const [expandedBlockerId, setExpandedBlockerId] = useState(null)
  const [completedActions, setCompletedActions] = useState(readCompletedActions)
  const [showCompletedActions, setShowCompletedActions] = useState(false)

  useEffect(() => {
    fetch('/data/meeting_analytics.json')
      .then((response) => response.json())
      .then(setAnalytics)
  }, [])

  useEffect(() => {
    localStorage.setItem(completedStorageKey, JSON.stringify(completedActions))
  }, [completedActions])

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

  const visibleActions = useMemo(() => {
    if (!analytics) return []
    return analytics.actions
      .map((item) => ({ ...item, checked: Boolean(completedActions[item.id]) }))
      .filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar)
      .filter((item) => showCompletedActions || !item.checked)
      .slice(0, 12)
  }, [analytics, completedActions, selectedPillar, showCompletedActions])

  const actionProgress = useMemo(() => {
    if (!analytics) return { total: 0, done: 0, open: 0 }
    const scoped = analytics.actions.filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar)
    const done = scoped.filter((item) => completedActions[item.id]).length
    return { total: scoped.length, done, open: scoped.length - done }
  }, [analytics, completedActions, selectedPillar])

  const visibleBlockers = useMemo(() => {
    if (!analytics) return []
    const needle = blockerQuery.trim().toLowerCase()
    return analytics.blockers
      .map((item, index) => ({ ...item, id: `${item.date}-${item.pillar}-${index}-${item.text.slice(0, 32)}` }))
      .filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar)
      .filter((item) => !needle || [item.text, item.pillar, item.meeting_title].join(' ').toLowerCase().includes(needle))
      .slice(0, 10)
  }, [analytics, blockerQuery, selectedPillar])

  const visibleDecisions = useMemo(() => {
    if (!analytics) return []
    return analytics.decisions.filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar).slice(0, 6)
  }, [analytics, selectedPillar])

  if (!analytics) {
    return (
      <main className="app-shell loading-shell">
        <div className="loader">Carregando analytics de reunioes...</div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-mark">KH</span>
          <div>
            <p>Read AI + Notion intelligence</p>
            <h1>Meeting Cockpit</h1>
            <small>Atualizado em {new Date(analytics.generated_at).toLocaleString('pt-BR')}</small>
          </div>
        </div>
        <button type="button" onClick={() => { setSelectedPillar('Todos'); setSelectedEpic('Todos'); setQuery('') }}>
          Limpar filtros
        </button>
      </header>

      <section className="summary-grid" aria-label="Resumo geral">
        <Metric label="Reunioes" value={analytics.metrics.meetings} hint={`${analytics.metrics.first_meeting} ate ${analytics.metrics.last_meeting}`} />
        <Metric label="Pillars" value={analytics.metrics.pillars} hint="Empresas ou areas acompanhadas" />
        <Metric label="Pendencias" value={analytics.metrics.open_actions} hint="Action items extraidos" tone="warn" />
        <Metric label="Bloqueios" value={analytics.metrics.blockers} hint={`${analytics.metrics.questions} perguntas abertas`} tone="risk" />
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
          <strong>Backend vivo no Notion</strong>
          <span>Workflow horario sincroniza reunioes, recalcula NLP e publica o JSON do app.</span>
        </div>
        <div>
          <strong>Assuntos sem chute</strong>
          <span>Stopwords, n-grams e TF-IDF gerados no Python antes do frontend renderizar.</span>
        </div>
        <div>
          <strong>Fonte auditavel</strong>
          <span>Cada card mantem link de volta para a pagina original no Notion.</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel word-panel">
          <PanelTitle kicker="Assuntos extraidos por NLP" title={selectedPillar === 'Todos' ? 'Temas recorrentes nas reunioes' : `Temas recorrentes: ${selectedPillar}`} />
          <WordCloud words={wordCloud} />
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

        <article className="panel actions-panel">
          <div className="panel-heading action-heading">
            <div>
              <p>Follow-up</p>
              <h2>{actionProgress.open} pendencias abertas</h2>
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
            <span style={{ width: `${actionProgress.total ? (actionProgress.done / actionProgress.total) * 100 : 0}%` }} />
          </div>
          <small className="action-progress-label">
            {actionProgress.done} concluidas de {actionProgress.total} tarefas neste filtro
          </small>
          <ActionList
            items={visibleActions}
            empty={showCompletedActions ? 'Nenhuma tarefa para esse filtro.' : 'Nenhuma pendencia aberta para esse filtro.'}
            onToggle={(item) => {
              setCompletedActions((current) => {
                const next = { ...current }
                if (next[item.id]) {
                  delete next[item.id]
                } else {
                  next[item.id] = new Date().toISOString()
                }
                return next
              })
            }}
          />
        </article>

        <article className="panel blockers-panel">
          <div className="panel-heading risk-heading">
            <div>
              <p>Risco de atraso</p>
              <h2>Bloqueios e dependencias</h2>
            </div>
          </div>
          <label className="risk-search">
            <span>Buscar bloqueio</span>
            <input
              value={blockerQuery}
              onChange={(event) => setBlockerQuery(event.target.value)}
              placeholder="approval, UAT, catalogo, fila..."
            />
          </label>
          <RiskList
            expandedId={expandedBlockerId}
            items={visibleBlockers}
            onToggle={(item) => setExpandedBlockerId(expandedBlockerId === item.id ? null : item.id)}
          />
        </article>

        <article className="panel decisions-panel">
          <PanelTitle kicker="Memoria de decisao" title="Decisoes capturadas" />
          <ItemList items={visibleDecisions} empty="Nenhuma decisao nesse filtro." render={(item) => (
            <>
              <span className="status-dot done" />
              <div>
                <strong>{item.text}</strong>
                <small>{item.pillar} | {item.meeting_title} | {formatDate(item.date)}</small>
              </div>
            </>
          )} />
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
              <p>Use os filtros para acompanhar uma empresa/area ou um epic. Os temas vêm das transcricoes e resumos processados em Python com stopwords, n-grams e TF-IDF para destacar assuntos relevantes.</p>
              <p>O Notion funciona como backend: o GitHub Action sincroniza a database de hora em hora, gera o JSON analitico e publica o frontend atualizado.</p>
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

function ItemList({ items, empty, render }) {
  if (!items.length) return <div className="empty-state">{empty}</div>
  return <div className="item-list">{items.map((item, index) => <article key={`${item.text}-${index}`}>{render(item)}</article>)}</div>
}

function ActionList({ items, empty, onToggle }) {
  if (!items.length) return <div className="empty-state">{empty}</div>
  return (
    <div className="action-list">
      {items.map((item) => (
        <article className={item.checked ? 'checked' : ''} key={item.id}>
          <button
            aria-label={item.checked ? 'Marcar tarefa como aberta' : 'Marcar tarefa como concluida'}
            className="check-button"
            onClick={() => onToggle(item)}
            type="button"
          >
            {item.checked ? '✓' : ''}
          </button>
          <div>
            <strong>{item.text}</strong>
            <small>
              {item.pillar} | {item.owner} | {formatDate(item.date)} | {item.checked ? statusLabel.checked : statusLabel[item.status] ?? item.status}
            </small>
            <a href={item.meeting_url} target="_blank" rel="noreferrer">{item.meeting_title}</a>
          </div>
        </article>
      ))}
    </div>
  )
}

function RiskList({ items, expandedId, onToggle }) {
  if (!items.length) return <div className="empty-state">Nenhum bloqueio nesse filtro.</div>
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
                <small>{item.pillar} | {item.meeting_title} | {formatDate(item.date)}</small>
              </span>
              <em>{expanded ? 'Fechar' : 'Entender'}</em>
            </button>
            {expanded ? (
              <div className="risk-detail">
                <dl>
                  <div><dt>Pillar</dt><dd>{item.pillar}</dd></div>
                  <div><dt>Origem</dt><dd>{item.meeting_title}</dd></div>
                  <div><dt>Data</dt><dd>{formatDate(item.date)}</dd></div>
                </dl>
                <p>{item.text}</p>
                <div className="risk-actions">
                  <a href={item.meeting_url ?? '#'} target="_blank" rel="noreferrer">Abrir reuniao no Notion</a>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(item.text)}>Copiar bloqueio</button>
                </div>
              </div>
            ) : null}
          </article>
        )
      })}
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
