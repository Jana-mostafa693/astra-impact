from __future__ import annotations

import re
from typing import Any

_LOCAL_PATH = re.compile(r"(?:^|[\\/])(?:home|root|tmp|var|mnt|workspace|Users)(?:[\\/]|$)|^[A-Za-z]:[\\\\/]|(?:^|[\\/])\.\.(?:[\\/]|$)")
_SECRET = re.compile(r"(?i)(?:password|passwd|secret|token|api[_-]?key|authorization)\s*[=:]\s*[^,;\s]+")


def _safe_string(value: str) -> str:
    value = _SECRET.sub(lambda m: m.group(0).split("=")[0].split(":")[0] + "=<redacted>", value)
    if _LOCAL_PATH.search(value):
        # Keep a non-sensitive basename useful for provenance without exposing local paths.
        value = "[local-file:" + value.replace("\\", "/").rstrip("/").split("/")[-1] + "]"
    return value


def public_safe(value: Any, key: str | None = None) -> Any:
    """Copy JSON-compatible data while removing local path and credential leaks."""
    if isinstance(value, dict):
        return {str(k): public_safe(v, str(k)) for k, v in value.items()}
    if isinstance(value, list):
        return [public_safe(v, key) for v in value]
    if isinstance(value, tuple):
        return [public_safe(v, key) for v in value]
    if isinstance(value, str):
        if key and any(token in key.lower() for token in ("path", "file", "subset", "metadata")) and not value.lower().startswith(("http://", "https://")):
            return "[local-file:" + value.replace("\\", "/").rstrip("/").split("/")[-1] + "]"
        return _safe_string(value)
    return value


def envelope(data: Any, meta: dict | None = None) -> dict:
    result = {"data": public_safe(data)}
    if meta is not None:
        result["meta"] = public_safe(meta)
    return result
