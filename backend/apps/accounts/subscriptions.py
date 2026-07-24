import copy
import datetime


PLAN_ENTITLEMENTS = {
    "Free": {
        "word_limit": 10_000,
        "detection_limit": 50,
        "features": {
            "ai_detector": True,
            "deep_scan": False,
            "advanced_misinformation": False,
            "detailed_reports": False,
        },
        "response_tier": "standard",
        "support_tier": "community",
        "queue_priority": 0,
    },
    "Monthly": {
        "word_limit": 50_000,
        "detection_limit": 500,
        "features": {
            "ai_detector": True,
            "deep_scan": True,
            "advanced_misinformation": True,
            "detailed_reports": False,
        },
        "response_tier": "fast",
        "support_tier": "standard",
        "queue_priority": 5,
    },
    "Yearly": {
        "word_limit": 500_000,
        "detection_limit": None,
        "features": {
            "ai_detector": True,
            "deep_scan": True,
            "advanced_misinformation": True,
            "detailed_reports": True,
        },
        "response_tier": "fastest",
        "support_tier": "priority",
        "queue_priority": 9,
    },
}


def normalize_plan_name(value):
    normalized = str(value or "").strip().lower()
    if normalized == "monthly":
        return "Monthly"
    if normalized == "yearly":
        return "Yearly"
    return "Free"


def get_plan_entitlements(plan_name):
    plan = normalize_plan_name(plan_name)
    return plan, copy.deepcopy(PLAN_ENTITLEMENTS[plan])


def _isoformat_utc(value):
    if value is None:
        return None
    return value.replace(microsecond=0).isoformat() + "Z"


def get_subscription_access(user, include_usage=True, now=None):
    """
    Return the effective server-owned plan rules for a user.

    Paid usage resets when the current paid period starts. Free usage resets at
    the beginning of each UTC calendar month. Yearly scans are unlimited but
    the usage count is still returned for the account dashboard.
    """
    now = now or datetime.datetime.utcnow()
    plan, entitlements = get_plan_entitlements(
        getattr(user, "subscription_plan", "Free")
    )

    if plan == "Free":
        period_start = datetime.datetime(now.year, now.month, 1)
        period_end = None
    else:
        period_start = getattr(user, "subscription_started_at", None) or now
        period_end = getattr(user, "subscription_expires_at", None)

    used = 0
    if include_usage and getattr(user, "id", None):
        from apps.detector.models import AnalysisRecord

        used = AnalysisRecord.objects(
            user_id=str(user.id),
            created_at__gte=period_start,
        ).count()

    limit = entitlements["detection_limit"]
    remaining = None if limit is None else max(0, limit - used)

    return {
        "plan": plan,
        "word_limit": entitlements["word_limit"],
        "detection_limit": limit,
        "detections_used": used,
        "detections_remaining": remaining,
        "features": entitlements["features"],
        "response_tier": entitlements["response_tier"],
        "support_tier": entitlements["support_tier"],
        "queue_priority": entitlements["queue_priority"],
        "period_start": _isoformat_utc(period_start),
        "period_end": _isoformat_utc(period_end),
    }
