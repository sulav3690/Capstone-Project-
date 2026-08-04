import datetime

from django.conf import settings
from django.test import SimpleTestCase, tag
from mongoengine.connection import get_connection, get_db
from rest_framework.test import APIClient

from apps.accounts.models import OnboardingSurvey, User, UserFeedback
from apps.detector.models import AnalysisJob, AnalysisRecord


class VerificationValidationBase(SimpleTestCase):
    databases = set()
    password = "StrongPass123!"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if not settings.MONGO_DB_NAME.startswith("veritas_test_"):
            raise RuntimeError("Tests require a MongoDB database beginning with veritas_test_.")
        if get_db().name != settings.MONGO_DB_NAME:
            raise RuntimeError("MongoDB test isolation failed.")

    @classmethod
    def tearDownClass(cls):
        get_connection().drop_database(settings.MONGO_DB_NAME)
        super().tearDownClass()

    def setUp(self):
        for model in (AnalysisJob, AnalysisRecord, OnboardingSurvey, UserFeedback, User):
            model.drop_collection()
        self.client = APIClient()

    def create_user(self, username="normal_user", email="normal@example.com", is_admin=False):
        user = User(
            username=username,
            email=email,
            full_name="Test User",
            phone="9812345678",
            country_code="+977",
            role="student",
            is_admin=is_admin,
            onboarding_completed=True,
        )
        user.set_password(self.password)
        user.save()
        return user

    def login(self, username):
        response = self.client.post(
            "/api/auth/login/",
            {"username": username, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        return response


@tag("verification")
class AdminPanelVerificationTests(VerificationValidationBase):
    """Verify implemented admin requirements and API contracts."""

    def test_admin_stats_contract_returns_dashboard_analytics(self):
        admin = self.create_user("admin_user", "admin@example.com", is_admin=True)
        user = self.create_user("student_user", "student@example.com")
        now = datetime.datetime.utcnow()

        OnboardingSurvey(
            user_id=str(user.id),
            role="student",
            email=user.email,
            heard_about_us="Search",
            purpose="Verification testing",
            plan_chosen="Free",
            created_at=now,
        ).save()
        UserFeedback(
            hear_about_us="Friend",
            role="student",
            ai_usage="Daily",
            why_choose_us=["Accuracy"],
            created_at=now,
        ).save()
        AnalysisRecord(
            user_id=str(user.id),
            input_text="Verification test content " * 4,
            ai_score=42.5,
            misinformation_score=18.0,
            created_at=now,
        ).save()

        self.login(admin.username)
        response = self.client.get("/api/auth/admin-stats/")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["stats"]["total_users"], 2)
        self.assertEqual(response.data["stats"]["total_scans"], 1)
        self.assertEqual(response.data["stats"]["total_surveys"], 2)
        self.assertIn("survey_logs", response.data)
        self.assertIn("analytics", response.data)
        self.assertIn("source_counts", response.data["analytics"])
        self.assertIn("role_counts", response.data["analytics"])
        self.assertIn("score_trends", response.data["analytics"])
        self.assertEqual(response.data["scans"][0]["summary"], "Verification test content " * 4)

    def test_non_admin_cannot_read_admin_stats_and_admin_update_route_is_removed(self):
        user = self.create_user()
        self.login(user.username)

        denied = self.client.get("/api/auth/admin-stats/")
        self.assertEqual(denied.status_code, 403, denied.data)

        removed = self.client.patch(
            f"/api/auth/admin-users/{user.id}/",
            {"is_admin": True},
            format="json",
        )
        self.assertEqual(removed.status_code, 404)


@tag("validation")
class InputValidationTests(VerificationValidationBase):
    """Validate user input is accepted or rejected according to system rules."""

    def test_registration_rejects_invalid_email_weak_password_and_bad_phone(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "invalid_user",
                "email": "not-an-email",
                "password": "weak",
                "full_name": "Invalid User",
                "phone": "123",
                "country_code": "+977",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400, response.data)
        self.assertEqual(response.data["status"], "error")
        self.assertIn("email", response.data["details"])
        self.assertIn("password", response.data["details"])
        self.assertIn("phone", response.data["details"])
        self.assertEqual(User.objects.count(), 0)

    def test_login_requires_credentials_and_rejects_wrong_password(self):
        self.create_user()

        missing = self.client.post("/api/auth/login/", {"username": ""}, format="json")
        self.assertEqual(missing.status_code, 400, missing.data)

        wrong = self.client.post(
            "/api/auth/login/",
            {"username": "normal_user", "password": "WrongPass123!"},
            format="json",
        )
        self.assertEqual(wrong.status_code, 401, wrong.data)

    def test_onboarding_survey_validates_email_format(self):
        user = self.create_user()
        self.login(user.username)

        response = self.client.post(
            "/api/auth/onboarding-survey/",
            {
                "role": "Student",
                "email": "bad-email-format",
                "heard_about_us": "Search",
                "purpose": "Validation testing",
                "plan_chosen": "Free",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("email", response.data["details"])
        self.assertEqual(OnboardingSurvey.objects.count(), 0)
