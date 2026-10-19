"""Verify SMARTFIX rebrand - iteration 8"""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_BACKEND_URL") or "https://tri-module-app.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def customer_token():
    requests.post(f"{BASE_URL}/api/auth/otp/send", json={"phone": "9800000001", "role": "customer"}, timeout=10)
    r = requests.post(
        f"{BASE_URL}/api/auth/otp/verify",
        json={"phone": "9800000001", "otp": "1234", "role": "customer"},
        timeout=10,
    )
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ---------- Branding / common endpoints ----------
class TestBranding:
    def test_root_api_message(self):
        r = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert r.status_code == 200
        assert r.json().get("message") == "SMARTFIX common API"

    def test_admin_login_new_email_ok(self):
        r = requests.post(
            f"{BASE_URL}/api/auth/admin/login",
            json={"email": "admin@smartfix.in", "password": "Admin@123"},
            timeout=10,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["user"]["email"] == "admin@smartfix.in"
        assert body["user"]["role"] == "admin"
        assert body.get("token")

    def test_admin_login_old_email_fails(self):
        r = requests.post(
            f"{BASE_URL}/api/auth/admin/login",
            json={"email": "admin@homeserve.in", "password": "Admin@123"},
            timeout=10,
        )
        assert r.status_code in (401, 403), r.text


# ---------- Booking SF-prefix & invoice ----------
class TestBookingRebrand:
    def test_new_cod_booking_has_sf_prefix_and_invoice_seller(self, customer_token):
        h = {"Authorization": f"Bearer {customer_token}", "Content-Type": "application/json"}

        # pick a service
        cat = requests.get(f"{BASE_URL}/api/catalog/services", timeout=10).json()
        services = cat if isinstance(cat, list) else cat.get("services", [])
        svc_id = next((s_["id"] for s_ in services if s_.get("price")), None)
        assert svc_id, "no catalog service available"

        # address
        addr_resp = requests.post(
            f"{BASE_URL}/api/customer/addresses", headers=h,
            json={"label": "TEST_rebrand", "line": "SF rebrand lane",
                  "pincode": "226010", "location": {"lat": 26.85, "lng": 80.95}},
            timeout=10,
        )
        assert addr_resp.status_code in (200, 201), addr_resp.text
        addr_id = addr_resp.json()["id"]

        # cart
        requests.delete(f"{BASE_URL}/api/customer/cart", headers=h, timeout=10)
        rc = requests.post(f"{BASE_URL}/api/customer/cart/items", headers=h,
                           json={"service_id": svc_id, "qty": 1, "addon_ids": []},
                           timeout=10)
        assert rc.status_code in (200, 201), rc.text

        # create booking (instant + COD)
        br = requests.post(
            f"{BASE_URL}/api/customer/bookings", headers=h,
            json={"address_id": addr_id, "mode": "instant", "payment_method": "cod"},
            timeout=15,
        )
        assert br.status_code in (200, 201), br.text
        booking = br.json()
        booking_no = booking.get("booking_no") or booking.get("bookingNo")
        booking_id = booking.get("id") or booking.get("_id") or booking.get("booking_id")
        assert booking_no, f"missing booking_no: {booking}"
        assert booking_no.startswith("SF"), f"expected SF prefix, got {booking_no}"
        assert booking_id

        # Invoice is only generated post-completion; verify endpoint behaves correctly
        # (returns 400 pre-completion). Seller name presence in code is validated below.
        inv = requests.get(f"{BASE_URL}/api/customer/bookings/{booking_id}/invoice",
                           headers=h, timeout=10)
        # Either 400 (not completed) or 200 with SMARTFIX seller
        assert inv.status_code in (200, 400, 404), inv.text
        if inv.status_code == 200:
            data = inv.json()
            seller_name = (data.get("seller") or {}).get("name", "")
            assert "SMARTFIX" in seller_name, f"expected SMARTFIX seller, got {seller_name}"
            assert "HomeServe" not in str(data)

    def test_invoice_source_has_smartfix_seller(self):
        """Static safeguard: routes_customer.py invoice endpoint hardcodes SMARTFIX seller."""
        with open("/app/backend/routes_customer.py", "r") as fp:
            src = fp.read()
        assert "SMARTFIX Technologies Pvt. Ltd." in src
        assert "HomeServe Technologies" not in src
