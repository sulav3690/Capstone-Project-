from django.core.management.base import BaseCommand, CommandError
from mongoengine.connection import get_db
from pymongo import ASCENDING, DESCENDING


class Command(BaseCommand):
    help = "Safely synchronize MongoDB indexes required by onboarding and payments."

    def handle(self, *args, **options):
        database = get_db()
        self._sync_onboarding_index(database["onboarding_surveys"])
        self._sync_payment_indexes(database["payment_transactions"])
        self.stdout.write(self.style.SUCCESS("MongoDB indexes are synchronized."))

    def _sync_onboarding_index(self, collection):
        desired_keys = [("user_id", ASCENDING)]
        current = collection.index_information().get("user_id_1")
        is_current = (
            current
            and current.get("key") == desired_keys
            and current.get("unique") is True
            and current.get("sparse") is True
        )
        if is_current:
            self.stdout.write("onboarding_surveys.user_id_1 is already correct.")
            return

        duplicate = next(
            collection.aggregate(
                [
                    {"$match": {"user_id": {"$exists": True, "$nin": [None, ""]}}},
                    {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
                    {"$match": {"count": {"$gt": 1}}},
                    {"$limit": 1},
                ]
            ),
            None,
        )
        if duplicate:
            raise CommandError(
                "Cannot create the unique onboarding user index because duplicate "
                f"user_id {duplicate['_id']!r} exists."
            )

        if current:
            collection.drop_index("user_id_1")
            self.stdout.write("Removed the incompatible onboarding user index.")
        collection.create_index(
            desired_keys,
            name="user_id_1",
            unique=True,
            sparse=True,
        )
        self.stdout.write("Created onboarding_surveys.user_id_1 (unique, sparse).")

    def _sync_payment_indexes(self, collection):
        collection.create_index(
            [("transaction_uuid", ASCENDING)],
            name="transaction_uuid_1",
            unique=True,
        )
        collection.create_index(
            [("provider_payment_id", ASCENDING)],
            name="provider_payment_id_1",
            sparse=True,
        )
        collection.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="user_id_1_created_at_-1",
        )
        collection.create_index(
            [("status", ASCENDING)],
            name="status_1",
        )
        self.stdout.write("Payment transaction indexes are present.")
