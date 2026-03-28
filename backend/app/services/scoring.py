from __future__ import annotations

from typing import Literal

RiskLevel = Literal["low", "medium", "high"]

LOW_THRESHOLD = 0.35
HIGH_THRESHOLD = 0.65


def to_risk_level(score: float) -> RiskLevel:
    if score < LOW_THRESHOLD:
        return "low"
    if score < HIGH_THRESHOLD:
        return "medium"
    return "high"
