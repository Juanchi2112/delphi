#!/usr/bin/env python3
from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.main import app


def main() -> None:
    client = TestClient(app)

    resp = client.get("/health")
    assert resp.status_code == 200, f"/health failed: {resp.status_code} {resp.text}"
    print("OK /health")

    resp = client.get("/metadata")
    assert resp.status_code == 200, f"/metadata failed: {resp.status_code} {resp.text}"
    print("OK /metadata")

    resp = client.get("/scores", params={"limit": 5})
    assert resp.status_code == 200, f"/scores failed: {resp.status_code} {resp.text}"
    payload = resp.json()
    assert "items" in payload, "missing items in /scores response"
    print(f"OK /scores (count={payload.get('count')})")

    items = payload.get("items", [])
    if items:
        loc_id = items[0]["id"]
        resp = client.get(f"/localidades/{loc_id}")
        assert resp.status_code == 200, f"/localidades/{{id}} failed: {resp.status_code} {resp.text}"
        print(f"OK /localidades/{loc_id}")

    print("Smoke test completed successfully.")


if __name__ == "__main__":
    main()
