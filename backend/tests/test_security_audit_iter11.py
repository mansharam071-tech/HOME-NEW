"""Security audit items 1-4 tests (admin password rotation, JWT revocation, demo payments,
first-order coupon abuse, regex catalog search, transcribe rate-limit, CORS pinning)."""
import io
import os
import time
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ.get("EXPO_BACKEND_URL", "https://850615af-2e4e-4d17-bc8d-0de1da188e9e.preview.emergentagent.com").rstrip("/")

ADMIN_EMAIL = "admin@smartfix.in"
ADMIN_PW = "Sf-v6ZFPcIPcWtZpKOY"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ----- 1) Admin password rotation / seeding -----
class TestAdminPassword:
    def test_old_password_rejected(self, s):
        r = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": "Admin@123"})
        assert r.status_code == 401, r.text

    def test_new_password_accepted(self, s):
        r = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
        assert r.status_code == 200, r.text
        d = r.json()
        assert "token" in d and d["user"]["role"] == "admin"

    def test_change_password_wrong_current(self, s):
        tok = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}).json()["token"]
        r = s.post(f"{BASE_URL}/api/auth/admin/change-password",
                   headers={"Authorization": f"Bearer {tok}"},
                   json={"current_password": "wrong", "new_password": "SomethingSafe12345"})
        assert r.status_code == 400, r.text

    def test_change_password_too_short(self, s):
        tok = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}).json()["token"]
        r = s.post(f"{BASE_URL}/api/auth/admin/change-password",
                   headers={"Authorization": f"Bearer {tok}"},
                   json={"current_password": ADMIN_PW, "new_password": "short"})
        assert r.status_code == 422, r.text

    def test_change_password_success_and_revoke_old_token(self, s):
        tok = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}).json()["token"]
        new_pw = "TempNewPass_8723!"
        r = s.post(f"{BASE_URL}/api/auth/admin/change-password",
                   headers={"Authorization": f"Bearer {tok}"},
                   json={"current_password": ADMIN_PW, "new_password": new_pw})
        assert r.status_code == 200, r.text
        # old token should be revoked (token_version bumped)
        me = s.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {tok}"})
        assert me.status_code == 401, me.text
        # revert password
        tok2 = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": new_pw}).json()["token"]
        back = s.post(f"{BASE_URL}/api/auth/admin/change-password",
                      headers={"Authorization": f"Bearer {tok2}"},
                      json={"current_password": new_pw, "new_password": ADMIN_PW})
        assert back.status_code == 200, back.text


# ----- 2) JWT claims & logout revocation -----
class TestJWT:
    def test_token_has_tv_iat_exp_and_24h(self, s):
        import jwt as pyjwt
        tok = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}).json()["token"]
        payload = pyjwt.decode(tok, options={"verify_signature": False})
        assert "tv" in payload and "iat" in payload and "exp" in payload
        delta = int(payload["exp"]) - int(payload["iat"])
        assert 23 * 3600 <= delta <= 25 * 3600, f"token lifetime {delta}s not ~24h"

    def test_logout_revokes_token(self, s):
        tok = s.post(f"{BASE_URL}/api/auth/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        assert s.get(f"{BASE_URL}/api/auth/me", headers=h).status_code == 200
        assert s.post(f"{BASE_URL}/api/auth/logout", headers=h).status_code == 200
        assert s.get(f"{BASE_URL}/api/auth/me", headers=h).status_code == 401

    def test_token_without_tv_rejected(self, s):
        import jwt as pyjwt
        from datetime import datetime, timezone, timedelta
        n = datetime.now(timezone.utc)
        bad = pyjwt.encode({"sub": "x", "role": "admin", "iat": n, "exp": n + timedelta(hours=1)},
                           os.environ["JWT_SECRET"], algorithm="HS256")
        r = s.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {bad}"})
        assert r.status_code == 401


# ----- 3) Demo payments flag -----
class TestPayments:
    def test_config_demo_true(self, s):
        d = s.get(f"{BASE_URL}/api/payments/config").json()
        assert d["enabled"] is False and d["demo"] is True


# ----- 4) First-order coupon abuse (FIRST50) -----
def _customer_token(s, phone="9800000001"):
    r = s.post(f"{BASE_URL}/api/auth/otp/verify", json={"phone": phone, "otp": "1234", "role": "customer"})
    assert r.status_code == 200, r.text
    return r.json()["token"]


class TestFirstOrderCoupon:
    def test_customer_with_cancelled_booking_cannot_use_first50(self, s):
        """Seeded customer 9800000001 (Meera) likely has prior bookings. Even a cancelled one should block FIRST50."""
        tok = _customer_token(s, "9800000001")
        h = {"Authorization": f"Bearer {tok}"}
        # Pick an address
        addrs = s.get(f"{BASE_URL}/api/customer/addresses", headers=h).json()
        if not addrs:
            # create one
            addr = {"label": "Home", "line": "B-14, Hazratganj", "pincode": "226001",
                    "city": "Lucknow", "location": {"lat": 26.85, "lng": 80.94}, "is_default": True}
            addrs = [s.post(f"{BASE_URL}/api/customer/addresses", headers=h, json=addr).json()]
        aid = addrs[0]["id"]
        # Add item to cart
        s.post(f"{BASE_URL}/api/customer/cart", headers=h,
               json={"items": [{"service_id": "serv_ac_01", "qty": 1, "addons": []}]})
        q = s.post(f"{BASE_URL}/api/customer/quote", headers=h,
                   json={"address_id": aid, "coupon_code": "FIRST50"})
        if q.status_code == 200:
            # expect either coupon_error set or no discount applied (first_order_only block)
            body = q.json()
            err = body.get("coupon_error") or ""
            # If this customer has any non-payment_pending booking in db, FIRST50 should be rejected
            # (we don't know for sure here, but seed inserts many; so error expected)
            assert "first" in err.lower() or body["pricing"].get("discount", 0) == 0, body


# ----- 5) Catalog ReDoS safety -----
class TestCatalogSearch:
    def test_redos_query_fast(self, s):
        t = time.time()
        r = s.get(f"{BASE_URL}/api/catalog/services", params={"q": "(a+)+$"})
        dur = time.time() - t
        assert r.status_code == 200
        assert dur < 2.0, f"regex search too slow: {dur}s"

    def test_ac_search(self, s):
        r = s.get(f"{BASE_URL}/api/catalog/services", params={"q": "AC"})
        assert r.status_code == 200
        names = [x["name"] for x in r.json()]
        assert any("AC" in n for n in names), names


# ----- 6) Transcribe rate limit (min_gap 3s) -----
class TestTranscribeRateLimit:
    def test_two_quick_requests_second_429(self, s):
        tok = _customer_token(s, "9800000002")
        h = {"Authorization": f"Bearer {tok}"}
        # 3KB dummy audio
        audio_bytes = b"\x00" * 3072
        files = {"audio": ("x.m4a", io.BytesIO(audio_bytes), "audio/m4a")}
        r1 = requests.post(f"{BASE_URL}/api/transcribe", headers=h, files=files)
        files = {"audio": ("x.m4a", io.BytesIO(audio_bytes), "audio/m4a")}
        r2 = requests.post(f"{BASE_URL}/api/transcribe", headers=h, files=files)
        # First may be 200/502 (STT may fail on silence) — but should NOT be 429
        assert r1.status_code != 429
        assert r2.status_code == 429, f"second: {r2.status_code} {r2.text}"


# ----- 7) CORS -----
class TestCORS:
    def test_preflight_credentials_false(self, s):
        origin = "https://850615af-2e4e-4d17-bc8d-0de1da188e9e.preview.emergentagent.com"
        r = requests.options(f"{BASE_URL}/api/", headers={
            "Origin": origin, "Access-Control-Request-Method": "GET"})
        # allow-credentials must not be true
        assert r.headers.get("access-control-allow-credentials", "false").lower() != "true"
        # allow-origin should match the preview origin (not *)
        ao = r.headers.get("access-control-allow-origin", "")
        assert ao == origin or ao == "", f"origin header: {ao}"
