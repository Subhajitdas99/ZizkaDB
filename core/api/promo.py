from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.promo import PromoError, promo_public_info, validate_promo

router = APIRouter()


class ValidatePromoBody(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    plan: str = Field(min_length=1, max_length=20)


@router.get("/{code}")
async def get_promo(code: str):
    info = promo_public_info(code)
    if not info:
        raise HTTPException(status_code=404, detail="Promo code not found")
    return info


@router.post("/validate")
async def validate_promo_route(body: ValidatePromoBody):
    try:
        offer = validate_promo(body.code, body.plan)
    except PromoError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    if not offer:
        raise HTTPException(status_code=400, detail="Promo code is required")

    return {
        "valid": True,
        "code": offer.code,
        "label": offer.label,
        "plan": offer.plan,
        "trial_days": offer.trial_days,
        "trial_months": offer.trial_days // 30,
        "partner": offer.partner,
    }
