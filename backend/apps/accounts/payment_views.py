import uuid
from decimal import Decimal, InvalidOperation

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PaymentTransaction
from .payments import (
    EsewaStatusUnavailable,
    EsewaVerificationError,
    KhaltiConfigurationError,
    KhaltiGatewayError,
    KhaltiStatusUnavailable,
    add_calendar_months,
    build_initiation_fields,
    decode_and_verify_response,
    get_plan,
    initiate_khalti_payment,
    khalti_status_name,
    money,
    money_string,
    query_khalti_status,
    query_esewa_status,
    rupees_to_paisa,
    utcnow,
)
from .serializers import UserSerializer


def error_response(message, http_status, details=None):
    payload = {"status": "error", "message": message}
    if details:
        payload["details"] = details
    return Response(payload, status=http_status)


def transaction_payload(transaction):
    return {
        "transaction_uuid": transaction.transaction_uuid,
        "provider": transaction.provider,
        "plan_code": transaction.plan_code,
        "plan_name": transaction.plan_name,
        "duration_months": transaction.duration_months,
        "currency": transaction.currency,
        "amount": transaction.amount,
        "tax_amount": transaction.tax_amount,
        "total_amount": transaction.total_amount,
        "status": transaction.status,
        "reference_id": transaction.reference_id,
        "provider_payment_id": transaction.provider_payment_id,
        "created_at": transaction.created_at.isoformat() if transaction.created_at else None,
        "completed_at": (
            transaction.completed_at.isoformat() if transaction.completed_at else None
        ),
    }


def owned_transaction(request, transaction_uuid):
    return PaymentTransaction.objects(
        transaction_uuid=transaction_uuid,
        user_id=str(request.user.id),
    ).first()


class EsewaInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_code = str(request.data.get("plan_code", "")).strip().lower()
        try:
            plan = get_plan(plan_code)
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        transaction_uuid = f"VAI-{uuid.uuid4().hex[:20].upper()}"
        transaction = PaymentTransaction(
            user_id=str(request.user.id),
            username=request.user.username,
            email=request.user.email,
            plan_code=plan_code,
            plan_name=plan["name"],
            duration_months=plan["duration_months"],
            amount=money_string(plan["amount"]),
            tax_amount=money_string(plan["tax_amount"]),
            service_charge=money_string(plan["service_charge"]),
            delivery_charge=money_string(plan["delivery_charge"]),
            total_amount=money_string(plan["total_amount"]),
            transaction_uuid=transaction_uuid,
            product_code=settings.ESEWA_PRODUCT_CODE,
            status="INITIATED",
        )
        transaction.save()

        return Response(
            {
                "status": "success",
                "message": "Secure eSewa checkout created.",
                "payment_url": settings.ESEWA_FORM_URL,
                "form_data": build_initiation_fields(transaction),
                "transaction": transaction_payload(transaction),
            },
            status=status.HTTP_201_CREATED,
        )


class KhaltiInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not str(settings.KHALTI_SECRET_KEY or "").strip():
            return error_response(
                "Khalti sandbox checkout is not configured yet.",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        plan_code = str(request.data.get("plan_code", "")).strip().lower()
        try:
            plan = get_plan(plan_code)
        except ValueError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        transaction_uuid = f"VAI-KHL-{uuid.uuid4().hex[:16].upper()}"
        transaction = PaymentTransaction(
            user_id=str(request.user.id),
            username=request.user.username,
            email=request.user.email,
            provider="khalti",
            plan_code=plan_code,
            plan_name=plan["name"],
            duration_months=plan["duration_months"],
            amount=money_string(plan["amount"]),
            tax_amount=money_string(plan["tax_amount"]),
            service_charge=money_string(plan["service_charge"]),
            delivery_charge=money_string(plan["delivery_charge"]),
            total_amount=money_string(plan["total_amount"]),
            transaction_uuid=transaction_uuid,
            product_code="KHALTI",
            status="INITIATED",
        )
        transaction.save()

        try:
            provider_response = initiate_khalti_payment(transaction, request.user)
        except KhaltiConfigurationError as exc:
            transaction.status = "FAILED"
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except KhaltiStatusUnavailable as exc:
            transaction.status = "PENDING"
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                str(exc),
                status.HTTP_503_SERVICE_UNAVAILABLE,
                {"payment_status": "PENDING"},
            )
        except KhaltiGatewayError as exc:
            transaction.status = "FAILED"
            transaction.provider_response = {"initiation_error": exc.payload}
            transaction.updated_at = utcnow()
            transaction.save()
            message = (
                "Khalti rejected the sandbox checkout request. "
                "Please confirm the sandbox merchant key and try again."
                if exc.status_code in {401, 403}
                else str(exc)
            )
            return error_response(
                message,
                status.HTTP_502_BAD_GATEWAY,
                {"payment_status": "FAILED"},
            )

        transaction.provider_payment_id = str(provider_response["pidx"])
        transaction.provider_response = {"initiation": provider_response}
        transaction.updated_at = utcnow()
        transaction.save()

        return Response(
            {
                "status": "success",
                "message": "Secure Khalti checkout created.",
                "payment_url": provider_response["payment_url"],
                "transaction": transaction_payload(transaction),
            },
            status=status.HTTP_201_CREATED,
        )


class EsewaVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        encoded_data = request.data.get("data")
        try:
            provider_payload = decode_and_verify_response(encoded_data)
        except EsewaVerificationError as exc:
            return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

        transaction_uuid = str(provider_payload.get("transaction_uuid", "")).strip()
        transaction = owned_transaction(request, transaction_uuid)
        if not transaction:
            return error_response(
                "This payment does not belong to the signed-in account.",
                status.HTTP_404_NOT_FOUND,
            )

        if transaction.status == "COMPLETE":
            return Response(
                {
                    "status": "success",
                    "message": "This payment was already verified.",
                    "transaction": transaction_payload(transaction),
                    "user": UserSerializer(request.user).data,
                }
            )

        try:
            response_total = money(provider_payload.get("total_amount"))
            expected_total = money(transaction.total_amount)
        except (InvalidOperation, TypeError, ValueError):
            return error_response(
                "The eSewa response contains an invalid total amount.",
                status.HTTP_400_BAD_REQUEST,
            )

        response_status = str(provider_payload.get("status", "")).upper()
        if (
            provider_payload.get("product_code") != transaction.product_code
            or response_total != expected_total
            or response_status != "COMPLETE"
        ):
            transaction.status = (
                response_status
                if response_status in {"PENDING", "FAILED", "CANCELED", "NOT_FOUND", "AMBIGUOUS"}
                else "FAILED"
            )
            transaction.provider_response = provider_payload
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                "eSewa has not confirmed this payment as complete.",
                status.HTTP_409_CONFLICT,
                {"payment_status": transaction.status},
            )

        try:
            provider_status = query_esewa_status(transaction)
        except EsewaStatusUnavailable as exc:
            transaction.status = "PENDING"
            transaction.provider_response = provider_payload
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                str(exc),
                status.HTTP_503_SERVICE_UNAVAILABLE,
                {"payment_status": "PENDING"},
            )

        verified_status = str(provider_status.get("status", "")).upper()
        provider_uuid = str(
            provider_status.get("transaction_uuid", transaction.transaction_uuid)
        )
        provider_product_code = str(
            provider_status.get("product_code", transaction.product_code)
        )
        provider_total_value = provider_status.get("total_amount", transaction.total_amount)
        try:
            provider_total = money(provider_total_value)
        except (InvalidOperation, TypeError, ValueError):
            provider_total = Decimal("-1")

        if (
            verified_status != "COMPLETE"
            or provider_uuid != transaction.transaction_uuid
            or provider_product_code != transaction.product_code
            or provider_total != expected_total
        ):
            transaction.status = (
                verified_status
                if verified_status
                in {"PENDING", "FAILED", "CANCELED", "NOT_FOUND", "AMBIGUOUS"}
                else "FAILED"
            )
            transaction.provider_response = {
                "callback": provider_payload,
                "status_check": provider_status,
            }
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                "eSewa could not verify this payment as complete.",
                status.HTTP_409_CONFLICT,
                {"payment_status": transaction.status},
            )

        completed_at = utcnow()
        reference_id = str(
            provider_status.get("ref_id")
            or provider_status.get("transaction_code")
            or provider_payload.get("transaction_code")
            or ""
        )
        claimed = PaymentTransaction.objects(
            id=transaction.id,
            status__ne="COMPLETE",
        ).modify(
            new=True,
            set__status="COMPLETE",
            set__reference_id=reference_id,
            set__provider_response={
                "callback": provider_payload,
                "status_check": provider_status,
            },
            set__updated_at=completed_at,
            set__completed_at=completed_at,
        )

        if claimed:
            current_expiry = getattr(request.user, "subscription_expires_at", None)
            extension_base = (
                current_expiry
                if current_expiry and current_expiry > completed_at
                else completed_at
            )
            request.user.subscription_plan = transaction.plan_name
            request.user.subscription_started_at = completed_at
            request.user.subscription_expires_at = add_calendar_months(
                extension_base,
                transaction.duration_months,
            )
            request.user.save()
            transaction = claimed
        else:
            transaction.reload()
            request.user.reload()

        return Response(
            {
                "status": "success",
                "message": "Payment verified and subscription activated.",
                "transaction": transaction_payload(transaction),
                "user": UserSerializer(request.user).data,
            }
        )


class KhaltiVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_uuid = str(
            request.data.get("transaction_uuid", "")
        ).strip()
        transaction = owned_transaction(request, transaction_uuid)
        if not transaction or transaction.provider != "khalti":
            return error_response(
                "Khalti payment transaction not found.",
                status.HTTP_404_NOT_FOUND,
            )

        if transaction.status == "COMPLETE":
            return Response(
                {
                    "status": "success",
                    "message": "This payment was already verified.",
                    "transaction": transaction_payload(transaction),
                    "user": UserSerializer(request.user).data,
                }
            )

        callback_payload = request.data.get("callback") or {}
        if not isinstance(callback_payload, dict):
            return error_response(
                "The Khalti callback is invalid.",
                status.HTTP_400_BAD_REQUEST,
            )

        callback_pidx = str(callback_payload.get("pidx", "")).strip()
        callback_order_id = str(
            callback_payload.get("purchase_order_id", "")
        ).strip()
        if callback_pidx and callback_pidx != transaction.provider_payment_id:
            return error_response(
                "The Khalti payment identifier does not match this checkout.",
                status.HTTP_400_BAD_REQUEST,
            )
        if callback_order_id and callback_order_id != transaction.transaction_uuid:
            return error_response(
                "The Khalti order does not match this checkout.",
                status.HTTP_400_BAD_REQUEST,
            )

        callback_total = callback_payload.get("total_amount")
        if callback_total not in (None, ""):
            try:
                if int(callback_total) != rupees_to_paisa(transaction.total_amount):
                    raise ValueError
            except (TypeError, ValueError):
                return error_response(
                    "The Khalti callback amount does not match this checkout.",
                    status.HTTP_400_BAD_REQUEST,
                )

        if not transaction.provider_payment_id:
            return error_response(
                "This Khalti checkout has no payment identifier.",
                status.HTTP_409_CONFLICT,
            )

        try:
            provider_status = query_khalti_status(
                transaction.provider_payment_id
            )
        except KhaltiConfigurationError as exc:
            return error_response(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except KhaltiStatusUnavailable as exc:
            transaction.status = "PENDING"
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                str(exc),
                status.HTTP_503_SERVICE_UNAVAILABLE,
                {"payment_status": "PENDING"},
            )
        except KhaltiGatewayError as exc:
            transaction.status = "PENDING"
            transaction.provider_response = {
                **(transaction.provider_response or {}),
                "callback": callback_payload,
                "lookup_error": exc.payload,
            }
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                str(exc),
                status.HTTP_502_BAD_GATEWAY,
                {"payment_status": "PENDING"},
            )

        provider_pidx = str(provider_status.get("pidx", "")).strip()
        normalized_status = khalti_status_name(provider_status.get("status"))
        try:
            provider_total = int(provider_status.get("total_amount"))
        except (TypeError, ValueError):
            provider_total = -1
        expected_total = rupees_to_paisa(transaction.total_amount)

        provider_responses = {
            **(transaction.provider_response or {}),
            "callback": callback_payload,
            "lookup": provider_status,
        }
        if (
            provider_pidx != transaction.provider_payment_id
            or provider_total != expected_total
        ):
            transaction.status = "FAILED"
            transaction.provider_response = provider_responses
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                "Khalti verification did not match this checkout.",
                status.HTTP_409_CONFLICT,
                {"payment_status": "FAILED"},
            )

        if normalized_status != "COMPLETE":
            transaction.status = normalized_status
            transaction.provider_response = provider_responses
            transaction.updated_at = utcnow()
            transaction.save()
            return error_response(
                "Khalti has not confirmed this payment as completed.",
                status.HTTP_409_CONFLICT,
                {"payment_status": normalized_status},
            )

        completed_at = utcnow()
        reference_id = str(provider_status.get("transaction_id") or "")
        claimed = PaymentTransaction.objects(
            id=transaction.id,
            status__ne="COMPLETE",
        ).modify(
            new=True,
            set__status="COMPLETE",
            set__reference_id=reference_id,
            set__provider_response=provider_responses,
            set__updated_at=completed_at,
            set__completed_at=completed_at,
        )

        if claimed:
            current_expiry = getattr(
                request.user,
                "subscription_expires_at",
                None,
            )
            extension_base = (
                current_expiry
                if current_expiry and current_expiry > completed_at
                else completed_at
            )
            request.user.subscription_plan = transaction.plan_name
            request.user.subscription_started_at = completed_at
            request.user.subscription_expires_at = add_calendar_months(
                extension_base,
                transaction.duration_months,
            )
            request.user.save()
            transaction = claimed
        else:
            transaction.reload()
            request.user.reload()

        return Response(
            {
                "status": "success",
                "message": "Payment verified and subscription activated.",
                "transaction": transaction_payload(transaction),
                "user": UserSerializer(request.user).data,
            }
        )


class EsewaTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, transaction_uuid):
        transaction = owned_transaction(request, transaction_uuid)
        if not transaction:
            return error_response("Payment transaction not found.", status.HTTP_404_NOT_FOUND)
        return Response(
            {
                "status": "success",
                "transaction": transaction_payload(transaction),
            }
        )


class KhaltiTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, transaction_uuid):
        transaction = owned_transaction(request, transaction_uuid)
        if not transaction or transaction.provider != "khalti":
            return error_response(
                "Khalti payment transaction not found.",
                status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {
                "status": "success",
                "transaction": transaction_payload(transaction),
            }
        )


class EsewaFailureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, transaction_uuid):
        transaction = owned_transaction(request, transaction_uuid)
        if not transaction:
            return error_response("Payment transaction not found.", status.HTTP_404_NOT_FOUND)
        if transaction.status != "COMPLETE":
            transaction.status = "CANCELED"
            transaction.updated_at = utcnow()
            transaction.save()
        return Response(
            {
                "status": "success",
                "message": "The incomplete payment was recorded as canceled.",
                "transaction": transaction_payload(transaction),
            }
        )
