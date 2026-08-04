import re
from pathlib import Path

from django.conf import settings


class MisinformationModelUnavailable(RuntimeError):
    pass


_MODEL_BUNDLE = None


def _load_model_bundle():
    global _MODEL_BUNDLE
    if _MODEL_BUNDLE is not None:
        return _MODEL_BUNDLE

    model_dir = Path(settings.MISINFORMATION_MODEL_DIR)
    if not model_dir.is_absolute():
        model_dir = Path(settings.BASE_DIR) / model_dir
    if not model_dir.exists():
        raise MisinformationModelUnavailable(
            f"Misinformation model folder not found: {model_dir}"
        )

    try:
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer
    except ImportError as exc:
        raise MisinformationModelUnavailable(
            "Install torch, transformers, and safetensors to enable misinformation detection."
        ) from exc

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
        "max_length": 512,
    }
    return _MODEL_BUNDLE


def _sentences(text):
    return [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", text)
        if len(sentence.split()) >= 4
    ]


def _claim_pairs(text, max_claims):
    sentences = _sentences(text)
    pairs = []
    for index, claim in enumerate(sentences):
        neighbors = sentences[max(0, index - 2):index] + sentences[index + 1:index + 3]
        evidence = " ".join(neighbors).strip()
        if evidence:
            pairs.append({"claim": claim, "evidence": evidence})
        if len(pairs) >= max_claims:
            break
    return pairs


def misinformation_class_names():
    bundle = _load_model_bundle()
    model = bundle["model"]
    id2label = getattr(model.config, "id2label", {}) or {}
    return [
        id2label.get(index) or id2label.get(str(index), str(index))
        for index in range(model.config.num_labels)
    ]


def predict_misinformation_pair_probabilities(evidence_texts, claim):
    if not evidence_texts:
        return []

    bundle = _load_model_bundle()
    torch = bundle["torch"]
    tokenizer = bundle["tokenizer"]
    model = bundle["model"]

    encoded = tokenizer(
        [str(text) for text in evidence_texts],
        [claim] * len(evidence_texts),
        padding=True,
        truncation=True,
        max_length=bundle["max_length"],
        return_tensors="pt",
    )
    with torch.no_grad():
        probabilities = torch.softmax(model(**encoded).logits, dim=-1)

    return [[float(value.item()) for value in row] for row in probabilities]


def predict_misinformation(text, max_claims=8):
    pairs = _claim_pairs(text, max(1, int(max_claims)))
    if not pairs:
        return {
            "score": 0.0,
            "verdict": "Low Risk",
            "model_name": "academic_misinformation_roberta_experiment_C",
            "claims_checked": 0,
            "claims": [],
        }

    bundle = _load_model_bundle()
    torch = bundle["torch"]
    tokenizer = bundle["tokenizer"]
    model = bundle["model"]

    encoded = tokenizer(
        [pair["evidence"] for pair in pairs],
        [pair["claim"] for pair in pairs],
        padding=True,
        truncation=True,
        max_length=bundle["max_length"],
        return_tensors="pt",
    )
    with torch.no_grad():
        probabilities = torch.softmax(model(**encoded).logits, dim=-1)

    id2label = getattr(model.config, "id2label", {}) or {}
    claims = []
    risk_scores = []
    for pair, row in zip(pairs, probabilities):
        values = [float(value.item()) for value in row]
        label_index = max(range(len(values)), key=values.__getitem__)
        label = id2label.get(label_index) or id2label.get(str(label_index), str(label_index))
        contradicted = values[_label_index(id2label, "CONTRADICTED")]
        not_enough = values[_label_index(id2label, "NOT_ENOUGH_EVIDENCE")]
        risk_scores.append(contradicted + (not_enough * 0.5))
        claims.append(
            {
                "claim": pair["claim"],
                "label": label,
                "confidence": round(values[label_index], 4),
                "contradicted_probability": round(contradicted, 4),
                "not_enough_evidence_probability": round(not_enough, 4),
            }
        )

    score = min(100.0, (sum(risk_scores) / len(risk_scores)) * 100.0)
    return {
        "score": score,
        "verdict": _verdict(score),
        "model_name": "academic_misinformation_roberta_experiment_C",
        "claims_checked": len(claims),
        "claims": claims,
    }


def _label_index(id2label, label):
    for index, name in id2label.items():
        if name == label:
            return int(index)
    return 0


def _verdict(score):
    if score > 60:
        return "High Risk"
    if score > 30:
        return "Moderate Risk"
    return "Low Risk"
