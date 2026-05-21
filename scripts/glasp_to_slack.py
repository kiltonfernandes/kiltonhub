"""Fetch recent Glasp highlights and post them to Slack."""

import os
import requests
from datetime import datetime, timedelta, timezone

from glasp_export import load_token, fetch_highlights


# ---------------------------------------------------------------------------
# Configuration (override via environment variables)
# ---------------------------------------------------------------------------

LOOKBACK_HOURS = int(os.getenv("LOOKBACK_HOURS", "24"))
MAX_DOCS = int(os.getenv("MAX_DOCS", "5"))
MAX_HIGHLIGHTS_PER_DOC = int(os.getenv("MAX_HIGHLIGHTS_PER_DOC", "10"))


def load_slack_webhook() -> str:
    """Load the Slack webhook URL from env."""
    url = os.getenv("SLACK_WEBHOOK_URL", "").strip()
    if not url:
        raise RuntimeError("Missing env: SLACK_WEBHOOK_URL")
    return url


# ---------------------------------------------------------------------------
# Slack formatting + posting
# ---------------------------------------------------------------------------

def _truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[: limit - 3] + "..."


def post_to_slack(
    webhook_url: str,
    documents: list[dict],
    *,
    max_docs: int = MAX_DOCS,
    max_highlights_per_doc: int = MAX_HIGHLIGHTS_PER_DOC,
) -> None:
    """Format highlights and post to Slack via incoming webhook."""
    posted = 0

    for doc in documents:
        title = (doc.get("title") or "").strip() or "Untitled"
        source_url = (doc.get("url") or "").strip()
        glasp_url = (doc.get("glasp_url") or "").strip()

        # --- clean highlights ------------------------------------------------
        highlights = doc.get("highlights") or []
        cleaned: list[tuple[str, str]] = []
        for hl in highlights:
            text = (hl.get("text") or "").strip()
            if not text:
                continue
            note = (hl.get("note") or "").strip()
            cleaned.append((text, note))

        if not cleaned:
            continue

        cleaned = cleaned[:max_highlights_per_doc]

        # --- build Slack message ---------------------------------------------
        lines: list[str] = []
        for i, (text, note) in enumerate(cleaned, 1):
            line = f"{i}. {_truncate(text, 500)}"
            if note:
                line += f"\n   _Note_: {_truncate(note, 200)}"
            lines.append(line)

        link_parts: list[str] = []
        if source_url:
            link_parts.append(f"<{source_url}|Open source>")
        if glasp_url:
            link_parts.append(f"<{glasp_url}|Open on Glasp>")

        thumb = (doc.get("thumbnail_url") or "").strip()

        section: dict = {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*{title}*\n\n" + "\n\n".join(lines)},
        }
        if thumb:
            section["accessory"] = {
                "type": "image",
                "image_url": thumb,
                "alt_text": "thumbnail",
            }

        blocks: list[dict] = [section]

        if link_parts:
            link_line = " \u2022 ".join(link_parts)
            blocks.append(
                {
                    "type": "context",
                    "elements": [{"type": "mrkdwn", "text": "\U0001f517 " + link_line}],
                }
            )

        payload = {
            "text": f"New Glasp Highlights: {title}",
            "blocks": blocks,
            "unfurl_links": False,
            "unfurl_media": False,
        }

        r = requests.post(webhook_url, json=payload, timeout=30)
        r.raise_for_status()

        posted += 1
        if posted >= max_docs:
            break

    if posted == 0:
        print("No new highlights to post.")
    else:
        print(f"Posted {posted} document(s) to Slack.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    token = load_token()
    webhook = load_slack_webhook()

    updated_after = (
        datetime.now(timezone.utc) - timedelta(hours=LOOKBACK_HOURS)
    ).isoformat()
    print(f"Fetching highlights updated after {updated_after}...")

    documents = fetch_highlights(token, updated_after=updated_after)
    print(f"Fetched {len(documents)} document(s).")

    post_to_slack(webhook, documents)


if __name__ == "__main__":
    main()
