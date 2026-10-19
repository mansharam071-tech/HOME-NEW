"""Emergent managed push notifications (SuprSend relay)."""
import asyncio
import logging
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core import get_current_user

logger = logging.getLogger(__name__)

PUSH_BASE_URL = "https://integrations.emergentagent.com"
PUSH_KEY = os.environ.get("EMERGENT_PUSH_KEY", "placeholder")

_client = httpx.AsyncClient(base_url=PUSH_BASE_URL, headers={"X-Push-Key": PUSH_KEY}, timeout=10.0)

router = APIRouter(prefix="/api")


class RegisterPushBody(BaseModel):
    user_id: str
    platform: str   # "android" | "ios"
    device_token: str


@router.post("/register-push", status_code=201)
async def register_push(body: RegisterPushBody, user=Depends(get_current_user)):
    if body.user_id != user["id"]:
        raise HTTPException(403, "Cannot register push for another user")
    resp = await _client.post("/api/v1/push/users/register", json=body.model_dump())
    if resp.status_code == 401:
        raise HTTPException(500, "EMERGENT_PUSH_KEY missing or invalid")
    if resp.status_code >= 500:
        raise HTTPException(502, "Push provider unavailable")
    resp.raise_for_status()
    return {"status": "registered"}


async def send_push(recipients: list[str], data: dict, idempotency_key: str | None = None, _attempt: int = 0) -> None:
    if not recipients:
        return
    if len(recipients) > 100:
        raise ValueError("max 100 recipients per /trigger call; chunk before sending")
    if "title" not in data or "message" not in data:
        raise ValueError("data must include title and message")
    payload: dict = {"recipients": recipients, "data": data}
    if idempotency_key:
        payload["$idempotency_key"] = idempotency_key
    resp = await _client.post("/api/v1/push/trigger", json=payload)
    if resp.status_code == 401:
        raise HTTPException(500, "EMERGENT_PUSH_KEY missing or invalid")
    code = resp.json().get("code", "") if resp.headers.get("content-type", "").startswith("application/json") else ""
    if code == "idempotency_key_in_progress" and idempotency_key and _attempt < 3:
        await asyncio.sleep(3)
        return await send_push(recipients, data, idempotency_key=idempotency_key, _attempt=_attempt + 1)
    if code in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
        logger.warning(f"Push paused: {code} ({resp.status_code}): {resp.json().get('message', '')}")
        return
    if resp.status_code >= 500:
        raise HTTPException(502, "Push provider unavailable")
    resp.raise_for_status()


BOOKING_MESSAGES = {
    "assigned": ("Partner assigned", "A verified professional has been assigned to your booking {no}."),
    "en_route": ("Partner on the way", "Your professional is on the way for booking {no}."),
    "arrived": ("Partner has arrived", "Your professional has arrived. Share the Start OTP to begin {no}."),
    "in_progress": ("Job started", "Work has started on booking {no}."),
    "completed": ("Job completed", "Booking {no} is complete. Rate your experience and view your GST invoice."),
    "cancelled": ("Booking cancelled", "Booking {no} has been cancelled. Any refund goes to your wallet."),
}


async def notify_customer(booking: dict, event: str, title: str | None = None, message: str | None = None, key: str | None = None):
    """Fire-and-forget booking push to the customer. Never raises."""
    try:
        if not booking or not booking.get("customer_id"):
            return
        t, m = BOOKING_MESSAGES.get(event, (title, message))
        await send_push(
            recipients=[booking["customer_id"]],
            data={"title": title or t, "message": (message or m).format(no=booking.get("booking_no", "")),
                  "action_url": f"/booking/{booking['id']}"},
            idempotency_key=key or f"{booking['id']}_{event}",
        )
    except Exception as e:  # push failure must never block booking flow
        logger.warning(f"Push failed (non-blocking): {e}")
