import datetime
import time

from django.conf import settings
from django.test import SimpleTestCase, tag
from mongoengine.connection import get_connection, get_db
from rest_framework.test import APIClient

from apps.accounts.models import OnboardingSurvey, User, UserFeedback
from apps.detector.models import AnalysisJob, AnalysisRecord


@tag("performance")
class AdminStatsPerformanceTests(SimpleTestCase):
    """Performance smoke tests for admin analytics endpoints."""

    databases = set()

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if not settings.MONGO_DB_NAME.startswith("veritas_test_"):
            raise RuntimeError("Performance tests require a test MongoDB database.")
        if get_db().name != settings.MONGO_DB_NAME:
            raise RuntimeError("MongoDB performance test isolation failed.")

    @classmethod
    def tearDownClass(cls):
        get_connection().drop_database(settings.MONGO_DB_NAME)
        super().tearDownClass()

    def setUp(self):
        for model in (AnalysisJob, AnalysisRecord, OnboardingSurvey, UserFeedback, User):
            model.drop_collection()
        self.client = APIClient()

    def test_admin_stats_returns_large_dashboard_payload_quickly(self):
        admin = User(
            username="perf_admin",
            email="perf_admin@example.com",
            role="other",
            is_admin=True,
        )
        admin.set_password("StrongPass123!")
        admin.save()

        users = [admin]
        roles = ["student", "teacher", "other"]
        sources = ["Search", "Friend", "Social Media", "College"]
        now = datetime.datetime.utcnow()

        for index in range(120):
            user = User(
                username=f"perf_user_{index}",
                email=f"perf_user_{index}@example.com",
                role=roles[index % len(roles)],
                subscription_plan=["Free", "Monthly", "Yearly"][index % 3],
                created_at=now - datetime.timedelta(minutes=index),
            )
            user.set_password("StrongPass123!")
            user.save()
            users.append(user)

        for index in range(160):
            user = users[index % len(users)]
            OnboardingSurvey(
                user_id=str(user.id),
                role=user.role,
                email=user.email,
                heard_about_us=sources[index % len(sources)],
                purpose="Performance dashboard coverage",
                plan_chosen=user.subscription_plan,
                created_at=now - datetime.timedelta(minutes=index),
            ).save()
            UserFeedback(
                hear_about_us=sources[(index + 1) % len(sources)],
                role=user.role,
                ai_usage="Weekly",
                why_choose_us=["Speed", "Accuracy"],
                created_at=now - datetime.timedelta(minutes=index),
            ).save()

        for index in range(220):
            user = users[index % len(users)]
            AnalysisRecord(
                user_id=str(user.id),
                input_text="Performance test analysis text " * 8,
                ai_score=float(index % 100),
                misinformation_score=float((index * 3) % 100),
                detailed_breakdown={"source": "performance-test"},
                created_at=now - datetime.timedelta(hours=index % 72),
            ).save()

        login = self.client.post(
            "/api/auth/login/",
            {"username": "perf_admin", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(login.status_code, 200, login.data)

        started_at = time.perf_counter()
        response = self.client.get("/api/auth/admin-stats/")
        elapsed_seconds = time.perf_counter() - started_at

        self.assertEqual(response.status_code, 200, response.data)
        self.assertLess(
            elapsed_seconds,
            2.0,
            f"Admin stats took {elapsed_seconds:.3f}s for seeded dashboard data.",
        )
        self.assertEqual(response.data["stats"]["total_users"], 121)
        self.assertEqual(response.data["stats"]["total_scans"], 220)
        self.assertGreaterEqual(response.data["stats"]["total_surveys"], 161)
        self.assertTrue(response.data["analytics"]["source_counts"])
        self.assertTrue(response.data["analytics"]["role_counts"])
        self.assertTrue(response.data["analytics"]["score_trends"])
