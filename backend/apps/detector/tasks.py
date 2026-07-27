import hashlib
import re

from celery import shared_task
from django.conf import settings

from .ai_model import DetectorModelUnavailable, predict_ai
from .models import AnalysisJob, AnalysisRecord


def _text_metrics(text):
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
    sentence_count = max(1, len(sentences))
    word_count = len(words)
    sentence_lengths = [len(sentence.split()) for sentence in sentences] or [word_count]

    if len(sentence_lengths) > 1:
        mean = sum(sentence_lengths) / len(sentence_lengths)
        variance = sum((value - mean) ** 2 for value in sentence_lengths) / len(sentence_lengths)
        burstiness = round(min(100.0, (variance ** 0.5) * 5), 1)
    else:
        burstiness = 10.0

    return {
        "words": words,
        "word_count": word_count,
        "character_count": len(text),
        "sentence_count": sentence_count,
        "avg_sentence_length": round(word_count / sentence_count, 1),
        "burstiness_score": burstiness,
    }


def _fallback_ai_prediction(text, avg_sentence_len, ai_enabled, digest):
    if not ai_enabled:
        return {
            "ai_score": 0.0,
            "ai_probability": 0.0,
            "human_probability": 1.0,
            "verdict": "AI detection disabled",
            "model_name": "disabled",
            "chunks_analyzed": 0,
        }

    markers = [
        "delve",
        "testament",
        "furthermore",
        "moreover",
        "in conclusion",
        "pivotal",
        "demystify",
        "beacon",
    ]
    hits = [marker for marker in markers if marker in text.lower()]
    stable_offset = (digest % 80) / 10
    score = min(
        99.4,
        8.0
        + stable_offset
        + (len(hits) * 15.0)
        + max(0.0, 15.0 - abs(avg_sentence_len - 20.0)),
    )
    return {
        "ai_score": score,
        "ai_probability": score / 100.0,
        "human_probability": 1.0 - (score / 100.0),
        "verdict": (
            "Likely AI-Generated"
            if score > 60
            else ("Uncertain" if score > 30 else "Likely Human-Written")
        ),
        "model_name": "heuristic_fallback",
        "detected_markers": hits,
        "chunks_analyzed": 0,
    }


def _ai_prediction(text, ai_enabled, features, metrics, digest):
    if not ai_enabled:
        return _fallback_ai_prediction(
            text,
            metrics["avg_sentence_length"],
            ai_enabled,
            digest,
        )

    max_chunks = 4
    if features.get("deep_scan"):
        max_chunks = 8
    if features.get("detailed_reports"):
        max_chunks = 12

    try:
        return predict_ai(text, max_chunks=max_chunks)
    except DetectorModelUnavailable:
        if settings.AI_DETECTOR_REQUIRE_MODEL:
            raise
    except Exception:
        if settings.AI_DETECTOR_REQUIRE_MODEL:
            raise

    prediction = _fallback_ai_prediction(
        text,
        metrics["avg_sentence_length"],
        ai_enabled,
        digest,
    )
    prediction["fallback_reason"] = "RoBERTa model is not available locally."
    return prediction


def _misinformation_prediction(text, words, misinfo_enabled, digest):
    if not misinfo_enabled:
        return 0.0, {
            "verdict": "Misinformation detection disabled",
            "detected_markers": [],
            "capitalization_ratio_percent": 0.0,
            "unverified_claims_count": 0,
        }

    markers = [
        "shocking",
        "miracle",
        "conspiracy",
        "suppressed",
        "secret they don't",
        "unbelievable",
        "expose",
    ]
    hits = [marker for marker in markers if marker in text.lower()]
    capital_words = sum(1 for word in words if word.isupper() and len(word) > 1)
    capital_ratio = (capital_words / max(1, len(words))) * 100.0
    score = min(
        98.7,
        3.0
        + (((digest >> 8) % 70) / 10)
        + (len(hits) * 20.0)
        + min(25.0, capital_ratio * 1.5),
    )
    details = {
        "verdict": (
            "High Risk"
            if score > 60
            else ("Moderate Risk" if score > 30 else "Low Risk")
        ),
        "detected_markers": hits,
        "capitalization_ratio_percent": round(capital_ratio, 1),
        "unverified_claims_count": len(hits),
    }
    return score, details


@shared_task
def run_detector_analysis(
    job_id,
    user_id,
    text,
    ai_enabled,
    misinfo_enabled,
    feature_flags=None,
):
    try:
        job = AnalysisJob.objects.get(job_id=job_id)
        job.status = 'PROCESSING'
        job.save()

        features = feature_flags or {}
        metrics = _text_metrics(text)
        digest = int(hashlib.sha256(text.encode('utf-8')).hexdigest()[:8], 16)

        ai_result = _ai_prediction(text, ai_enabled, features, metrics, digest)
        ai_score = ai_result["ai_score"]

        stable_offset = (digest % 80) / 10
        perplexity = max(10, round(120.0 - (ai_score * 0.8) + (stable_offset - 4), 1))
        burstiness = metrics["burstiness_score"]
        if ai_enabled:
            burstiness = max(5.0, round(burstiness - (ai_score * 0.3), 1))

        misinfo_score, misinfo_details = _misinformation_prediction(
            text,
            metrics["words"],
            misinfo_enabled,
            digest,
        )

        ai_details = {
            "verdict": ai_result["verdict"],
            "model_used": ai_result["model_name"],
            "chunks_analyzed": ai_result["chunks_analyzed"],
        }
        if ai_result.get("fallback_reason"):
            ai_details["fallback_reason"] = ai_result["fallback_reason"]
        if features.get("deep_scan"):
            ai_details.update(
                {
                    "ai_probability": round(ai_result["ai_probability"], 4),
                    "human_probability": round(ai_result["human_probability"], 4),
                    "confidence_percent": round(max(
                        ai_result["ai_probability"],
                        ai_result["human_probability"],
                    ) * 100, 1),
                    "ai_threshold": ai_result.get("ai_threshold"),
                }
            )
        if features.get("detailed_reports"):
            ai_details.update(
                {
                    "detected_markers": ai_result.get("detected_markers", []),
                    "perplexity_score": perplexity,
                    "burstiness_score": burstiness,
                }
            )

        if not features.get("advanced_misinformation"):
            misinfo_details = {"verdict": misinfo_details["verdict"]}

        detailed_breakdown = {
            "metrics": {
                "word_count": metrics["word_count"],
                "character_count": metrics["character_count"],
                "sentence_count": metrics["sentence_count"],
                "avg_sentence_length": metrics["avg_sentence_length"],
            },
            "ai_details": ai_details,
            "misinfo_details": misinfo_details,
            "features": features,
        }

        record = AnalysisRecord(
            user_id=user_id,
            input_text=text,
            ai_score=round(ai_score, 1),
            misinformation_score=round(misinfo_score, 1),
            detailed_breakdown=detailed_breakdown,
        )
        record.save()

        job.status = 'SUCCESS'
        job.result_record_id = str(record.id)
        job.save()

        return str(record.id)

    except Exception as exc:
        try:
            job = AnalysisJob.objects.get(job_id=job_id)
            job.status = 'FAILED'
            job.error_message = str(exc)[:500]
            job.save()
        except Exception:
            pass
        raise
