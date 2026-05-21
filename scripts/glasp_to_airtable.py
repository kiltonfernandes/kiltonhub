import os
import requests
from datetime import datetime, timedelta, timezone

from glasp_export import load_token, fetch_highlights


# ---------------------------------------------------------------------------
# Configuration (override via environment variables)
# ---------------------------------------------------------------------------

LOOKBACK_HOURS = int(os.getenv("LOOKBACK_HOURS", "24"))
AIRTABLE_TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME", "Highlights")

AIRTABLE_API = "https://api.airtable.com/v0"


# ---------------------------------------------------------------------------
# Airtable helpers
# ---------------------------------------------------------------------------

def load_airtable_credentials() -> tuple[str, str]:
    api_key = os.getenv("AIRTABLE_API_KEY", "").strip()
    base_id = os.getenv("AIRTABLE_BASE_ID", "").strip()
    if not api_key:
        raise RuntimeError("Missing env: AIRTABLE_API_KEY")
    if not base_id:
        raise RuntimeError("Missing env: AIRTABLE_BASE_ID")
    return api_key, base_id


def get_existing_records(api_key: str, base_id: str) -> set:
    """Fetch existing records for deduplication using URL + Highlight Text."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    seen = set()
    offset = None

    while True:
        params = {
            "fields[]": ["Document URL", "Highlight Text"],
            "pageSize": 100,
        }
        if offset:
            params["offset"] = offset

        url = f"{AIRTABLE_API}/{base_id}/{AIRTABLE_TABLE_NAME}"
        resp = requests.get(url, headers=headers, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        for record in data.get("records", []):
            fields = record.get("fields", {})
            doc_url = fields.get("Document URL", "")
            highlight_text = fields.get("Highlight Text", "")
            if doc_url and highlight_text:
                seen.add(f"{doc_url}|||{highlight_text[:100]}")

        offset = data.get("offset")
        if not offset:
            break

    return seen


def create_records(api_key: str, base_id: str, records: list[dict]) -> int:
    """Create records in Airtable in batches of 10 (API limit)."""
    if not records:
        return 0

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    url = f"{AIRTABLE_API}/{base_id}/{AIRTABLE_TABLE_NAME}"
    total = 0

    # Airtable allows max 10 records per request
    for i in range(0, len(records), 10):
        batch = records[i:i + 10]
        payload = {"records": [{"fields": r} for r in batch]}
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        total += len(batch)

    return total


# ---------------------------------------------------------------------------
# Main logic
# ---------------------------------------------------------------------------

def build_records(documents: list[dict], existing: set) -> list[dict]:
    """Convert Glasp documents to Airtable records, skipping duplicates."""
    records = []
    now_str = datetime.now(timezone.utc).isoformat()

    for doc in documents:
        title = (doc.get("title") or "").strip()
        doc_url = (doc.get("url") or "").strip()
        glasp_url = (doc.get("glasp_url") or "").strip()
        tags = ", ".join(doc.get("tags") or [])

        highlights = doc.get("highlights") or []
        for h in highlights:
            text = (h.get("text") or "").strip()
            if not text:
                continue

            dedup_key = f"{doc_url}|||{text[:100]}"
            if dedup_key in existing:
                continue

            note = (h.get("note") or "").strip()
            color = (h.get("color") or "").strip()
            highlighted_at = h.get("highlighted_at") or h.get("created_at") or ""

            record = {
                "Timestamp": now_str,
                "Document Title": title,
                "Document URL": doc_url,
                "Glasp URL": glasp_url,
                "Highlight Text": text,
                "Tags": tags,
                "Color": color,
                "Highlighted At": highlighted_at,
            }
            if note:
                record["Note"] = note

            records.append(record)
            existing.add(dedup_key)

    return records


def main() -> None:
    token = load_token()
    api_key, base_id = load_airtable_credentials()

    updated_after = (
        datetime.now(timezone.utc) - timedelta(hours=LOOKBACK_HOURS)
    ).isoformat()
    print(f"Fetching highlights updated after {updated_after} ...")

    documents = fetch_highlights(token, updated_after=updated_after)
    print(f"Fetched {len(documents)} document(s).")

    existing = get_existing_records(api_key, base_id)
    print(f"Found {len(existing)} existing highlight(s) in Airtable (for dedup).")

    records = build_records(documents, existing)
    count = create_records(api_key, base_id, records)

    if count == 0:
        print("No new highlights to add.")
    else:
        print(f"Added {count} new highlight(s) to Airtable.")


if __name__ == "__main__":
    main()