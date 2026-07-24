import hashlib
import re
from celery import shared_task
from .models import AnalysisJob, AnalysisRecord


@shared_task
def run_detector_analysis(job_id, user_id, text, ai_enabled, misinfo_enabled):
    """
    Asynchronous Celery task simulating AI content and misinformation detection.
    Analyzes the text metrics and saves the results in MongoDB.
    """
    try:
        # Update job status to PROCESSING
        job = AnalysisJob.objects.get(job_id=job_id)
        job.status = 'PROCESSING'
        job.save()

        # 1. Linguistic Basic Metrics
        words = text.split()
        word_count = len(words)
        char_count = len(text)
        
        # Split by sentences (dot, exclamation, question mark)
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_count = max(1, len(sentences))
        avg_sentence_len = round(word_count / sentence_count, 1)

        # 2. Mock AI Content Detection Algorithm (Buzzword & structural analysis)
        # AI models love transition words and phrases like "delve", "testament", "furthermore", "in conclusion"
        ai_markers = ["delve", "testament", "furthermore", "moreover", "in conclusion", "pivotal", "demystify", "beacon"]
        ai_hits = [w for w in ai_markers if w in text.lower()]
        
        # Use a stable text-derived offset so the same text always receives the
        # same result. This avoids visibly changing scores between scans.
        digest = int(hashlib.sha256(text.encode('utf-8')).hexdigest()[:8], 16)
        stable_offset = (digest % 80) / 10
        base_ai = 8.0 + stable_offset
        marker_weight = len(ai_hits) * 15.0
        sentence_uniformity = max(0.0, 15.0 - abs(avg_sentence_len - 20.0))
        ai_score = min(99.4, base_ai + marker_weight + sentence_uniformity) if ai_enabled else 0.0

        # Predictability indicator (Perplexity) - lower perplexity indicates higher AI probability
        perplexity = max(10, round(120.0 - (ai_score * 0.8) + (stable_offset - 4), 1))
        
        # Variance in sentence length (Burstiness) - AI text is highly uniform (low burstiness)
        sentence_lengths = [len(s.split()) for s in sentences]
        if len(sentence_lengths) > 1:
            mean = sum(sentence_lengths) / len(sentence_lengths)
            variance = sum((x - mean) ** 2 for x in sentence_lengths) / len(sentence_lengths)
            burstiness = round(min(100.0, (variance ** 0.5) * 5), 1)
        else:
            burstiness = 10.0
            
        if ai_enabled:
            # Adjust burstiness down if AI score is high
            burstiness = max(5.0, round(burstiness - (ai_score * 0.3), 1))

        # 3. Mock Misinformation Signals Algorithm
        # Misinfo indicators: excessive caps, clickbait terms
        misinfo_markers = ["shocking", "miracle", "conspiracy", "suppressed", "secret they don't", "unbelievable", "expose"]
        misinfo_hits = [w for w in misinfo_markers if w in text.lower()]
        
        capital_words = sum(1 for w in words if w.isupper() and len(w) > 1)
        capital_ratio = (capital_words / max(1, word_count)) * 100.0

        base_misinfo = 3.0 + ((digest >> 8) % 70) / 10
        marker_misinfo_weight = len(misinfo_hits) * 20.0
        caps_weight = min(25.0, capital_ratio * 1.5)
        misinfo_score = min(98.7, base_misinfo + marker_misinfo_weight + caps_weight) if misinfo_enabled else 0.0

        # Detailed breakdown payload
        detailed_breakdown = {
            "metrics": {
                "word_count": word_count,
                "character_count": char_count,
                "sentence_count": sentence_count,
                "avg_sentence_length": avg_sentence_len
            },
            "ai_details": {
                "detected_markers": ai_hits,
                "perplexity_score": perplexity,
                "burstiness_score": burstiness,
                "verdict": "Likely AI-Generated" if ai_score > 60 else ("Uncertain" if ai_score > 30 else "Likely Human-Written")
            },
            "misinfo_details": {
                "detected_markers": misinfo_hits,
                "capitalization_ratio_percent": round(capital_ratio, 1),
                "unverified_claims_count": len(misinfo_hits),
                "verdict": "High Risk" if misinfo_score > 60 else ("Moderate Risk" if misinfo_score > 30 else "Low Risk")
            }
        }

        # Create the permanent record
        record = AnalysisRecord(
            user_id=user_id,
            input_text=text,
            ai_score=round(ai_score, 1),
            misinformation_score=round(misinfo_score, 1),
            detailed_breakdown=detailed_breakdown
        )
        record.save()

        # Update the job record
        job.status = 'SUCCESS'
        job.result_record_id = str(record.id)
        job.save()

        return str(record.id)

    except Exception as exc:
        # Mark job as failed in case of unhandled error
        try:
            job = AnalysisJob.objects.get(job_id=job_id)
            job.status = 'FAILED'
            job.error_message = str(exc)[:500]
            job.save()
        except Exception:
            pass
        raise
