import base64
import json
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import patch

from django.test import SimpleTestCase, override_settings

from .payments import (
    EsewaVerificationError,
    add_calendar_months,
    build_khalti_initiation_payload,
    create_signature,
    decode_and_verify_response,
    get_plan,
    khalti_status_name,
    rupees_to_paisa,
)
from .models import User
from .subscriptions import get_plan_entitlements
from apps.detector.views import AnalysisRequestSerializer


@override_settings(ESEWA_SECRET_KEY="unit-test-secret")
class EsewaPaymentUnitTests(SimpleTestCase):
    @override_settings(ESEWA_SECRET_KEY="8gBm/:&EnhH.1/q")
    def test_uat_signature_matches_esewa_official_example(self):
        fields = {
            "total_amount": "110",
            "transaction_uuid": "241028",
            "product_code": "EPAYTEST",
        }
        self.assertEqual(
            create_signature(
                fields,
                ("total_amount", "transaction_uuid", "product_code"),
            ),
            "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=",
        )

    def test_server_catalog_applies_two_percent_tax(self):
        monthly = get_plan("tier-1-monthly")
        yearly = get_plan("tier-1-yearly")

        self.assertEqual(str(monthly["amount"]), "250.00")
        self.assertEqual(str(monthly["tax_amount"]), "5.00")
        self.assertEqual(str(monthly["total_amount"]), "255.00")
        self.assertEqual(monthly["duration_months"], 1)

        self.assertEqual(str(yearly["amount"]), "2500.00")
        self.assertEqual(str(yearly["tax_amount"]), "50.00")
        self.assertEqual(str(yearly["total_amount"]), "2550.00")
        self.assertEqual(yearly["duration_months"], 12)

    def test_signed_callback_is_verified_and_tampering_is_rejected(self):
        signed_names = [
            "transaction_code",
            "status",
            "total_amount",
            "transaction_uuid",
            "product_code",
            "signed_field_names",
        ]
        payload = {
            "transaction_code": "TEST-REF-1",
            "status": "COMPLETE",
            "total_amount": "255.00",
            "transaction_uuid": "VAI-TEST-1",
            "product_code": "EPAYTEST",
            "signed_field_names": ",".join(signed_names),
        }
        payload["signature"] = create_signature(payload, signed_names)
        encoded = base64.b64encode(json.dumps(payload).encode()).decode()

        self.assertEqual(
            decode_and_verify_response(encoded)["transaction_uuid"],
            "VAI-TEST-1",
        )

        payload["total_amount"] = "1.00"
        tampered = base64.b64encode(json.dumps(payload).encode()).decode()
        with self.assertRaises(EsewaVerificationError):
            decode_and_verify_response(tampered)

    def test_subscription_expiry_uses_calendar_months(self):
        january_end = datetime(2026, 1, 31, 9, 30)
        self.assertEqual(
            add_calendar_months(january_end, 1),
            datetime(2026, 2, 28, 9, 30),
        )
        self.assertEqual(
            add_calendar_months(january_end, 12),
            datetime(2027, 1, 31, 9, 30),
        )

    @override_settings(
        FRONTEND_BASE_URL="http://localhost:3000",
        KHALTI_WEBSITE_URL="http://localhost:3000",
    )
    def test_khalti_payload_uses_paisa_and_two_percent_tax(self):
        transaction = SimpleNamespace(
            amount="250.00",
            tax_amount="5.00",
            total_amount="255.00",
            transaction_uuid="VAI-KHL-TEST",
            plan_code="tier-1-monthly",
            plan_name="Monthly",
        )
        user = SimpleNamespace(
            username="test-user",
            full_name="Test User",
            email="test@example.com",
            country_code="+977",
            phone="9800000000",
        )

        payload = build_khalti_initiation_payload(transaction, user)

        self.assertEqual(payload["amount"], 25500)
        self.assertEqual(
            sum(item["amount"] for item in payload["amount_breakdown"]),
            25500,
        )
        self.assertEqual(payload["purchase_order_id"], "VAI-KHL-TEST")
        self.assertEqual(payload["customer_info"]["phone"], "9800000000")
        self.assertEqual(
            payload["return_url"],
            "http://localhost:3000/payment/khalti/callback/VAI-KHL-TEST",
        )
        self.assertEqual(rupees_to_paisa("255.00"), 25500)

    def test_khalti_statuses_are_normalized_safely(self):
        self.assertEqual(khalti_status_name("Completed"), "COMPLETE")
        self.assertEqual(khalti_status_name("User canceled"), "CANCELED")
        self.assertEqual(khalti_status_name("Expired"), "EXPIRED")
        self.assertEqual(khalti_status_name("Unknown provider state"), "PENDING")

    def test_expired_paid_subscription_returns_to_free(self):
        now = datetime(2026, 7, 24, 12, 0)
        user = User(
            username="expiry-test",
            email="expiry@example.com",
            password="unused",
            subscription_plan="Monthly",
            subscription_started_at=now - timedelta(days=31),
            subscription_expires_at=now - timedelta(seconds=1),
        )
        with patch.object(user, "save") as save:
            changed = user.expire_subscription_if_needed(now=now)

        self.assertTrue(changed)
        self.assertEqual(user.subscription_plan, "Free")
        self.assertIsNone(user.subscription_started_at)
        self.assertIsNone(user.subscription_expires_at)
        save.assert_called_once()


class SubscriptionEntitlementUnitTests(SimpleTestCase):
    def test_plan_catalog_matches_advertised_limits_and_feature_gates(self):
        _, free = get_plan_entitlements("Free")
        _, monthly = get_plan_entitlements("Monthly")
        _, yearly = get_plan_entitlements("Yearly")

        self.assertEqual(free["word_limit"], 10_000)
        self.assertEqual(free["detection_limit"], 50)
        self.assertFalse(free["features"]["deep_scan"])

        self.assertEqual(monthly["word_limit"], 50_000)
        self.assertEqual(monthly["detection_limit"], 500)
        self.assertTrue(monthly["features"]["deep_scan"])
        self.assertTrue(monthly["features"]["advanced_misinformation"])
        self.assertFalse(monthly["features"]["detailed_reports"])

        self.assertEqual(yearly["word_limit"], 500_000)
        self.assertIsNone(yearly["detection_limit"])
        self.assertTrue(yearly["features"]["detailed_reports"])
        self.assertGreater(
            yearly["queue_priority"],
            monthly["queue_priority"],
        )

    def test_analysis_serializer_uses_account_word_limit(self):
        allowed = AnalysisRequestSerializer(
            data={"text": "word " * 50_000},
            context={"word_limit": 50_000},
        )
        blocked = AnalysisRequestSerializer(
            data={"text": "word " * 50_001},
            context={"word_limit": 50_000},
        )

        self.assertTrue(allowed.is_valid(), allowed.errors)
        self.assertFalse(blocked.is_valid())
        self.assertIn("50,000", str(blocked.errors["text"][0]))
