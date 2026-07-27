import json
from pathlib import Path

from django.conf import settings


class DetectorModelUnavailable(RuntimeError):
    pass


_MODEL_BUNDLE = None


def _load_metadata(model_dir):
    metadata_path = model_dir / "detector_metadata.json"
    if not metadata_path.exists():
        return {}
    with metadata_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _load_model_bundle():
    global _MODEL_BUNDLE
    if _MODEL_BUNDLE is not None:
        return _MODEL_BUNDLE

    model_dir = Path(settings.AI_DETECTOR_MODEL_DIR)
    if not model_dir.is_absolute():
        model_dir = Path(settings.BASE_DIR) / model_dir
    if not model_dir.exists():
        raise DetectorModelUnavailable(f"AI detector model folder not found: {model_dir}")

    try:
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
    except ImportError as exc:
        raise DetectorModelUnavailable(
            "Install torch, transformers, and safetensors to enable RoBERTa detection."
        ) from exc

    metadata = _load_metadata(model_dir)
    tokenizer = AutoTokenizer.from_pretrained(str(model_dir), local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(
        str(model_dir),
        local_files_only=True,
    )
    model.eval()

    _MODEL_BUNDLE = {
        "torch": torch,
        "tokenizer": tokenizer,
        "model": model,
        "metadata": metadata,
        "max_length": int(metadata.get("max_length") or 256),
        "ai_threshold": float(metadata.get("ai_threshold") or 0.5),
    }
    return _MODEL_BUNDLE


def predict_ai_probabilities(texts):
    bundle = _load_model_bundle()
    torch = bundle["torch"]
    tokenizer = bundle["tokenizer"]
    model = bundle["model"]

    encoded = tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=bundle["max_length"],
        return_tensors="pt",
    )
    with torch.no_grad():
        probabilities = torch.softmax(model(**encoded).logits, dim=-1)

    label2id = getattr(model.config, "label2id", {}) or {}
    ai_index = int(label2id.get("ai", label2id.get("AI", 1)))
    human_index = int(label2id.get("human", label2id.get("HUMAN", 0)))

    return [
        {
            "human_probability": float(row[human_index].item()),
            "ai_probability": float(row[ai_index].item()),
            "ai_threshold": bundle["ai_threshold"],
            "max_length": bundle["max_length"],
            "model_name": "roberta_ai_detector_v3_final",
        }
        for row in probabilities
    ]


def _sample_word_chunks(text, max_chunks):
    words = text.split()
    if not words:
        return [text]

    chunk_words = 180
    chunks = [
        " ".join(words[index:index + chunk_words])
        for index in range(0, len(words), chunk_words)
    ]
    if len(chunks) <= max_chunks:
        return chunks

    step = (len(chunks) - 1) / max(1, max_chunks - 1)
    return [chunks[round(index * step)] for index in range(max_chunks)]


def predict_ai(text, max_chunks=4):
    chunk_predictions = predict_ai_probabilities(
        _sample_word_chunks(text, max(1, int(max_chunks)))
    )
    ai_probability = sum(
        item["ai_probability"] for item in chunk_predictions
    ) / len(chunk_predictions)
    human_probability = sum(
        item["human_probability"] for item in chunk_predictions
    ) / len(chunk_predictions)
    prediction = dict(chunk_predictions[0])
    prediction["ai_probability"] = ai_probability
    prediction["human_probability"] = human_probability
    prediction["chunks_analyzed"] = len(chunk_predictions)
    prediction["ai_score"] = ai_probability * 100.0
    prediction["verdict"] = (
        "Likely AI-Generated"
        if ai_probability >= prediction["ai_threshold"]
        else "Likely Human-Written"
    )
    return prediction
