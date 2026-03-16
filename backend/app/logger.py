from datetime import datetime, timezone


def log_event(event: str) -> None:
    ts = datetime.now(timezone.utc).isoformat()
    print(f"[{ts}] {event}")
