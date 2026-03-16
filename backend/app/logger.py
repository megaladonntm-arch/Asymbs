from datetime import datetime


def log_event(event: str) -> None:
    ts = datetime.utcnow().isoformat()
    print(f"[{ts}] {event}")
