"""Shared Glasp API client - token loading, fetch with pagination + retry."""

import os
import time
import requests
from urllib.parse import urlencode

GLASP_API = "https://api.glasp.co/v1/highlights/export"
MAX_RETRIES = 3


def load_token() -> str:
    """Load and sanitise the Glasp access token from env."""
    raw = os.getenv("GLASP_ACCESS_TOKEN", "")
    token = raw.strip().strip('"').strip("'")
    if token.lower().startswith("bearer "):
        token = token.split(" ", 1)[1].strip()
    if not token:
        raise RuntimeError("Missing env: GLASP_ACCESS_TOKEN")
    return token


def _request_with_retry(url: str, headers: dict) -> requests.Response:
    """GET with exponential back-off on 429."""
    for attempt in range(MAX_RETRIES):
        r = requests.get(url, headers=headers, timeout=30)

        if r.status_code == 429:
            wait = 5 * (attempt + 1)
            print(f"Rate limited (429). Sleeping {wait}s then retry...")
            time.sleep(wait)
            continue

        r.raise_for_status()
        return r

    raise RuntimeError("Rate limit persisted after all retries.")


def fetch_highlights(token: str, *, updated_after: str | None = None) -> list[dict]:
    """Fetch all highlight pages, optionally filtered by updatedAfter."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "User-Agent": "glasp-export/1.0",
    }

    all_results: list[dict] = []
    page_cursor: str | None = None

    while True:
        params: dict[str, str] = {}
        if updated_after:
            params["updatedAfter"] = updated_after
        if page_cursor:
            params["pageCursor"] = page_cursor

        url = f"{GLASP_API}?{urlencode(params)}" if params else GLASP_API
        data = _request_with_retry(url, headers).json()

        all_results.extend(data.get("results", []))

        page_cursor = data.get("nextPageCursor")
        if not page_cursor:
            break

    return all_results
