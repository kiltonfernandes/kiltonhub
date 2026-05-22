const NOTION_VERSION = process.env.NOTION_VERSION || '2022-06-28'

const databases = {
  triage: process.env.NOTION_TRIAGE_DATABASE_ID,
  tasks: process.env.NOTION_TASKS_DATABASE_ID,
  decisions: process.env.NOTION_DECISIONS_DATABASE_ID,
  risks: process.env.NOTION_RISKS_DATABASE_ID,
  questions: process.env.NOTION_QUESTIONS_DATABASE_ID,
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  }
}

function textValue(prop) {
  if (!prop) return ''
  const type = prop.type
  const value = prop[type]
  if (type === 'title' || type === 'rich_text') return (value || []).map((part) => part.plain_text).join('')
  if (type === 'select' || type === 'status') return value?.name || ''
  if (type === 'multi_select') return (value || []).map((item) => item.name).join(', ')
  if (type === 'date') return value?.start || ''
  if (type === 'number') return value ?? ''
  if (type === 'url') return value || ''
  if (type === 'relation') return (value || []).map((item) => item.id).join(', ')
  if (type === 'people') return (value || []).map((person) => person.name || person.id).join(', ')
  if (type === 'checkbox') return value ? 'true' : 'false'
  return ''
}

function numberValue(prop, fallback = 0) {
  const value = Number(textValue(prop))
  return Number.isFinite(value) ? value : fallback
}

function pick(properties, names, fallback = '') {
  for (const name of names) {
    const value = textValue(properties[name])
    if (value !== '') return value
  }
  return fallback
}

function normalizedPage(page, type) {
  const properties = page.properties || {}
  const title = pick(properties, ['Name', 'Title', 'Task', 'Item', 'Decision', 'Risk', 'Question'], page.id)
  const source = pick(properties, ['Source', 'Source meeting', 'Meeting', 'Origem'], '')
  const sourceUrl = pick(properties, ['Source URL', 'Meeting URL', 'URL', 'Notion URL'], page.url)
  return {
    id: pick(properties, ['Stable key', 'Stable Key', 'Key'], page.id.replaceAll('-', '')),
    notion_page_id: page.id,
    text: title,
    type: pick(properties, ['Type', 'Tipo'], type),
    company: pick(properties, ['Company', 'Empresa'], 'Sem empresa'),
    pillar: pick(properties, ['Pillar'], 'Sem pillar'),
    owner: pick(properties, ['Owner', 'Responsavel', 'Responsible'], 'TBD'),
    status: pick(properties, ['Status'], type === 'Triage' ? 'New' : 'Open'),
    triage_status: pick(properties, ['Triage Status', 'Triage'], 'New'),
    priority: pick(properties, ['Priority', 'Prioridade'], 'Medium'),
    severity: pick(properties, ['Severity', 'Severidade'], 'Medium'),
    dependency: pick(properties, ['Dependency', 'Dependencia'], 'TBD'),
    date: pick(properties, ['Date', 'Data', 'Meeting Date'], page.created_time),
    updated_at: page.last_edited_time,
    confidence: numberValue(properties.Confidence || properties.Confianca, 0),
    source,
    source_excerpt: pick(properties, ['Source excerpt', 'Evidence', 'Evidencia', 'Trecho'], title),
    meeting_title: source,
    meeting_url: sourceUrl,
  }
}

async function notionRequest(path, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: { ...notionHeaders(), ...(options.headers || {}) },
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Notion ${response.status}: ${detail}`)
  }
  return response.json()
}

async function queryDatabase(databaseId, type) {
  if (!databaseId) return []
  const data = await notionRequest(`/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({
      page_size: 100,
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
    }),
  })
  return (data.results || []).map((page) => normalizedPage(page, type))
}

async function readHub() {
  const [triage, tasks, decisions, risks, questions] = await Promise.all([
    queryDatabase(databases.triage, 'Triage'),
    queryDatabase(databases.tasks, 'Task'),
    queryDatabase(databases.decisions, 'Decision'),
    queryDatabase(databases.risks, 'Risk'),
    queryDatabase(databases.questions, 'Question'),
  ])

  return {
    ready: true,
    source: 'notion',
    generated_at: new Date().toISOString(),
    triage,
    tasks,
    decisions,
    risks,
    questions,
  }
}

async function updateTaskStatus(pageId, status) {
  await notionRequest(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Status: {
          status: { name: status },
        },
      },
    }),
  })
  return { ok: true, pageId, status }
}

export default async function handler(request, response) {
  try {
    if (!process.env.NOTION_TOKEN) {
      response.status(200).json({ ready: false, reason: 'Missing NOTION_TOKEN' })
      return
    }

    if (request.method === 'GET') {
      const hasAnyDerivedDb = Object.values(databases).some(Boolean)
      if (!hasAnyDerivedDb) {
        response.status(200).json({ ready: false, reason: 'Missing derived database ids' })
        return
      }
      response.status(200).json(await readHub())
      return
    }

    if (request.method === 'PATCH') {
      const { pageId, status } = request.body || {}
      if (!pageId || !status) {
        response.status(400).json({ error: 'pageId and status are required' })
        return
      }
      response.status(200).json(await updateTaskStatus(pageId, status))
      return
    }

    response.setHeader('Allow', 'GET, PATCH')
    response.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
}
