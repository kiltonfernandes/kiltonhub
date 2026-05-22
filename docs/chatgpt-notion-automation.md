# Meeting Cockpit: ChatGPT Automation + Notion MCP

This document is the operating prompt/spec for the native ChatGPT automation that keeps Meeting Cockpit Notion-native.

## Goal

Every 24 hours, read the raw `Meetings / Read AI Notes` database, process meetings created or edited in the last 24 hours, and write structured records directly into the derived Notion databases.

Do not use GitHub Actions as the intelligence engine. Do not require an intermediate JSON contract. Notion is the operational database.

## Derived Databases

Create or maintain these Notion databases:

- `Meeting Cockpit - Triage`
- `Meeting Cockpit - Tasks`
- `Meeting Cockpit - Decisions`
- `Meeting Cockpit - Risks`
- `Meeting Cockpit - Questions`
- `Meeting Cockpit - Companies / Pillars`

## Shared Properties

Use these properties in all derived databases where possible:

- `Name` title
- `Stable Key` rich text
- `Type` select: `Task`, `Decision`, `Risk`, `Question`
- `Company` select or rich text
- `Pillar` select
- `Owner` rich text or people
- `Status` status
- `Priority` select: `Urgent`, `High`, `Medium`, `Low`, `Backlog`
- `Severity` select: `Critical`, `High`, `Medium`, `Low`, `Info`
- `Dependency` rich text
- `Confidence` number from `0` to `1`
- `Date` date
- `Source meeting` rich text or relation
- `Source URL` url
- `Source excerpt` rich text

## Triage Properties

Add:

- `Triage Status` status: `New`, `Approved`, `Rejected`, `Needs review`, `Merged`
- `Target Database` select: `Tasks`, `Decisions`, `Risks`, `Questions`

All extracted items should first appear in Triage unless the user has explicitly asked for auto-approval.

## Stable Key Rule

Before creating any derived item, compute a stable key:

```text
source_meeting_id + "::" + item_type + "::" + normalized_short_hash(source_excerpt_or_title)
```

If a page with the same `Stable Key` already exists in the target database, update it instead of creating a duplicate.

## Daily Automation Prompt

Use this prompt in the ChatGPT scheduled automation:

```text
You are the Meeting Cockpit processing layer.

Every day, inspect the Notion database "Meetings / Read AI Notes" and find pages created or edited in the last 24 hours.

For each meeting, read the title, date, company, pillar, epic, summary, transcript, action items, questions, decisions, blockers, participants, and page URL.

Extract operational records:

1. Tasks
- Concrete follow-up or action required.
- Include owner when available, otherwise "TBD".
- Infer priority from urgency, blockers, due dates, customer impact, and repeated mentions.
- Status starts as "Open".

2. Decisions
- A choice, agreement, direction, approval, source of truth, or scope decision.
- Do not classify a task as a decision.
- Status starts as "Approved" only if the decision is explicit; otherwise send to Triage as "Needs review".

3. Risks / Dependencies
- Blockers, waiting states, missing approvals, unresolved dependencies, production/UAT issues, data quality issues, delivery risks.
- Include severity and dependency when possible.
- Status starts as "Open".

4. Questions
- Open questions, doubts, unknowns, clarification needed, or pending confirmation.
- Status starts as "Open".

For every extracted record, write first to "Meeting Cockpit - Triage" with:
- Stable Key
- Type
- Name
- Company
- Pillar
- Owner
- Status
- Priority
- Severity
- Dependency
- Confidence
- Date
- Source meeting
- Source URL
- Source excerpt
- Triage Status = New or Needs review
- Target Database

Use the Stable Key to upsert. Never create duplicates.

After processing, provide a short summary:
- meetings processed
- new triage items
- updated triage items
- high severity risks
- tasks that look urgent today
```

## App Environment Variables

Configure these in Vercel when the derived databases exist:

```text
NOTION_TOKEN
NOTION_TRIAGE_DATABASE_ID
NOTION_TASKS_DATABASE_ID
NOTION_DECISIONS_DATABASE_ID
NOTION_RISKS_DATABASE_ID
NOTION_QUESTIONS_DATABASE_ID
```

When these variables are missing, Meeting Cockpit falls back to the existing generated analytics dataset.
