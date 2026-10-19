"""Speech-to-text (Emergent managed OpenAI transcription) for voice search / chatbot input."""
import os
import tempfile
import logging
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from emergentintegrations.llm.openai import OpenAISpeechToText
from core import get_current_user

load_dotenv()
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

MAX_BYTES = 25 * 1024 * 1024
MIN_BYTES = 2 * 1024
PROMPT = "SMARTFIX home services: AC repair, plumbing, electrician, cleaning, salon, painting, pest control, booking, refund, wallet."


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = Form(None), user=Depends(get_current_user)):
    data = await audio.read()
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
