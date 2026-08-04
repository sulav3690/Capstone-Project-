import re

import numpy as np

from apps.detector.ai_model import predict_ai_probabilities
from apps.detector.misinfo_model import (
    _claim_pairs,
    misinformation_class_names,
    predict_misinformation_pair_probabilities,
)


SEED = 42
AI_CLASS_NAMES = ["HUMAN", "AI"]


def _normalize_text(text):
    text = str(text).replace("\u00a0", " ").replace("\u200b", "")
    return re.sub(r"\s+", " ", text).strip()


def _explainer(class_names):
    from lime.lime_text import LimeTextExplainer

    return LimeTextExplainer(
        class_names=class_names,
        bow=False,
        random_state=SEED,
    )


def _feature_rows(explanation, label, class_name):
    return [
        {
            "text": feature,
            "weight": round(float(weight), 4),
            "direction": "supports" if weight > 0 else "opposes",
            "class": class_name,
        }
        for feature, weight in explanation.as_list(label=label)
    ]


def _ai_classifier(texts):
    rows = predict_ai_probabilities([_normalize_text(text) for text in texts])
    return np.array(
        [
            [item["human_probability"], item["ai_probability"]]
            for item in rows
        ],
        dtype=float,
    )


def explain_ai_text(text, num_features=10, num_samples=30):
    text = _normalize_text(text)
    probabilities = _ai_classifier([text])[0]
    label = int(np.argmax(probabilities))
    class_name = AI_CLASS_NAMES[label]

    explanation = _explainer(AI_CLASS_NAMES).explain_instance(
        text_instance=text,
        classifier_fn=_ai_classifier,
        labels=[label],
        num_features=num_features,
        num_samples=num_samples,
    )

    return {
        "explained_class": class_name,
        "probability": round(float(probabilities[label]), 4),
        "local_fidelity": round(float(explanation.score), 4),
        "features": _feature_rows(explanation, label, class_name),
    }


def _label_index(class_names, label, default=0):
    try:
        return class_names.index(label)
    except ValueError:
        return default


def explain_misinformation_text(
    text,
    max_claims=8,
    max_explanations=1,
    num_features=10,
    num_samples=30,
):
    pairs = _claim_pairs(_normalize_text(text), max_claims=max_claims)
    if not pairs:
        return []

    class_names = misinformation_class_names()
    contradicted_index = _label_index(class_names, "CONTRADICTED")
    not_enough_index = _label_index(class_names, "NOT_ENOUGH_EVIDENCE")

    ranked_pairs = []
    for pair in pairs:
        probabilities = predict_misinformation_pair_probabilities(
            [pair["evidence"]],
            pair["claim"],
        )[0]
        risk = probabilities[contradicted_index] + (
            probabilities[not_enough_index] * 0.5
        )
        ranked_pairs.append((risk, pair, probabilities))

    explanations = []
    for _, pair, probabilities in sorted(
        ranked_pairs,
        key=lambda item: item[0],
        reverse=True,
    )[:max_explanations]:
        label = int(np.argmax(probabilities))
        class_name = class_names[label]

        def classifier(evidence_texts, claim=pair["claim"]):
            return np.array(
                predict_misinformation_pair_probabilities(evidence_texts, claim),
                dtype=float,
            )

        explanation = _explainer(class_names).explain_instance(
            text_instance=pair["evidence"],
            classifier_fn=classifier,
            labels=[label],
            num_features=num_features,
            num_samples=num_samples,
        )

        explanations.append(
            {
                "claim": pair["claim"],
                "explained_class": class_name,
                "probability": round(float(probabilities[label]), 4),
                "local_fidelity": round(float(explanation.score), 4),
                "features": _feature_rows(explanation, label, class_name),
            }
        )

    return explanations
