from __future__ import annotations

import argparse
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
    "a", "ao", "aos", "as", "ate", "com", "como", "da", "das", "de", "do", "dos", "e", "em",
    "entre", "foi", "foram", "mais", "mas", "na", "nas", "no", "nos", "o", "os", "ou", "para",
    "por", "que", "se", "sem", "ser", "sua", "sao", "um", "uma", "the", "and", "for", "from",
    "with", "that", "this", "was", "were", "are", "will", "should", "need", "needs", "participant",
    "meeting", "reuniao", "team", "item", "itens", "sobre", "ainda", "cada", "isso", "esta", "esse",
    "essa", "eles", "elas", "voce", "voce", "todos", "todas", "tudo", "todo", "onde", "qual", "quais",
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
    return " ".join(sections)


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
        ngram_range=(1, 2),
        max_features=180,
    )
    matrix = vectorizer.fit_transform(docs)
    feature_names = vectorizer.get_feature_names_out()
    by_pillar = defaultdict(Counter)
    for idx, meeting in enumerate(meetings):
        row = matrix[idx].toarray()[0]
        top_indexes = row.argsort()[-limit * 2 :][::-1]
        for feature_idx in top_indexes:
            score = float(row[feature_idx])
            if score > 0:
                by_pillar[meeting["pillar"]][feature_names[feature_idx]] += score
    return {
        pillar: [{"term": term, "score": round(score, 4)} for term, score in counts.most_common(limit)]
        for pillar, counts in by_pillar.items()
    }


def build_word_cloud(meetings: list[dict], selected_pillar: str | None = None, limit: int = 60) -> list[dict]:
    counter: Counter[str] = Counter()
    for meeting in meetings:
        if selected_pillar and meeting["pillar"] != selected_pillar:
            continue
        counter.update(tokenize(meeting_text(meeting)))

    if not counter:
        return []

    most_common = counter.most_common(limit)
    max_count = most_common[0][1]
    min_count = most_common[-1][1]
    spread = max(max_count - min_count, 1)
    words = []
    for index, (term, count) in enumerate(most_common):
        weight = (count - min_count) / spread
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
    actions = [item | {"pillar": meeting["pillar"], "meeting_title": meeting["title"], "meeting_url": meeting["url"], "date": meeting["_date"].date().isoformat()} for meeting in dated for item in meeting.get("action_items", [])]
    blockers = [{"text": blocker, "pillar": meeting["pillar"], "meeting_title": meeting["title"], "date": meeting["_date"].date().isoformat()} for meeting in dated for blocker in meeting.get("blockers", [])]
    decisions = [{"text": decision, "pillar": meeting["pillar"], "meeting_title": meeting["title"], "date": meeting["_date"].date().isoformat()} for meeting in dated for decision in meeting.get("decisions", [])]
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
