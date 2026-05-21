from __future__ import annotations

import argparse
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


DATABASE_ID = "11bd0217325e4dd9a7fac0a27b69fd48"
NOTION_VERSION = "2022-06-28"


def log(message: str) -> None:
    safe = message.encode("ascii", errors="replace").decode("ascii", errors="replace")
    print(safe, flush=True)


def request_json(method: str, url: str, token: str, payload: dict | None = None, retries: int = 4) -> dict:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Notion-Version": os.environ.get("NOTION_VERSION", NOTION_VERSION),
            "Content-Type": "application/json",
        },
    )
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            if error.code == 429 and attempt < retries:
                retry_after = int(error.headers.get("Retry-After", "2"))
                log(f"Rate limited by Notion. Waiting {retry_after}s...")
                import time

                time.sleep(retry_after)
                continue
            raise RuntimeError(f"Notion API error {error.code}: {detail}") from error
        except TimeoutError:
            if attempt < retries:
                log("Notion request timed out. Retrying...")
                continue
            raise
    raise RuntimeError("Unexpected Notion request failure")


def rich_text(value: list[dict] | None) -> str:
    if not value:
        return ""
    return "".join(part.get("plain_text", "") for part in value)


def property_value(properties: dict, name: str):
    prop = properties.get(name)
    if not prop:
        return "" if name != "Folders" else []

    prop_type = prop.get("type")
    value = prop.get(prop_type)
    if prop_type == "title":
        return rich_text(value)
    if prop_type == "rich_text":
        return rich_text(value)
    if prop_type == "select":
        return value.get("name", "") if value else ""
    if prop_type == "multi_select":
        return [item.get("name", "") for item in value or []]
    if prop_type == "date":
        return (value or {}).get("start", "")
    if prop_type == "people":
        return [person.get("name", "") for person in value or []]
    if prop_type == "url":
        return value or ""
    if prop_type == "email":
        return value or ""
    if prop_type == "phone_number":
        return value or ""
    if prop_type == "formula":
        formula_type = value.get("type")
        return value.get(formula_type, "")
    return str(value or "")


def list_pages(database_id: str, token: str, limit: int | None = None) -> list[dict]:
    pages: list[dict] = []
    cursor = None
    url = f"https://api.notion.com/v1/databases/{database_id}/query"
    while True:
        payload: dict = {
            "page_size": 100,
            "sorts": [{"property": "Date & Time", "direction": "descending"}],
        }
        if cursor:
            payload["start_cursor"] = cursor
        data = request_json("POST", url, token, payload)
        pages.extend(data.get("results", []))
        if limit and len(pages) >= limit:
            return pages[:limit]
        if not data.get("has_more"):
            return pages
        cursor = data.get("next_cursor")


def block_text(block: dict) -> str:
    block_type = block.get("type")
    content = block.get(block_type, {})
    if block_type in {"paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item", "to_do", "quote", "callout"}:
        return rich_text(content.get("rich_text"))
    if block_type == "child_page":
        return content.get("title", "")
    if block_type == "unsupported":
        return ""
    return rich_text(content.get("rich_text")) if isinstance(content, dict) else ""


def children(block_id: str, token: str) -> list[dict]:
    rows: list[dict] = []
    cursor = None
    while True:
        query = {"page_size": "100"}
        if cursor:
            query["start_cursor"] = cursor
        url = f"https://api.notion.com/v1/blocks/{block_id}/children?{urllib.parse.urlencode(query)}"
        data = request_json("GET", url, token)
        rows.extend(data.get("results", []))
        if not data.get("has_more"):
            return rows
        cursor = data.get("next_cursor")


def collect_blocks(block_id: str, token: str, depth: int = 0, max_depth: int = 2) -> list[str]:
    lines: list[str] = []
    for block in children(block_id, token):
        text = block_text(block)
        block_type = block.get("type")
        if text:
            prefix = ""
            if block_type in {"heading_1", "heading_2", "heading_3"}:
                prefix = "\n## "
            elif block_type in {"bulleted_list_item", "to_do"}:
                prefix = "- "
            lines.append(f"{prefix}{text}")
        if block.get("has_children") and depth < max_depth:
            lines.extend(collect_blocks(block["id"], token, depth + 1, max_depth))
    return lines


def section(content: str, title: str) -> str:
    pattern = rf"##\s*(?:[^\nA-Za-zÀ-ÿ]*)?{re.escape(title)}\s*\n(.*?)(?=\n##\s|\Z)"
    match = re.search(pattern, content, flags=re.IGNORECASE | re.DOTALL)
    return match.group(1).strip() if match else ""


def bullets(text: str) -> list[str]:
    rows = []
    for line in text.splitlines():
        cleaned = re.sub(r"^\s*[-*]\s*", "", line).strip()
        if cleaned:
            rows.append(cleaned)
    return rows


def to_seed_record(page: dict, token: str) -> dict:
    properties = page.get("properties", {})
    content = "\n".join(collect_blocks(page["id"], token))
    action_lines = bullets(section(content, "Action Items"))
    question_lines = bullets(section(content, "Key Questions"))
    summary = section(content, "Summary") or property_value(properties, "Resumo")

    date_value = property_value(properties, "Date & Time") or page.get("created_time", "")
    participants = property_value(properties, "Participants")
    if isinstance(participants, str):
        participants = [name.strip() for name in participants.split(",") if name.strip()]

    return {
        "id": page["id"].replace("-", ""),
        "title": property_value(properties, "Title") or page.get("id"),
        "url": page.get("url", ""),
        "report_link": property_value(properties, "Report link"),
        "date": date_value,
        "pillar": property_value(properties, "Pillar") or "Sem pillar",
        "epic": property_value(properties, "Epic") or "Sem epic",
        "folders": property_value(properties, "Folders"),
        "owner": property_value(properties, "Owner"),
        "participants": participants,
        "summary": summary,
        "action_items": [{"owner": "TBD", "text": item, "status": "open"} for item in action_lines],
        "key_questions": question_lines,
        "decisions": bullets(section(content, "Decisions")),
        "blockers": [line for line in bullets(summary) if re.search(r"blocked|bloque|pending|pendente|aguard", line, re.I)],
        "transcript": section(content, "Transcript") or property_value(properties, "Text") or content,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync Read AI meeting notes from Notion into local seed JSON.")
    parser.add_argument("--database-id", default=os.environ.get("NOTION_DATABASE_ID", DATABASE_ID))
    parser.add_argument("--output", default="data/meeting_notes_seed.json")
    parser.add_argument("--limit", type=int, default=int(os.environ.get("NOTION_SYNC_LIMIT", "0")) or None)
    args = parser.parse_args()

    token = os.environ.get("NOTION_TOKEN")
    if not token:
        raise SystemExit("Missing NOTION_TOKEN. Add it as a GitHub/Vercel secret before running sync.")

    pages = list_pages(args.database_id, token, args.limit)
    log(f"Found {len(pages)} Notion pages to sync.")
    records = []
    for index, page in enumerate(pages, start=1):
        title = property_value(page.get("properties", {}), "Title") or page.get("id")
        log(f"[{index}/{len(pages)}] Syncing {title}")
        records.append(to_seed_record(page, token))
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Synced {len(records)} Notion meetings into {output_path}.")


if __name__ == "__main__":
    main()
