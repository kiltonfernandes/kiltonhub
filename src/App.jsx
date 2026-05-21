import { useEffect, useMemo, useState } from 'react'
import './App.css'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' })

const statusLabel = {
  open: 'Aberto',
  waiting: 'Aguardando',
  done: 'Fechado',
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

  useEffect(() => {
    fetch('/data/meeting_analytics.json')
      .then((response) => response.json())
      .then(setAnalytics)
  }, [])

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
    return analytics.actions.filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar).slice(0, 8)
  }, [analytics, selectedPillar])

  const visibleBlockers = useMemo(() => {
    if (!analytics) return []
    return analytics.blockers.filter((item) => selectedPillar === 'Todos' || item.pillar === selectedPillar).slice(0, 6)
  }, [analytics, selectedPillar])

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
            <h1>KiltonHub Meeting Cockpit</h1>
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

      <section className="dashboard-grid">
        <article className="panel word-panel">
          <PanelTitle kicker="Recorrencia lexical" title={selectedPillar === 'Todos' ? 'Word cloud das transcricoes' : `Word cloud: ${selectedPillar}`} />
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
          <PanelTitle kicker="Follow-up" title="Pendencias abertas" />
          <ItemList items={visibleActions} empty="Nenhuma pendencia para esse filtro." render={(item) => (
            <>
              <span className={`status-dot ${item.status}`} />
              <div>
                <strong>{item.text}</strong>
                <small>{item.pillar} | {item.owner} | {formatDate(item.date)} | {statusLabel[item.status] ?? item.status}</small>
              </div>
            </>
          )} />
        </article>

        <article className="panel blockers-panel">
          <PanelTitle kicker="Risco de atraso" title="Bloqueios e dependencias" />
          <ItemList items={visibleBlockers} empty="Nenhum bloqueio nesse filtro." render={(item) => (
            <>
              <span className="status-dot risk" />
              <div>
                <strong>{item.text}</strong>
                <small>{item.pillar} | {item.meeting_title} | {formatDate(item.date)}</small>
              </div>
            </>
          )} />
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
              <p>Use os filtros para acompanhar uma empresa/area ou um epic. A word cloud vem das transcricoes e resumos processados em Python, com stopwords e TF-IDF para destacar recorrencias relevantes.</p>
              <p>O painel foi pensado para evoluir para uma sincronizacao real com a database do Notion e gerar novos JSONs a cada refresh.</p>
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
