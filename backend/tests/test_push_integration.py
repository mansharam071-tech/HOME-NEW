"""Tests for Emergent push notification integration + booking regression (iteration_7)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/") or \
           os.environ.get("EXPO_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL must be set in env"


# -------------- Fixtures --------------
@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _otp_login(s, phone, role):
    r = s.post(f"{BASE_URL}/api/auth/otp/send", json={"phone": phone, "role": role})
    assert r.status_code == 200, f"otp/send failed: {r.status_code} {r.text}"
    r = s.post(f"{BASE_URL}/api/auth/otp/verify", json={"phone": phone, "otp": "1234", "role": role})
    assert r.status_code == 200, f"otp/verify failed: {r.status_code} {r.text}"
    j = r.json()
    return j["token"], j["user"]


@pytest.fixture(scope="module")
def customer(session):
    tok, user = _otp_login(session, "9800000001", "customer")
    return {"token": tok, "user": user, "headers": {"Authorization": f"Bearer {tok}"}}


@pytest.fixture(scope="module")
def admin(session):
    r = session.post(f"{BASE_URL}/api/auth/admin/login",
                     json={"email": "admin@homeserve.in", "password": "Admin@123"})
    assert r.status_code == 200, r.text
    j = r.json()
    return {"token": j["token"], "headers": {"Authorization": f"Bearer {j['token']}"}}


# -------------- Push: /api/register-push --------------
class TestRegisterPush:
    def test_requires_bearer_auth(self, session):
        r = session.post(f"{BASE_URL}/api/register-push",
                         json={"user_id": "x", "platform": "android", "device_token": "t"})
        assert r.status_code in (401, 403), f"expected auth error got {r.status_code}"

    def test_forbids_other_user(self, session, customer):
        r = session.post(
            f"{BASE_URL}/api/register-push",
            headers=customer["headers"],
            json={"user_id": "someone_else", "platform": "android", "device_token": "tok"},
        )
        assert r.status_code == 403
        assert "another user" in r.json().get("detail", "").lower()

    def test_placeholder_key_returns_500(self, session, customer):
        # With placeholder EMERGENT_PUSH_KEY, upstream must respond 401 -> our API 500
        r = session.post(
            f"{BASE_URL}/api/register-push",
            headers=customer["headers"],
            json={"user_id": customer["user"]["id"], "platform": "android", "device_token": "tok_test"},
        )
        # Accept 500 (placeholder key invalid) OR 502 (provider unavailable); never 2xx
        assert r.status_code in (500, 502), f"got {r.status_code} body={r.text[:200]}"
        detail = r.json().get("detail", "")
        if r.status_code == 500:
            assert "EMERGENT_PUSH_KEY" in detail or "missing" in detail.lower()


# -------------- Booking regression: push should NOT block flow --------------
class TestBookingRegressionNonBlocking:
    @pytest.fixture(scope="class")
    def booking_id(self, session, customer, admin):
        # 1. Pick first service with addons from catalog
        cat = session.get(f"{BASE_URL}/api/catalog/services").json()
        services = cat if isinstance(cat, list) else cat.get("services", [])
        svc_id = next((s_["id"] for s_ in services if s_.get("price")), None)
        assert svc_id, "no catalog service available"

        # 2. Address (reuse 226010 Lucknow)
        addr_resp = session.post(
            f"{BASE_URL}/api/customer/addresses", headers=customer["headers"],
            json={"label": "TEST_push", "line": "Test addr Push", "pincode": "226010",
                  "location": {"lat": 26.85, "lng": 80.95}})
        assert addr_resp.status_code in (200, 201), addr_resp.text
        addr_id = addr_resp.json()["id"]

        # 3. Clear cart + add item
        session.delete(f"{BASE_URL}/api/customer/cart", headers=customer["headers"])
        r = session.post(f"{BASE_URL}/api/customer/cart/items",
                         headers=customer["headers"],
                         json={"service_id": svc_id, "qty": 1, "addon_ids": []})
        assert r.status_code in (200, 201), f"cart add: {r.status_code} {r.text}"

        # 4. Create booking (instant + COD so no payments gateway needed)
        payload = {"address_id": addr_id, "mode": "instant",
                   "payment_method": "cod"}
        r = session.post(f"{BASE_URL}/api/customer/bookings",
                         headers=customer["headers"], json=payload)
        assert r.status_code in (200, 201), f"booking create: {r.status_code} {r.text}"
        bid = r.json()["id"]
        return bid

    def test_booking_created(self, booking_id):
        assert booking_id.startswith("bk_") or len(booking_id) > 5

    def test_admin_reassign_still_works(self, session, admin, booking_id):
        # Find a partner
        parts = session.get(f"{BASE_URL}/api/admin/partners", headers=admin["headers"]).json()
        partners = parts if isinstance(parts, list) else parts.get("partners", [])
        assert partners, "no partners seeded"
        pid = partners[0]["id"]
        r = session.post(f"{BASE_URL}/api/admin/bookings/{booking_id}/reassign",
                         headers=admin["headers"], json={"partner_id": pid})
        assert r.status_code in (200, 201), r.text
        # Verify persisted
        time.sleep(0.5)
        b = session.get(f"{BASE_URL}/api/admin/bookings/{booking_id}",
                        headers=admin["headers"])
        assert b.status_code == 200
        assert b.json().get("status") == "assigned"
        assert b.json().get("partner_id") == pid

    def test_customer_cancel_works_despite_push(self, session, customer, booking_id):
        r = session.post(f"{BASE_URL}/api/customer/bookings/{booking_id}/cancel",
                         headers=customer["headers"], json={"reason": "TEST_push"})
        assert r.status_code in (200, 201), r.text
        time.sleep(0.5)
        g = session.get(f"{BASE_URL}/api/customer/bookings/{booking_id}",
                        headers=customer["headers"])
        assert g.status_code == 200
        assert g.json().get("status") == "cancelled"


# -------------- Partner offer accept regression --------------
class TestPartnerOffer:
    def test_dashboard_reachable(self, session):
        tok, _ = _otp_login(session, "9000000001", "partner")
        h = {"Authorization": f"Bearer {tok}"}
        r = session.get(f"{BASE_URL}/api/partner/dashboard", headers=h)
        assert r.status_code == 200, r.text
        # key sanity
        assert "profile" in r.json()
