import base64
import binascii
import calendar
import hashlib
import hmac
import json
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

from django.conf import settings


MONEY_QUANTUM = Decimal("0.01")
TAX_RATE = Decimal("0.02")
SIGNED_REQUEST_FIELDS = ("total_amount", "transaction_uuid", "product_code")

PLAN_CATALOG = {
    "tier-1-monthly": {
        "name": "Monthly",
        "duration_months": 1,
        "amount": Decimal("250.00"),
    },
    "tier-1-yearly": {
        "name": "Yearly",
        "duration_months": 12,
        "amount": Decimal("2500.00"),
    },
}


class EsewaVerificationError(ValueError):
    pass


class EsewaStatusUnavailable(RuntimeError):
    pass


class KhaltiConfigurationError(RuntimeError):
    pass


class KhaltiGatewayError(RuntimeError):
    def __init__(self, message, payload=None, status_code=None):
        super().__init__(message)
        self.payload = payload or {}
        self.status_code = status_code


class KhaltiStatusUnavailable(RuntimeError):
    pass


def money(value):
    return Decimal(str(value)).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def money_string(value):
    return f"{money(value):.2f}"


def rupees_to_paisa(value):
    return int(money(value) * 100)


def get_plan(plan_code):
    plan = PLAN_CATALOG.get(str(plan_code or "").strip().lower())
    if not plan:
        raise ValueError("Choose a valid paid plan.")
    amount = money(plan["amount"])
    tax_amount = money(amount * TAX_RATE)
    return {
        **plan,
        "amount": amount,
        "tax_amount": tax_amount,
        "service_charge": Decimal("0.00"),
        "delivery_charge": Decimal("0.00"),
        "total_amount": money(amount + tax_amount),
    }


def signed_message(fields, signed_field_names):
    missing = [name for name in signed_field_names if name not in fields]
    if missing:
        raise EsewaVerificationError(
            f"eSewa response is missing signed field(s): {', '.join(missing)}."
        )
    return ",".join(f"{name}={fields[name]}" for name in signed_field_names)


def create_signature(fields, signed_field_names, secret_key=None):
    secret = (secret_key or settings.ESEWA_SECRET_KEY).encode("utf-8")
    message = signed_message(fields, signed_field_names).encode("utf-8")
    digest = hmac.new(secret, message, hashlib.sha256).digest()
    return base64.b64encode(digest).decode("ascii")


def decode_and_verify_response(encoded_data):
    if not encoded_data or not isinstance(encoded_data, str):
        raise EsewaVerificationError("The eSewa payment response is missing.")

    try:
        padded = encoded_data + "=" * (-len(encoded_data) % 4)
        decoded = base64.b64decode(padded, validate=True)
        payload = json.loads(decoded.decode("utf-8"))
    except (binascii.Error, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise EsewaVerificationError("The eSewa payment response is invalid.") from exc

    signed_names_value = payload.get("signed_field_names", "")
    signed_names = [name.strip() for name in signed_names_value.split(",") if name.strip()]
    if not signed_names:
        raise EsewaVerificationError("The eSewa response has no signed fields.")

    supplied_signature = payload.get("signature", "")
    expected_signature = create_signature(payload, signed_names)
    if not supplied_signature or not hmac.compare_digest(
        supplied_signature, expected_signature
    ):
        raise EsewaVerificationError("The eSewa response signature is invalid.")
    return payload


def build_initiation_fields(transaction):
    fields = {
        "amount": transaction.amount,
        "tax_amount": transaction.tax_amount,
        "total_amount": transaction.total_amount,
        "transaction_uuid": transaction.transaction_uuid,
        "product_code": transaction.product_code,
        "product_service_charge": transaction.service_charge,
        "product_delivery_charge": transaction.delivery_charge,
        "success_url": (
            f"{settings.FRONTEND_BASE_URL}/payment/esewa/success/"
            f"{transaction.transaction_uuid}"
        ),
        "failure_url": (
            f"{settings.FRONTEND_BASE_URL}/payment/esewa/failure/"
            f"{transaction.transaction_uuid}"
        ),
        "signed_field_names": ",".join(SIGNED_REQUEST_FIELDS),
    }
    fields["signature"] = create_signature(fields, SIGNED_REQUEST_FIELDS)
    return fields


def query_esewa_status(transaction):
    query = urlencode(
        {
            "product_code": transaction.product_code,
            "total_amount": transaction.total_amount,
            "transaction_uuid": transaction.transaction_uuid,
        }
    )
    request = Request(
        f"{settings.ESEWA_STATUS_URL}?{query}",
        headers={"Accept": "application/json", "User-Agent": "VeritasAI/1.0"},
        method="GET",
    )
    try:
        with urlopen(request, timeout=settings.ESEWA_HTTP_TIMEOUT_SECONDS) as response:
            raw_body = response.read().decode("utf-8")
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        raise EsewaStatusUnavailable(
            "eSewa payment verification is temporarily unavailable."
        ) from exc

    try:
        return json.loads(raw_body)
    except json.JSONDecodeError as exc:
        raise EsewaStatusUnavailable(
            "eSewa returned an unreadable verification response."
        ) from exc


def khalti_status_name(value):
    normalized = " ".join(str(value or "").strip().lower().split())
    return {
        "completed": "COMPLETE",
        "pending": "PENDING",
        "initiated": "PENDING",
        "user canceled": "CANCELED",
        "user cancelled": "CANCELED",
        "expired": "EXPIRED",
        "refunded": "REFUNDED",
        "partially refunded": "PARTIALLY_REFUNDED",
        "failed": "FAILED",
    }.get(normalized, "PENDING")


def khalti_error_message(payload, default_message):
    if not isinstance(payload, dict):
        return default_message
    detail = payload.get("detail")
    if isinstance(detail, str) and detail.strip():
        return detail.strip()
    messages = []
    for field, value in payload.items():
        if field in {"error_key", "status_code"}:
            continue
        if isinstance(value, list):
            text = ", ".join(str(item) for item in value if str(item).strip())
        elif isinstance(value, str):
            text = value.strip()
        else:
            text = ""
        if text:
            messages.append(f"{field}: {text}")
    return "; ".join(messages) or default_message


def khalti_api_request(path, payload):
    secret_key = str(settings.KHALTI_SECRET_KEY or "").strip()
    if not secret_key:
        raise KhaltiConfigurationError(
            "Khalti sandbox checkout is not configured yet."
        )

    request = Request(
        f"{settings.KHALTI_API_BASE_URL}/{path.lstrip('/')}",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Accept": "application/json",
            "Authorization": f"Key {secret_key}",
            "Content-Type": "application/json",
            "User-Agent": "VeritasAI/1.0",
        },
        method="POST",
    )
    try:
        with urlopen(
            request,
            timeout=settings.KHALTI_HTTP_TIMEOUT_SECONDS,
        ) as response:
            status_code = response.status
            raw_body = response.read().decode("utf-8")
    except HTTPError as exc:
        status_code = exc.code
        raw_body = exc.read().decode("utf-8", errors="replace")
    except (URLError, TimeoutError, OSError) as exc:
        raise KhaltiStatusUnavailable(
            "Khalti payment service is temporarily unavailable."
        ) from exc

    try:
        response_payload = json.loads(raw_body) if raw_body else {}
    except json.JSONDecodeError as exc:
        raise KhaltiStatusUnavailable(
            "Khalti returned an unreadable response."
        ) from exc
    return status_code, response_payload


def build_khalti_initiation_payload(transaction, user):
    amount_paisa = rupees_to_paisa(transaction.total_amount)
    base_amount_paisa = rupees_to_paisa(transaction.amount)
    tax_amount_paisa = rupees_to_paisa(transaction.tax_amount)
    phone_digits = "".join(
        character
        for character in (
            f"{getattr(user, 'country_code', '') or ''}"
            f"{getattr(user, 'phone', '') or ''}"
        )
        if character.isdigit()
    )
    if len(phone_digits) > 10:
        phone_digits = phone_digits[-10:]
    customer_info = {
        "name": str(getattr(user, "full_name", "") or user.username).strip(),
        "email": str(getattr(user, "email", "") or "").strip(),
        "phone": phone_digits,
    }
    customer_info = {
        key: value for key, value in customer_info.items() if value
    }

    payload = {
        "return_url": (
            f"{settings.FRONTEND_BASE_URL}/payment/khalti/callback/"
            f"{transaction.transaction_uuid}"
        ),
        "website_url": settings.KHALTI_WEBSITE_URL,
        "amount": amount_paisa,
        "purchase_order_id": transaction.transaction_uuid,
        "purchase_order_name": f"VeritasAI {transaction.plan_name} Plan",
        "amount_breakdown": [
            {"label": "Subscription", "amount": base_amount_paisa},
            {"label": "Tax (2%)", "amount": tax_amount_paisa},
        ],
        "product_details": [
            {
                "identity": transaction.plan_code,
                "name": f"VeritasAI {transaction.plan_name} Plan",
                "total_price": amount_paisa,
                "quantity": 1,
                "unit_price": amount_paisa,
            }
        ],
        "merchant_plan_code": transaction.plan_code,
    }
    if customer_info:
        payload["customer_info"] = customer_info
    return payload


def initiate_khalti_payment(transaction, user):
    status_code, response_payload = khalti_api_request(
        "/epayment/initiate/",
        build_khalti_initiation_payload(transaction, user),
    )
    if not 200 <= status_code < 300:
        raise KhaltiGatewayError(
            khalti_error_message(
                response_payload,
                "Khalti could not create this checkout.",
            ),
            payload=response_payload,
            status_code=status_code,
        )

    pidx = str(response_payload.get("pidx", "")).strip()
    payment_url = str(response_payload.get("payment_url", "")).strip()
    parsed_payment_url = urlparse(payment_url)
    payment_host = (parsed_payment_url.hostname or "").lower()
    if (
        not pidx
        or parsed_payment_url.scheme != "https"
        or not (
            payment_host == "khalti.com"
            or payment_host.endswith(".khalti.com")
        )
    ):
        raise KhaltiGatewayError(
            "Khalti returned an invalid checkout response.",
            payload=response_payload,
            status_code=status_code,
        )
    return response_payload


def query_khalti_status(pidx):
    status_code, response_payload = khalti_api_request(
        "/epayment/lookup/",
        {"pidx": pidx},
    )
    if isinstance(response_payload, dict) and response_payload.get("status"):
        return response_payload
    raise KhaltiGatewayError(
        khalti_error_message(
            response_payload,
            "Khalti could not verify this payment.",
        ),
        payload=response_payload,
        status_code=status_code,
    )


def add_calendar_months(value, months):
    target_month_index = value.month - 1 + months
    target_year = value.year + target_month_index // 12
    target_month = target_month_index % 12 + 1
    target_day = min(value.day, calendar.monthrange(target_year, target_month)[1])
    return value.replace(year=target_year, month=target_month, day=target_day)


def utcnow():
    value = datetime.utcnow()
    # MongoDB stores datetimes with millisecond precision. Normalize before
    # returning API data so the first response and later reads stay identical.
    return value.replace(microsecond=(value.microsecond // 1000) * 1000)
