"""Promotional codes for managed-cloud signups."""

from __future__ import annotations

from dataclasses import dataclass

# Hardcoded offers — add DB-backed codes when volume grows.
PROMO_CODES: dict[str, dict] = {
    "SF180": {
        "label": "Station F Startup Offer",
        "trial_days": 180,
        "allowed_plans": {"pro", "team", "solo"},
        "partner": "Station F",
    },
}


@dataclass(frozen=True)
class PromoOffer:
    code: str
    label: str
    trial_days: int
    plan: str
    partner: str | None = None


class PromoError(ValueError):
    pass


def normalize_plan(plan: str | None) -> str | None:
    if not plan:
        return None
    p = plan.lower().strip()
    if p == "solo":
        return "pro"
    if p in ("pro", "team"):
        return p
    return None


def validate_promo(code: str | None, plan: str | None) -> PromoOffer | None:
    if not code or not str(code).strip():
        return None

    normalized_code = str(code).strip().upper()
    cfg = PROMO_CODES.get(normalized_code)
    if not cfg:
        raise PromoError("Promo code is not valid")

    normalized_plan = normalize_plan(plan)
    if not normalized_plan:
        raise PromoError("Choose Pro or Team to use this offer")

    allowed = cfg["allowed_plans"]
    if normalized_plan not in allowed and plan and plan.lower().strip() in allowed:
        normalized_plan = normalize_plan(plan.lower().strip())

    if normalized_plan not in allowed:
        raise PromoError(f"Code {normalized_code} is not valid for the selected plan")

    return PromoOffer(
        code=normalized_code,
        label=cfg["label"],
        trial_days=int(cfg["trial_days"]),
        plan=normalized_plan,
        partner=cfg.get("partner"),
    )


def promo_public_info(code: str) -> dict | None:
    normalized_code = str(code).strip().upper()
    cfg = PROMO_CODES.get(normalized_code)
    if not cfg:
        return None
    return {
        "code": normalized_code,
        "label": cfg["label"],
        "trial_days": cfg["trial_days"],
        "trial_months": cfg["trial_days"] // 30,
        "allowed_plans": sorted(
            {"pro" if p == "solo" else p for p in cfg["allowed_plans"]}
        ),
        "partner": cfg.get("partner"),
    }
