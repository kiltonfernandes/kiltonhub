import os
import requests
from datetime import datetime, timedelta, timezone

from glasp_export import load_token, fetch_highlights


# ---------------------------------------------------------------------------
# Configuration (override via environment variables)
# ---------------------------------------------------------------------------

LOOKBACK_HOURS = int(os.getenv("LOOKBACK_HOURS", "24"))

NOTION_API = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


# ---------------------------------------------------------------------------
# Notion helpers
# ---------------------------------------------------------------------------

def load_notion_credentials() -> tuple[str, str]:
    api_key = os.getenv("NOTION_API_KEY", "").strip()
    database_id = os.getenv("NOTION_DATABASE_ID", "").strip()
    if not api_key:
        raise RuntimeError("Missing env: NOTION_API_KEY")
    if not database_id:
        raise RuntimeError("Missing env: NOTION_DATABASE_ID")
    return api_key, database_id


def _notion_headers(api_key: str) -> dict:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
    }


def get_existing_urls(api_key: str, database_id: str) -> set:
    """Fetch existing page URLs from the database for deduplication."""
    headers = _notion_headers(api_key)
    seen = set()
    start_cursor = None

    while True:
        payload = {"page_size": 100}
        if start_cursor:
            payload["start_cursor"] = start_cursor

        resp = requests.post(
            f"{NOTION_API}/databases/{database_id}/query",
            headers=headers,
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        for page in data.get("results", []):
            props = page.get("properties", {})
            url_prop = props.get("URL", {})
            url = url_prop.get("url", "")
            if url:
                seen.add(url)

        if not data.get("has_more"):
            break
        start_cursor = data.get("next_cursor")

    return seen


def create_page(api_key: str, database_id: str, doc: dict) -> None:
    """Create a Notion page for a document with highlights as blocks."""
    headers = _notion_headers(api_key)

    title = (doc.get("title") or "Untitled").strip()
    doc_url = (doc.get("url") or "").strip()
    glasp_url = (doc.get("glasp_url") or "").strip()
    tags = doc.get("tags") or []

    highlights = doc.get("highlights") or []

    # Find last highlighted_at
    last_highlighted_at = None
    for h in highlights:
        t = h.get("highlighted_at") or h.get("created_at")
        if t and (not last_highlighted_at or t > last_highlighted_at):
            last_highlighted_at = t

    # Build page properties
    properties = {
        "Name": {
            "title": [{"text": {"content": title[:2000]}}]
        },
        "URL": {"url": doc_url or None},
        "Glasp URL": {"url": glasp_url or None},
        "Highlights Count": {"number": len(highlights)},
    }

    if tags:
        properties["Tags"] = {
            "multi_select": [{"name": tag[:100]} for tag in tags[:10]]
        }

    if last_highlighted_at:
        properties["Highlighted At"] = {
            "date": {"start": last_highlighted_at}
        }

    # Build highlight blocks
    children = []
    for h in highlights:
        text = (h.get("text") or "").strip()
        if not text:
            continue

        # Quote block for highlight text
        children.append({
            "object": "block",
            "type": "quote",
            "quote": {
                "rich_text": [{"type": "text", "text": {"content": text[:2000]}}],
                "color": _map_color(h.get("color", "")),
            }
        })

        # Callout block for note (if exists)
        note = (h.get("note") or "").strip()
        if note:
            children.append({
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [{"type": "text", "text": {"content": note[:2000]}}],
                    "icon": {"type": "external", "external": {"url": "https://www.notion.so/icons/edit_gray.svg"}},
                    "color": "gray_background",
                }
            })

        # Divider between highlights
        children.append({"object": "block", "type": "divider", "divider": {}})

    # Notion allows max 100 children per request
    payload = {
        "parent": {"database_id": database_id},
        "properties": properties,
        "children": children[:100],
    }

    resp = requests.post(
        f"{NOTION_API}/pages",
        headers=headers,
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()


def _map_color(color: str) -> str:
    """Map Glasp highlight color to Notion block color."""
    mapping = {
        "yellow": "yellow_background",
        "red": "red_background",
        "green": "green_background",
        "blue": "blue_background",
        "pink": "pink_background",
        "purple": "purple_background",
        "orange": "orange_background",
    }
    return mapping.get((color or "").lower(), "default")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    token = load_token()
    api_key, database_id = load_notion_credentials()

    updated_after = (
        datetime.now(timezone.utc) - timedelta(hours=LOOKBACK_HOURS)
    ).isoformat()
    print(f"Fetching highlights updated after {updated_after} ...")

    documents = fetch_highlights(token, updated_after=updated_after)
    print(f"Fetched {len(documents)} document(s).")

    existing_urls = get_existing_urls(api_key, database_id)
    print(f"Found {len(existing_urls)} existing page(s) in Notion (for dedup).")

    created = 0
    skipped = 0
    for doc in documents:
        doc_url = (doc.get("url") or "").strip()
        if doc_url and doc_url in existing_urls:
            skipped += 1
            continue

        highlights = doc.get("highlights") or []
        if not highlights:
            continue

        create_page(api_key, database_id, doc)
        created += 1

    if created == 0:
        print("No new documents to add.")
    else:
        print(f"Created {created} new page(s) in Notion. Skipped {skipped} duplicate(s).")


if __name__ == "__main__":
    main()
