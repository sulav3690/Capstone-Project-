from django.conf import settings
import base64
import json
from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from mongoengine.connection import get_connection, get_db
from rest_framework.test import APIClient

from apps.accounts.models import (
    OnboardingSurvey,
    PaymentTransaction,
    SupportTicket,
    User,
    UserFeedback,
)
from apps.accounts.payments import create_signature
from apps.detector.models import AnalysisJob, AnalysisRecord


class ApiFlowTests(SimpleTestCase):
    """End-to-end API checks using an explicitly isolated MongoDB database."""

    databases = set()
    username = "integration_user"
    original_password = "StrongPass123!"
    updated_password = "UpdatedPass456!"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if not settings.MONGO_DB_NAME.startswith("veritas_test_"):
            raise RuntimeError("API tests require a MONGO_DB_NAME beginning with 'veritas_test_'.")
        actual_database_name = get_db().name
        if actual_database_name != settings.MONGO_DB_NAME:
            raise RuntimeError(
                "MongoDB test isolation failed: configured database "
                f"{settings.MONGO_DB_NAME!r}, connected database {actual_database_name!r}."
            )
        for model in (
            AnalysisJob,
            AnalysisRecord,
            OnboardingSurvey,
            PaymentTransaction,
            SupportTicket,
            UserFeedback,
            User,
        ):
            model.drop_collection()

    @classmethod
    def tearDownClass(cls):
        get_connection().drop_database(settings.MONGO_DB_NAME)
        super().tearDownClass()

    def setUp(self):
        for model in (
            AnalysisJob,
            AnalysisRecord,
            OnboardingSurvey,
            PaymentTransaction,
            SupportTicket,
            UserFeedback,
            User,
        ):
            model.drop_collection()
        self.client = APIClient()

    def register_and_authenticate(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": self.username,
                "email": "integration@example.com",
                "password": self.original_password,
                "full_name": "Integration User",
                "phone": "9812345678",
                "country_code": "+977",
                "role": "student",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["status"], "success")
        self.assertFalse(response.data["user"]["onboarding_completed"])
        return response

    def test_complete_user_and_analysis_flow(self):
        register_response = self.register_and_authenticate()
        self.assertIn("access_token", register_response.cookies)
        self.assertIn("refresh_token", register_response.cookies)

        profile = self.client.get("/api/auth/me/")
        self.assertEqual(profile.status_code, 200, profile.data)
        self.assertEqual(profile.data["user"]["username"], self.username)
        self.assertFalse(profile.data["user"]["onboarding_completed"])

        survey = self.client.post(
            "/api/auth/onboarding-survey/",
            {
                "role": "Student",
                "heard_about_us": "Search",
                "purpose": "Research",
                "plan_chosen": "Free",
                "completed_at": "2026-07-24T03:00:00.000Z",
            },
            format="json",
        )
        self.assertEqual(survey.status_code, 201, survey.data)
        self.assertTrue(survey.data["user"]["onboarding_completed"])
        self.assertEqual(OnboardingSurvey.objects.count(), 1)
        self.assertEqual(
            OnboardingSurvey.objects.first().user_id,
            survey.data["user"]["id"],
        )

        survey_update = self.client.post(
            "/api/auth/onboarding-survey/",
            {
                "role": "Student",
                "heard_about_us": "Friend",
                "purpose": "Research",
                "plan_chosen": "Yearly",
            },
            format="json",
        )
        self.assertEqual(survey_update.status_code, 201, survey_update.data)
        self.assertEqual(OnboardingSurvey.objects.count(), 1)
        self.assertEqual(OnboardingSurvey.objects.first().plan_chosen, "Yearly")

        blocked_plan_update = self.client.patch(
            "/api/auth/me/",
            {"subscription_plan": "Yearly"},
            format="json",
        )
        self.assertEqual(blocked_plan_update.status_code, 400, blocked_plan_update.data)

        initiated = self.client.post(
            "/api/payments/esewa/initiate/",
            {"plan_code": "tier-1-monthly"},
            format="json",
        )
        self.assertEqual(initiated.status_code, 201, initiated.data)
        self.assertEqual(initiated.data["transaction"]["amount"], "250.00")
        self.assertEqual(initiated.data["transaction"]["tax_amount"], "5.00")
        self.assertEqual(initiated.data["transaction"]["total_amount"], "255.00")
        self.assertEqual(initiated.data["form_data"]["product_code"], "EPAYTEST")
        transaction_uuid = initiated.data["transaction"]["transaction_uuid"]

        signed_names = [
            "transaction_code",
            "status",
            "total_amount",
            "transaction_uuid",
            "product_code",
            "signed_field_names",
        ]
        callback = {
            "transaction_code": "TEST-REF-123",
            "status": "COMPLETE",
            "total_amount": "255.00",
            "transaction_uuid": transaction_uuid,
            "product_code": "EPAYTEST",
            "signed_field_names": ",".join(signed_names),
        }
        callback["signature"] = create_signature(callback, signed_names)
        encoded_callback = base64.b64encode(json.dumps(callback).encode()).decode()

        with patch(
            "apps.accounts.payment_views.query_esewa_status",
            return_value={
                "status": "COMPLETE",
                "total_amount": "255.00",
                "transaction_uuid": transaction_uuid,
                "product_code": "EPAYTEST",
                "ref_id": "TEST-REF-123",
            },
        ):
            verified = self.client.post(
                "/api/payments/esewa/verify/",
                {"data": encoded_callback},
                format="json",
            )
        self.assertEqual(verified.status_code, 200, verified.data)
        self.assertEqual(verified.data["transaction"]["status"], "COMPLETE")
        self.assertEqual(verified.data["user"]["subscription_plan"], "Monthly")
        self.assertIsNotNone(verified.data["user"]["subscription_expires_at"])
        self.assertEqual(
            verified.data["user"]["subscription_access"]["word_limit"],
            50_000,
        )
        self.assertEqual(
            verified.data["user"]["subscription_access"]["detection_limit"],
            500,
        )
        self.assertTrue(
            verified.data["user"]["subscription_access"]["features"][
                "advanced_misinformation"
            ]
        )
        self.assertEqual(PaymentTransaction.objects.count(), 1)

        analysis = self.client.post(
            "/api/analyze/",
            {
                "text": (
                    "This is a sufficiently long integration-test document. "
                    "It contains several sentences with varied structure."
                ),
                "aiDetection": True,
                "misinformation": True,
            },
            format="json",
        )
        self.assertEqual(analysis.status_code, 200, analysis.data)
        self.assertEqual(analysis.data["job"]["status"], "SUCCESS")
        self.assertEqual(
            analysis.data["subscription_access"]["detections_used"],
            1,
        )
        record_id = analysis.data["job"]["result"]["id"]

        history = self.client.get("/api/analyze/history/?limit=10")
        self.assertEqual(history.status_code, 200, history.data)
        self.assertEqual(len(history.data["history"]), 1)

        detail = self.client.get(f"/api/analyze/history/{record_id}/")
        self.assertEqual(detail.status_code, 200, detail.data)

        deleted = self.client.delete(f"/api/analyze/history/{record_id}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(AnalysisRecord.objects.count(), 0)

        password_change = self.client.post(
            "/api/auth/password/",
            {
                "current_password": self.original_password,
                "new_password": self.updated_password,
            },
            format="json",
        )
        self.assertEqual(password_change.status_code, 200, password_change.data)

        login = self.client.post(
            "/api/auth/login/",
            {"username": self.username, "password": self.updated_password},
            format="json",
        )
        self.assertEqual(login.status_code, 200, login.data)
        self.assertTrue(login.data["user"]["onboarding_completed"])

    @override_settings(KHALTI_SECRET_KEY="test-secret-key")
    def test_khalti_checkout_verifies_before_activating_subscription(self):
        self.register_and_authenticate()
        provider_payment_id = "test-khalti-pidx"

        with patch(
            "apps.accounts.payment_views.initiate_khalti_payment",
            return_value={
                "pidx": provider_payment_id,
                "payment_url": (
                    "https://test-pay.khalti.com/"
                    f"?pidx={provider_payment_id}"
                ),
                "expires_at": "2026-07-24T12:00:00+05:45",
                "expires_in": 1800,
            },
        ):
            initiated = self.client.post(
                "/api/payments/khalti/initiate/",
                {"plan_code": "tier-1-monthly"},
                format="json",
            )

        self.assertEqual(initiated.status_code, 201, initiated.data)
        self.assertEqual(initiated.data["transaction"]["provider"], "khalti")
        self.assertEqual(initiated.data["transaction"]["amount"], "250.00")
        self.assertEqual(initiated.data["transaction"]["tax_amount"], "5.00")
        self.assertEqual(initiated.data["transaction"]["total_amount"], "255.00")
        self.assertEqual(
            initiated.data["transaction"]["provider_payment_id"],
            provider_payment_id,
        )
        transaction_uuid = initiated.data["transaction"]["transaction_uuid"]

        callback = {
            "pidx": provider_payment_id,
            "status": "Completed",
            "total_amount": "25500",
            "purchase_order_id": transaction_uuid,
            "transaction_id": "KHALTI-TEST-REF",
        }
        tampered = self.client.post(
            "/api/payments/khalti/verify/",
            {
                "transaction_uuid": transaction_uuid,
                "callback": {**callback, "total_amount": "100"},
            },
            format="json",
        )
        self.assertEqual(tampered.status_code, 400, tampered.data)
        self.assertEqual(
            PaymentTransaction.objects.get(
                transaction_uuid=transaction_uuid
            ).status,
            "INITIATED",
        )

        with patch(
            "apps.accounts.payment_views.query_khalti_status",
            return_value={
                "pidx": provider_payment_id,
                "total_amount": 25500,
                "status": "Completed",
                "transaction_id": "KHALTI-TEST-REF",
                "fee": 0,
                "refunded": False,
            },
        ):
            verified = self.client.post(
                "/api/payments/khalti/verify/",
                {
                    "transaction_uuid": transaction_uuid,
                    "callback": callback,
                },
                format="json",
            )

        self.assertEqual(verified.status_code, 200, verified.data)
        self.assertEqual(verified.data["transaction"]["status"], "COMPLETE")
        self.assertEqual(
            verified.data["transaction"]["reference_id"],
            "KHALTI-TEST-REF",
        )
        self.assertEqual(verified.data["user"]["subscription_plan"], "Monthly")
        first_expiry = verified.data["user"]["subscription_expires_at"]
        self.assertIsNotNone(first_expiry)

        verified_again = self.client.post(
            "/api/payments/khalti/verify/",
            {
                "transaction_uuid": transaction_uuid,
                "callback": callback,
            },
            format="json",
        )
        self.assertEqual(verified_again.status_code, 200, verified_again.data)
        self.assertEqual(
            verified_again.data["user"]["subscription_expires_at"],
            first_expiry,
        )
        self.assertEqual(PaymentTransaction.objects.count(), 1)

    def test_public_forms_and_admin_authorization(self):
        self.register_and_authenticate()

        support = self.client.post(
            "/api/support/",
            {
                "name": "Integration User",
                "email": "integration@example.com",
                "subject": "Integration test",
                "message": "This support request verifies database persistence.",
            },
            format="json",
        )
        self.assertEqual(support.status_code, 201, support.data)

        feedback = self.client.post(
            "/api/auth/feedback/",
            {
                "hear_about_us": "Search",
                "role": "Student",
                "ai_usage": "Weekly",
                "why_choose_us": ["Privacy", "Speed"],
            },
            format="json",
        )
        self.assertEqual(feedback.status_code, 201, feedback.data)

        survey = self.client.post(
            "/api/auth/onboarding-survey/",
            {
                "role": "Student",
                "email": "integration@example.com",
                "heard_about_us": "Search",
                "purpose": "Research",
                "plan_chosen": "Free",
            },
            format="json",
        )
        self.assertEqual(survey.status_code, 201, survey.data)

        anonymous_survey = APIClient().post(
            "/api/auth/onboarding-survey/",
            {"role": "Student", "plan_chosen": "Free"},
            format="json",
        )
        self.assertEqual(anonymous_survey.status_code, 401, anonymous_survey.data)

        denied = self.client.get("/api/auth/admin-stats/")
        self.assertEqual(denied.status_code, 403, denied.data)

        current_user = User.objects.get(username=self.username)
        current_user.is_admin = True
        current_user.save()
        admin_login = self.client.post(
            "/api/auth/login/",
            {"username": self.username, "password": self.original_password},
            format="json",
        )
        self.assertEqual(admin_login.status_code, 200, admin_login.data)

        stats = self.client.get("/api/auth/admin-stats/")
        self.assertEqual(stats.status_code, 200, stats.data)
        self.assertEqual(stats.data["stats"]["total_users"], 1)

        self_revoke = self.client.patch(
            f"/api/auth/admin-users/{current_user.id}/",
            {"is_admin": False},
            format="json",
        )
        self.assertEqual(self_revoke.status_code, 400, self_revoke.data)

    def test_existing_accounts_default_to_onboarding_complete(self):
        legacy_user = User(
            username="legacy_user",
            email="legacy@example.com",
            role="other",
        )
        legacy_user.set_password(self.original_password)
        legacy_user.save()
        # Simulate a document created before onboarding fields existed.
        User._get_collection().update_one(
            {"_id": legacy_user.id},
            {
                "$unset": {
                    "onboarding_completed": "",
                    "onboarding_completed_at": "",
                }
            },
        )

        login = self.client.post(
            "/api/auth/login/",
            {"username": "legacy_user", "password": self.original_password},
            format="json",
        )
        self.assertEqual(login.status_code, 200, login.data)
        self.assertTrue(login.data["user"]["onboarding_completed"])

    def test_deleted_user_session_recovers_across_account_endpoints(self):
        registered = self.register_and_authenticate()
        stale_access = registered.cookies["access_token"].value
        stale_refresh = registered.cookies["refresh_token"].value

        User.objects.get(username=self.username).delete()

        protected = self.client.get("/api/auth/me/")
        self.assertEqual(protected.status_code, 401, protected.data)

        refreshed = self.client.post("/api/auth/token/refresh/", format="json")
        self.assertEqual(refreshed.status_code, 401, refreshed.data)
        self.assertIn("no longer exists", refreshed.data["message"])
        self.assertEqual(int(refreshed.cookies["access_token"]["max-age"]), 0)
        self.assertEqual(int(refreshed.cookies["refresh_token"]["max-age"]), 0)

        registration_client = APIClient()
        registration_client.cookies["access_token"] = stale_access
        registration_client.cookies["refresh_token"] = stale_refresh
        replacement = registration_client.post(
            "/api/auth/register/",
            {
                "username": "replacement_user",
                "email": "replacement@example.com",
                "password": self.original_password,
                "full_name": "Replacement User",
                "phone": "9812345678",
                "country_code": "+977",
                "role": "student",
            },
            format="json",
        )
        self.assertEqual(replacement.status_code, 201, replacement.data)
        self.assertEqual(replacement.data["user"]["username"], "replacement_user")
        self.assertEqual(User.objects.count(), 1)

        logout_client = APIClient()
        logout_client.cookies["access_token"] = stale_access
        logout_client.cookies["refresh_token"] = stale_refresh
        logged_out = logout_client.post("/api/auth/logout/", format="json")
        self.assertEqual(logged_out.status_code, 200, logged_out.data)
        self.assertEqual(int(logged_out.cookies["access_token"]["max-age"]), 0)
        self.assertEqual(int(logged_out.cookies["refresh_token"]["max-age"]), 0)
