"""Speech-to-text (Emergent managed OpenAI transcription) for voice search / chatbot input."""
import os
import tempfile
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from emergentintegrations.llm.openai import OpenAISpeechToText
from core import db, get_current_user

load_dotenv()
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

MAX_BYTES = 25 * 1024 * 1024
MIN_BYTES = 2 * 1024
DAILY_LIMIT = int(os.environ.get("VOICE_DAILY_LIMIT", "40"))
MIN_GAP_SECONDS = 3
PROMPT = "SMARTFIX home services: AC repair, plumbing, electrician, cleaning, salon, painting, pest control, booking, refund, wallet."


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = Form(None), user=Depends(get_current_user)):
    # per-user rate limit: min gap between requests + daily cap (protects universal key credits)
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    nowts = datetime.now(timezone.utc).timestamp()
    u = await db.voice_usage.find_one({"user_id": user["id"], "day": day}) or {}
    if u.get("count", 0) >= DAILY_LIMIT:
        raise HTTPException(429, "Daily voice limit reached. Please type instead.")
    if nowts - u.get("last", 0) < MIN_GAP_SECONDS:
        raise HTTPException(429, "Please wait a moment before speaking again.")
    await db.voice_usage.update_one({"user_id": user["id"], "day": day}, {"$inc": {"count": 1}, "$set": {"last": nowts}}, upsert=True)
    data = await audio.read(MAX_BYTES + 1)
    if len(data) < MIN_BYTES:
        return {"text": "", "reason": "too_short"}
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Recording too long")
    name = (audio.filename or "recording.m4a").lower()
    ext = name.rsplit(".", 1)[-1] if "." in name else "m4a"
    if ext not in ("mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"):
        ext = "m4a"
    lang = language if language in ("en", "hi") else None
    with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        try:
            stt = OpenAISpeechToText(api_key=os.environ["EMERGENT_LLM_KEY"])
            with open(tmp.name, "rb") as f:
                resp = await stt.transcribe(file=f, model="gpt-4o-mini-transcribe", response_format="json",
                                            language=lang, prompt=PROMPT, temperature=0.0)
        except Exception as e:
            logger.warning(f"Transcription failed: {e}")
            raise HTTPException(502, "Could not transcribe audio, please try again")
    return {"text": (getattr(resp, "text", "") or "").strip(), "reason": None}
