import os
import json
import time
import requests
from datetime import datetime, timedelta, timezone

from glasp_export import load_token, fetch_highlights


# ---------------------------------------------------------------------------
# Configuration (override via environment variables)
# ---------------------------------------------------------------------------

LOOKBACK_HOURS = int(os.getenv("LOOKBACK_HOURS", "24"))
SHEET_TAB = os.getenv("SHEET_TAB", "Highlights")

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
TOKEN_URL = "https://oauth2.googleapis.com/token"
SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets"

HEADER_ROW = [
    "Timestamp",
    "Document Title",
    "Document URL",
    "Glasp URL",
    "Highlight Text",
    "Note",
    "Tags",
    "Color",
    "Highlighted At",
]


# ---------------------------------------------------------------------------
# Google Service Account auth
# ---------------------------------------------------------------------------

def _get_access_token(service_account: dict) -> str:
    """Exchange service account credentials for a short-lived access token."""
    import base64, hashlib, hmac
    from urllib.parse import urlencode

    # Build JWT
    now = int(time.time())
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "RS256", "typ": "JWT"}).encode()
    ).rstrip(b"=").decode()

    payload = base64.urlsafe_b64encode(
        json.dumps({
            "iss": service_account["client_email"],
            "scope": " ".join(SCOPES),
            "aud": TOKEN_URL,
            "iat": now,
            "exp": now + 3600,
        }).encode()
    ).rstrip(b"=").decode()

    signing_input = f"{header}.{payload}"

    # Sign with RSA private key using cryptography library
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding

    private_key = serialization.load_pem_private_key(
        service_account["private_key"].encode(), password=None
    )
    signature = base64.urlsafe_b64encode(
        private_key.sign(signing_input.encode(), padding.PKCS1v15(), hashes.SHA256())
    ).rstrip(b"=").decode()

    jwt = f"{signing_input}.{signature}"

    # Exchange JWT for access token
    resp = requests.post(TOKEN_URL, data={
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt,
    }, timeout=30)
    resp.raise_for_status()
    return resp.json()["access_token"]


def load_service_account() -> dict:
    """Load Google Service Account JSON from environment variable."""
    raw = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        raise RuntimeError("Missing env: GOOGLE_SERVICE_ACCOUNT_JSON")
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Invalid GOOGLE_SERVICE_ACCOUNT_JSON: {e}")


def load_sheet_id() -> str:
    sheet_id = os.getenv("GOOGLE_SHEET_ID", "").strip()
    if not sheet_id:
        raise RuntimeError("Missing env: GOOGLE_SHEET_ID")
    return sheet_id


# ---------------------------------------------------------------------------
# Google Sheets helpers
# ---------------------------------------------------------------------------

def _sheets_request(method: str, url: str, token: str, **kwargs) -> requests.Response:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    resp = requests.request(method, url, headers=headers, timeout=30, **kwargs)
    resp.raise_for_status()
    return resp


def ensure_header(sheet_id: str, token: str) -> None:
    """Create header row if the sheet is empty."""
    url = f"{SHEETS_API}/{sheet_id}/values/{SHEET_TAB}!A1:Z1"
    resp = _sheets_request("GET", url, token)
    values = resp.json().get("values", [])
    if not values:
        _sheets_request("PUT", f"{url}?valueInputOption=RAW", token,
                        json={"values": [HEADER_ROW]})
        print("Header row created.")


def get_existing_highlight_ids(sheet_id: str, token: str) -> set:
    """
    Fetch all values in column E (Highlight Text) and column C (URL) to build
    a dedup key set. We use URL + highlight text as the unique identifier.
    """
    url = f"{SHEETS_API}/{sheet_id}/values/{SHEET_TAB}!C:F"
    resp = _sheets_request("GET", url, token)
    rows = resp.json().get("values", [])
    seen = set()
    for row in rows[1:]:  # skip header
        doc_url = row[0] if len(row) > 0 else ""
        highlight_text = row[2] if len(row) > 2 else ""
        if doc_url and highlight_text:
            seen.add(f"{doc_url}|||{highlight_text[:100]}")
    return seen


def append_rows(sheet_id: str, token: str, rows: list[list]) -> int:
    """Append rows to the sheet. Returns number of rows appended."""
    if not rows:
        return 0
    url = f"{SHEETS_API}/{sheet_id}/values/{SHEET_TAB}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS"
    _sheets_request("POST", url, token, json={"values": rows})
    return len(rows)


# ---------------------------------------------------------------------------
# Main logic
# ---------------------------------------------------------------------------

def build_rows(documents: list[dict], existing: set) -> list[list]:
    """Convert Glasp documents to sheet rows, skipping duplicates."""
    rows = []
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

            rows.append([
                now_str,
                title,
                doc_url,
                glasp_url,
                text,
                note,
                tags,
                color,
                highlighted_at,
            ])
            existing.add(dedup_key)

    return rows


def main() -> None:
    token = load_token()
    service_account = load_service_account()
    sheet_id = load_sheet_id()

    print("Authenticating with Google Sheets...")
    access_token = _get_access_token(service_account)

    updated_after = (
        datetime.now(timezone.utc) - timedelta(hours=LOOKBACK_HOURS)
    ).isoformat()
    print(f"Fetching highlights updated after {updated_after} ...")

    documents = fetch_highlights(token, updated_after=updated_after)
    print(f"Fetched {len(documents)} document(s).")

    ensure_header(sheet_id, access_token)
    existing = get_existing_highlight_ids(sheet_id, access_token)
    print(f"Found {len(existing)} existing highlight(s) in sheet (for dedup).")

    rows = build_rows(documents, existing)
    count = append_rows(sheet_id, access_token, rows)

    if count == 0:
        print("No new highlights to add.")
    else:
        print(f"Added {count} new highlight(s) to Google Sheet.")


if __name__ == "__main__":
    main()