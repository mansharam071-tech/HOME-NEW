"""Tests for POST /api/transcribe (speech-to-text via EMERGENT_LLM_KEY)."""
import os
import io
import asyncio
import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "https://tri-module-app.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
TRANSCRIBE = f"{BASE_URL}/api/transcribe"


@pytest.fixture(scope="module")
def customer_token():
    r = requests.post(f"{BASE_URL}/api/auth/otp/send", json={"phone": "9800000001", "role": "customer"}, timeout=20)
    assert r.status_code == 200, r.text
    r = requests.post(f"{BASE_URL}/api/auth/otp/verify", json={"phone": "9800000001", "otp": "1234", "role": "customer"}, timeout=20)
    assert r.status_code == 200, r.text
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def speech_mp3_bytes():
    """Prefer pre-generated /tmp/q.mp3 (saves cost). Fallback: synthesise via emergent TTS."""
    p = "/tmp/q.mp3"
    if os.path.exists(p) and os.path.getsize(p) > 2048:
        return open(p, "rb").read()
    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        async def _gen():
            tts = OpenAITextToSpeech(api_key=os.environ["EMERGENT_LLM_KEY"])
            return await tts.generate(text="I need AC repair at home", model="tts-1", voice="alloy", response_format="mp3")
        data = asyncio.run(_gen())
        with open(p, "wb") as f:
            f.write(data)
        return data
    except Exception as e:
        pytest.skip(f"Cannot synthesize speech: {e}")


# --- Auth guard ---
def test_transcribe_requires_auth():
    r = requests.post(TRANSCRIBE, files={"audio": ("x.m4a", b"\x00" * 3000, "audio/m4a")}, timeout=20)
    assert r.status_code in (401, 403), r.text


# --- Too-short handling ---
def test_transcribe_too_short_returns_empty(customer_token):
    r = requests.post(TRANSCRIBE, files={"audio": ("x.m4a", b"\x00" * 100, "audio/m4a")},
                      headers={"Authorization": f"Bearer {customer_token}"}, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("text") == ""
    assert body.get("reason") == "too_short"


# --- Real transcription (en) ---
def test_transcribe_real_speech_en(customer_token, speech_mp3_bytes):
    r = requests.post(TRANSCRIBE,
                      files={"audio": ("q.mp3", speech_mp3_bytes, "audio/mpeg")},
                      data={"language": "en"},
                      headers={"Authorization": f"Bearer {customer_token}"}, timeout=60)
    assert r.status_code == 200, r.text
    body = r.json()
    text = (body.get("text") or "").lower()
    assert text, f"empty transcription: {body}"
    # Expect at least one keyword from the known prompt
    assert any(w in text for w in ("ac", "repair", "home")), f"unexpected transcription: {text!r}"


# --- Hindi language param accepted (same mp3; still returns 200) ---
def test_transcribe_language_hi_accepted(customer_token, speech_mp3_bytes):
    r = requests.post(TRANSCRIBE,
                      files={"audio": ("q.mp3", speech_mp3_bytes, "audio/mpeg")},
                      data={"language": "hi"},
                      headers={"Authorization": f"Bearer {customer_token}"}, timeout=60)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "text" in body


# --- Invalid language is silently ignored (route maps non en/hi -> None) ---
def test_transcribe_invalid_language_ignored(customer_token, speech_mp3_bytes):
    r = requests.post(TRANSCRIBE,
                      files={"audio": ("q.mp3", speech_mp3_bytes, "audio/mpeg")},
                      data={"language": "zz"},
                      headers={"Authorization": f"Bearer {customer_token}"}, timeout=60)
    assert r.status_code == 200, r.text
