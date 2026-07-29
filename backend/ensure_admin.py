import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.development")

from decouple import config

if not config("CREATE_LOCAL_ADMIN", default=False, cast=bool):
    print("Skipping admin creation. Set CREATE_LOCAL_ADMIN=True to create a dev admin.")
    raise SystemExit(0)

import django

django.setup()

from apps.accounts.models import User


username = config("ADMIN_USERNAME", default="admin")
email = config("ADMIN_EMAIL", default="admin@veritas.ai")
password = config("ADMIN_PASSWORD", default="Admin@12345")

user = User.objects(username=username).first()
if user:
    changed = False
    if not user.is_admin:
        user.is_admin = True
        changed = True
    if user.email != email and not User.objects(email=email).first():
        user.email = email
        changed = True
    if user.subscription_plan != "Free":
        user.subscription_plan = "Free"
        user.subscription_started_at = None
        user.subscription_expires_at = None
        changed = True
    if changed:
        user.save()
    print(f"Admin ready: {username}")
else:
    user = User(
        username=username,
        email=email,
        full_name="Admin User",
        role="other",
        is_admin=True,
        subscription_plan="Free",
    )
    user.set_password(password)
    user.save()
    print(f"Created admin: {username}")
