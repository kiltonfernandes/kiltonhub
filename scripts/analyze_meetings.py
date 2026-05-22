from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

try:
    import pandas as pd
except ImportError:  # pragma: no cover - fallback keeps the script runnable in minimal envs
    pd = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
except ImportError:  # pragma: no cover
    TfidfVectorizer = None


STOPWORDS = {
    "a", "ao", "aos", "as", "ate", "até", "com", "como", "da", "das", "de", "do", "dos", "e", "em",
    "entre", "foi", "foram", "mais", "mas", "na", "nas", "no", "nos", "o", "os", "ou", "para", "pra",
    "por", "porque", "que", "se", "sem", "ser", "sua", "são", "sao", "um", "uma", "uns", "umas",
    "não", "nao", "sim", "então", "entao", "também", "tambem", "muito", "muita", "muitos", "muitas",
    "aqui", "ali", "agora", "quando", "onde", "qual", "quais", "coisa", "coisas", "beleza", "acho",
    "assim", "vai", "vou", "vamos", "ter", "fazer", "pode", "poder", "todos", "todas", "tudo", "todo",
    "ele", "ela", "eles", "elas", "você", "voce", "vocês", "voces", "meu", "minha", "seu", "sua",
    "gente", "cara", "ok", "okay", "né", "ne", "né?", "ta", "tá", "so", "só", "pois", "néh",
    "the", "and", "for", "from", "with", "that", "this", "was", "were", "are", "is", "am", "be",
    "been", "being", "will", "would", "should", "could", "can", "may", "might", "need", "needs",
    "you", "your", "yours", "we", "our", "ours", "they", "them", "their", "he", "she", "his", "her",
    "it", "its", "i", "me", "my", "mine", "to", "of", "in", "on", "at", "by", "or", "an", "a",
    "have", "has", "had", "do", "does", "did", "doing", "done", "there", "here", "then", "than",
    "what", "where", "when", "why", "how", "which", "who", "just", "like", "yeah", "yes", "no",
    "right", "think", "know", "see", "some", "all", "but", "about", "because", "going", "work",
    "time", "story", "stories", "one", "two", "first", "second", "really", "very", "good",
    "participant", "participants", "speaker", "unknown", "unknown_speaker", "meeting", "meetings",
    "reuniao", "reunião", "team", "item", "items", "itens", "pt", "parte", "kilton",
    "not", "only", "next", "make", "sure", "thank", "thanks", "much", "people", "person",
    "something", "someone", "anything", "everything", "pessoal", "entendeu", "colocar", "depois",
    "precisa", "preciso", "exemplo", "falando", "falar", "working", "problem", "problema",
    "informacao", "informação", "information", "amanha", "amanhã", "entender", "pessoa", "bom",
    "dia", "olha", "look", "let", "get", "got", "come", "came", "talk", "talking", "call",
    "fernandes", "fabricio", "fabrício", "matheus", "valerie", "luciana", "paola", "samuel",
    "larissa", "adriana", "matt", "mohan", "drashti", "thomas", "tomas", "jess", "jessica",
    "gil", "gilvandro", "bruno", "henrique", "rafael", "marcelo", "camilo", "victor",
}

DOMAIN_HINTS = {
    "agent", "agentforce", "anima", "billing", "case", "catalog", "catalogo", "catálogo", "chatter",
    "cloud", "contract", "cpq", "csat", "c-sat", "det", "flow", "flows", "grooming", "govcloud",
    "jira", "kmod", "language", "linear", "marketing", "nqe", "omni", "org62", "persona",
    "personas", "pricing", "priority", "quip", "revenue", "routing", "salesforce", "scrum",
    "slack", "sprint", "survey", "uat", "vli", "revrack", "revrec", "fne", "f&e",
    "access", "acesso", "alfabetização", "backlog", "basecamp", "botao", "botão", "campaign",
    "campanhas", "cadastro", "catálogos", "catalogos", "cobrança", "cobranca", "cotação",
    "cotacoes", "cotações", "dashboard", "database", "demo", "deploy", "document", "documento",
    "documentação", "documentacao", "epic", "erro", "error", "esteira", "fila", "filas",
    "fixed", "form", "forms", "grupo", "grupos", "história", "historia", "integration",
    "integração", "integracao", "manual", "negocio", "negócio", "opportunity", "perfil",
    "perfis", "permission", "permissao", "permissão", "planejamento", "planning", "price",
    "produção", "producao", "produto", "produtos", "release", "review", "sanidade", "scope",
    "security", "segurança", "seguranca", "sequence", "status", "tarefa", "tarefas", "teste",
    "testes", "ticket", "treinamento", "user", "usuário", "usuario", "workshop",
    "shopping", "mall", "malls", "retail", "revenue", "stores",
}


def parse_date(value: str) -> datetime:
    cleaned = value.replace("Z", "+00:00")
    if "T" not in cleaned:
        cleaned = f"{cleaned}T00:00:00+00:00"
    return datetime.fromisoformat(cleaned).astimezone(timezone.utc)


def normalize_token(token: str) -> str:
    return token.strip("._-:/()[]{}'\"").lower()


def tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\-]{2,}", text.lower())
    cleaned = []
    for token in tokens:
        token = normalize_token(token)
        if token and token not in STOPWORDS and not token.isdigit():
            cleaned.append(token)
    return cleaned


def clean_text(text: str) -> str:
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"\(\d{1,2}:\d{2}(?::\d{2})?\)", " ", text)
    text = re.sub(r"\bparticipant\s+\d+\b", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"\bunknown[_\s-]?speaker\b", " ", text, flags=re.IGNORECASE)
    return text


def meeting_text(meeting: dict) -> str:
    sections = [
        meeting.get("title", ""),
        meeting.get("summary", ""),
        meeting.get("transcript", ""),
        " ".join(meeting.get("key_questions", [])),
        " ".join(meeting.get("decisions", [])),
        " ".join(meeting.get("blockers", [])),
        " ".join(item.get("text", "") for item in meeting.get("action_items", [])),
    ]
    return clean_text(" ".join(sections))


def is_noise_term(term: str) -> bool:
    tokens = term.split()
    if not tokens:
        return True
    if any(token in STOPWORDS for token in tokens):
        return True
    if len(tokens) == 1:
        token = tokens[0]
        if len(token) < 4 and token.lower() not in {"cpq", "uat", "det", "vli"}:
            return True
        if token.lower() not in DOMAIN_HINTS and not re.search(r"[0-9]", token) and len(token) < 7:
            return True
    elif not any(token in DOMAIN_HINTS for token in tokens):
        # Multi-word phrases are useful only when at least one word carries domain meaning.
        return True
    return False


def topic_score(term: str, score: float) -> float:
    tokens = term.split()
    multiplier = 1.0
    if len(tokens) == 2:
        multiplier += 0.35
    elif len(tokens) >= 3:
        multiplier += 0.55
    if any(token in DOMAIN_HINTS for token in tokens):
        multiplier += 0.45
    if re.search(r"\b[A-Za-z]+[0-9]+|[0-9]+[A-Za-z]+\b", term):
        multiplier += 0.2
    return score * multiplier


def split_sentences(text: str) -> list[str]:
    compact = re.sub(r"\s+", " ", text).strip()
    if not compact:
        return []
    parts = re.split(r"(?<=[.!?])\s+|(?<=\))\s+(?=[A-ZÀ-Ý])", compact)
    return [part.strip(" -•\t") for part in parts if len(part.strip()) > 28]


DECISION_PATTERNS = re.compile(
    r"\b("
    r"agreed|confirmed|decided|approved|defined|will implement|will use|source of truth|"
    r"ficou definido|ficou decidido|foi decidido|foi acordado|foi confirmado|foi definido|"
    r"decidiu|decidiram|acordou-se|houve consenso|deve ser|deverá|devera|será|sera|"
    r"implementarão|implementarao|seguir com|avançar com|avancar com|usar|utilizar|manter|"
    r"mover para|priorizar|source-of-truth"
    r")\b",
    re.IGNORECASE,
)

NON_DECISION_PATTERNS = re.compile(
    r"\b(question|pergunta|duvida|dúvida|unclear|open issue|bloque|blocked|pending|pendente|aguard|"
    r"não houve decisão|no decision|sem decisão)\b",
    re.IGNORECASE,
)


def extract_decision_candidates(meeting: dict, limit: int = 3) -> list[str]:
    explicit = [decision for decision in meeting.get("decisions", []) if decision]
    candidates = []
    for sentence in split_sentences(" ".join([meeting.get("summary", ""), " ".join(meeting.get("blockers", []))])):
        if DECISION_PATTERNS.search(sentence) and not NON_DECISION_PATTERNS.search(sentence):
            candidates.append(sentence)
    deduped = []
    seen = set()
    for decision in explicit + candidates:
        normalized = re.sub(r"\W+", " ", decision.lower()).strip()
        if normalized and normalized not in seen:
            deduped.append(decision[:420])
            seen.add(normalized)
        if len(deduped) >= limit:
            break
    return deduped


def tfidf_terms(meetings: list[dict], limit: int = 8) -> dict[str, list[dict]]:
    docs = [meeting_text(meeting) for meeting in meetings]
    if TfidfVectorizer is None or len(docs) < 2:
        terms_by_pillar = defaultdict(Counter)
        for meeting in meetings:
            terms_by_pillar[meeting["pillar"]].update(tokenize(meeting_text(meeting)))
        return {
            pillar: [{"term": term, "score": score} for term, score in counts.most_common(limit)]
            for pillar, counts in terms_by_pillar.items()
        }

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words=list(STOPWORDS),
        token_pattern=r"(?u)\b[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\-]{2,}\b",
        ngram_range=(1, 3),
        max_df=0.72,
        max_features=420,
    )
    matrix = vectorizer.fit_transform(docs)
    feature_names = vectorizer.get_feature_names_out()
    by_pillar = defaultdict(Counter)
    for idx, meeting in enumerate(meetings):
        row = matrix[idx].toarray()[0]
        top_indexes = row.argsort()[-limit * 2 :][::-1]
        for feature_idx in top_indexes:
            score = float(row[feature_idx])
            term = feature_names[feature_idx]
            if score > 0 and not is_noise_term(term):
                by_pillar[meeting["pillar"]][term] += topic_score(term, score)
    return {
        pillar: [{"term": term, "score": round(score, 4)} for term, score in counts.most_common(limit)]
        for pillar, counts in by_pillar.items()
    }


def build_word_cloud(meetings: list[dict], selected_pillar: str | None = None, limit: int = 60) -> list[dict]:
    scoped = [meeting for meeting in meetings if not selected_pillar or meeting["pillar"] == selected_pillar]
    docs = [meeting_text(meeting) for meeting in scoped]
    if not docs:
        return []

    if TfidfVectorizer is None:
        counter: Counter[str] = Counter()
        for doc in docs:
            counter.update(tokenize(doc))
        ranked = [(term, float(count), count) for term, count in counter.most_common(limit) if not is_noise_term(term)]
    else:
        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words=list(STOPWORDS),
            token_pattern=r"(?u)\b[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\-]{2,}\b",
            ngram_range=(1, 3),
            max_df=0.68 if len(docs) > 8 else 1.0,
            min_df=2 if len(docs) > 12 else 1,
            max_features=900,
            sublinear_tf=True,
        )
        matrix = vectorizer.fit_transform(docs)
        feature_names = vectorizer.get_feature_names_out()
        scores = matrix.sum(axis=0).A1
        doc_counts = (matrix > 0).sum(axis=0).A1
        candidates = []
        for index, term in enumerate(feature_names):
            if is_noise_term(term):
                continue
            score = topic_score(term, float(scores[index]))
            candidates.append((term, score, int(doc_counts[index])))
        ranked = sorted(candidates, key=lambda item: item[1], reverse=True)[:limit]

    if not ranked:
        return []

    max_score = ranked[0][1]
    min_score = ranked[-1][1]
    spread = max(max_score - min_score, 0.001)
    words = []
    for index, (term, score, count) in enumerate(ranked):
        weight = (score - min_score) / spread
        words.append(
            {
                "term": term,
                "count": count,
                "weight": round(weight, 3),
                "size": round(14 + weight * 30),
                "tone": index % 5,
            }
        )
    return words


def month_key(date: datetime) -> str:
    return date.strftime("%Y-%m")


def summarize_pillars(meetings: list[dict], pillar_terms: dict[str, list[dict]]) -> list[dict]:
    grouped: dict[str, list[dict]] = defaultdict(list)
    for meeting in meetings:
        grouped[meeting["pillar"]].append(meeting)

    pillars = []
    for pillar, rows in grouped.items():
        dates = [parse_date(row["date"]) for row in rows]
        action_items = [item for row in rows for item in row.get("action_items", [])]
        blockers = [blocker for row in rows for blocker in row.get("blockers", [])]
        questions = [question for row in rows for question in row.get("key_questions", [])]
        decisions = [decision for row in rows for decision in row.get("decisions", [])]
        epic_counter = Counter(row.get("epic") or "Sem epic" for row in rows)
        pillars.append(
            {
                "name": pillar,
                "meetings": len(rows),
                "first_meeting": min(dates).date().isoformat(),
                "last_meeting": max(dates).date().isoformat(),
                "open_actions": sum(1 for item in action_items if item.get("status") != "done"),
                "blockers": len(blockers),
                "questions": len(questions),
                "decisions": len(decisions),
                "top_epics": [{"name": name, "count": count} for name, count in epic_counter.most_common(4)],
                "top_terms": pillar_terms.get(pillar, []),
                "recent_meetings": sorted(
                    [
                        {
                            "id": row["id"],
                            "title": row["title"],
                            "date": parse_date(row["date"]).date().isoformat(),
                            "epic": row.get("epic", ""),
                            "summary": row.get("summary", ""),
                            "url": row.get("url", ""),
                        }
                        for row in rows
                    ],
                    key=lambda item: item["date"],
                    reverse=True,
                )[:4],
            }
        )
    return sorted(pillars, key=lambda item: (item["meetings"], item["open_actions"]), reverse=True)


def build_timeline(meetings: list[dict]) -> list[dict]:
    counter: dict[str, Counter[str]] = defaultdict(Counter)
    for meeting in meetings:
        counter[month_key(parse_date(meeting["date"]))][meeting["pillar"]] += 1
    return [
        {"month": key, "pillars": [{"name": name, "meetings": count} for name, count in value.items()]}
        for key, value in sorted(counter.items())
    ]


def build_analytics(meetings: list[dict]) -> dict:
    dated = [{**meeting, "_date": parse_date(meeting["date"])} for meeting in meetings]
    dates = [meeting["_date"] for meeting in dated]
    actions = []
    for meeting in dated:
        for index, item in enumerate(meeting.get("action_items", [])):
            action_key = "|".join(
                [
                    meeting["id"],
                    str(index),
                    item.get("owner", ""),
                    item.get("text", ""),
                ]
            )
            actions.append(
                item
                | {
                    "id": hashlib.sha1(action_key.encode("utf-8")).hexdigest()[:16],
                    "pillar": meeting["pillar"],
                    "meeting_title": meeting["title"],
                    "meeting_url": meeting["url"],
                    "date": meeting["_date"].date().isoformat(),
                }
            )
    blockers = [
        {
            "text": blocker,
            "pillar": meeting["pillar"],
            "meeting_title": meeting["title"],
            "meeting_url": meeting["url"],
            "date": meeting["_date"].date().isoformat(),
        }
        for meeting in dated
        for blocker in meeting.get("blockers", [])
    ]
    decisions = [
        {
            "text": decision,
            "pillar": meeting["pillar"],
            "meeting_title": meeting["title"],
            "meeting_url": meeting["url"],
            "date": meeting["_date"].date().isoformat(),
        }
        for meeting in dated
        for decision in extract_decision_candidates(meeting)
    ]
    questions = [{"text": question, "pillar": meeting["pillar"], "meeting_title": meeting["title"], "date": meeting["_date"].date().isoformat()} for meeting in dated for question in meeting.get("key_questions", [])]

    pillar_terms = tfidf_terms(meetings)
    epic_counter = Counter(meeting.get("epic") or "Sem epic" for meeting in meetings)
    folder_counter = Counter(folder for meeting in meetings for folder in meeting.get("folders", []))

    if pd is not None:
        frame = pd.DataFrame(
            {
                "pillar": [meeting["pillar"] for meeting in dated],
                "epic": [meeting.get("epic", "") for meeting in dated],
                "month": [month_key(meeting["_date"]) for meeting in dated],
                "actions": [len(meeting.get("action_items", [])) for meeting in dated],
                "blockers": [len(meeting.get("blockers", [])) for meeting in dated],
            }
        )
        heatmap_rows = (
            frame.pivot_table(index="pillar", columns="month", values="actions", aggfunc="sum", fill_value=0)
            .astype(int)
            .reset_index()
            .to_dict(orient="records")
        )
    else:
        heatmap_rows = []

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": {
            "kind": "notion-read-ai-seed",
            "database_id": "11bd0217325e4dd9a7fac0a27b69fd48",
            "records": len(meetings),
        },
        "metrics": {
            "meetings": len(meetings),
            "pillars": len({meeting["pillar"] for meeting in meetings}),
            "open_actions": sum(1 for item in actions if item.get("status") != "done"),
            "blockers": len(blockers),
            "questions": len(questions),
            "decisions": len(decisions),
            "first_meeting": min(dates).date().isoformat(),
            "last_meeting": max(dates).date().isoformat(),
        },
        "pillars": summarize_pillars(meetings, pillar_terms),
        "word_cloud": build_word_cloud(meetings),
        "word_cloud_by_pillar": {
            pillar: build_word_cloud(meetings, pillar, 45)
            for pillar in sorted({meeting["pillar"] for meeting in meetings})
        },
        "epics": [{"name": name, "meetings": count} for name, count in epic_counter.most_common()],
        "folders": [{"name": name, "meetings": count} for name, count in folder_counter.most_common()],
        "timeline": build_timeline(meetings),
        "actions": sorted(actions, key=lambda item: item["date"], reverse=True),
        "blockers": sorted(blockers, key=lambda item: item["date"], reverse=True),
        "decisions": sorted(decisions, key=lambda item: item["date"], reverse=True),
        "questions": sorted(questions, key=lambda item: item["date"], reverse=True),
        "action_heatmap": heatmap_rows,
        "meetings": [
            {
                "id": meeting["id"],
                "title": meeting["title"],
                "date": meeting["_date"].date().isoformat(),
                "pillar": meeting["pillar"],
                "epic": meeting.get("epic", ""),
                "folders": meeting.get("folders", []),
                "summary": meeting.get("summary", ""),
                "url": meeting.get("url", ""),
                "report_link": meeting.get("report_link", ""),
                "actions": len(meeting.get("action_items", [])),
                "blockers": len(meeting.get("blockers", [])),
                "questions": len(meeting.get("key_questions", [])),
            }
            for meeting in sorted(dated, key=lambda row: row["_date"], reverse=True)
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build meeting analytics JSON from Read AI / Notion exports.")
    parser.add_argument("--input", default="data/meeting_notes_seed.json", help="Raw meeting notes JSON path.")
    parser.add_argument("--output", default="public/data/meeting_analytics.json", help="Analytics output JSON path.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    meetings = json.loads(input_path.read_text(encoding="utf-8"))
    analytics = build_analytics(meetings)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(analytics, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {output_path} with {analytics['metrics']['meetings']} meetings.")


if __name__ == "__main__":
    main()
