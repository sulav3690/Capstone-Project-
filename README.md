# VeritasAI

VeritasAI is a web platform for checking text authenticity and misinformation risk. It lets users submit text or extract text from uploaded documents, runs the analysis through local RoBERTa-based models, and stores private scan history for signed-in accounts.

The project combines AI-authorship detection, misinformation scoring, document text extraction, account management, subscription-based limits, payment callbacks, support tickets, and analysis history in one full-stack application.

## Core Features

- AI-generated text probability scoring with human/AI verdicts.
- Misinformation risk scoring with claim-level contradiction and evidence uncertainty signals.
- Text extraction from PDF, DOCX, PPTX, XLSX, ODT, ODS, ODP, LaTeX, CSV, Markdown, HTML, and plain text files.
- Authenticated scan history backed by MongoDB.
- Subscription rules for word limits, scan limits, deep scan access, and detailed reports.
- Optional Celery and Redis background processing for queued analyses.
- LIME XAI explanations for detailed report tiers when enabled.
- eSewa and Khalti sandbox payment flow support.

## Tech Stack

**Frontend**

- Next.js 15
- React 19
- Tailwind CSS 4
- lucide-react icons
- ESLint

**Backend**

- Django 4.2
- Django REST Framework
- MongoEngine with MongoDB
- Simple JWT with HTTP-only cookie authentication
- Celery for background jobs
- Redis for optional caching, queues, and rate limiting
- CORS, CSP, compression, and custom rate-limit middleware

**Machine Learning**

- PyTorch
- Transformers
- safetensors
- RoBERTa sequence classification models
- LIME XAI explainability

**Payments**

- eSewa ePay v2 sandbox
- Khalti KPG-2 sandbox

## Models

### AI Text Detector

Path: `ai-detector/roberta_ai_detector_v3_final`

- Base architecture: `roberta-base`
- Task: binary text classification
- Labels: `human`, `ai`
- Maximum sequence length: 256 tokens
- Minimum input length: 100 characters
- Calibrated AI threshold: `0.952530026435852`
- Output: AI probability, human probability, AI score, verdict, chunks analyzed

This model is used as the primary AI-authorship detector. If the local model is unavailable and strict model loading is disabled, the backend falls back to a lightweight heuristic detector so the application remains usable in development.

### Misinformation Detector

Path: `misinformation-detector/academic_misinformation_roberta_experiment_C`

- Base architecture: `cross-encoder/nli-roberta-base`
- Task: claim/evidence natural language inference
- Labels: `CONTRADICTED`, `SUPPORTED`, `NOT_ENOUGH_EVIDENCE`
- Maximum sequence length: 512 tokens
- Training pairs: 11,888 real pairs plus hard and controlled NEI examples
- Frozen bottom layers: 6
- Maximum epochs: 5

The misinformation score is based on contradiction probability plus a weighted not-enough-evidence probability across extracted claim/evidence pairs.

## Model Scores

### AI Text Detector Held-Out Results

Evaluated from `heldout_raid_results.csv` using the configured AI threshold.

| Metric | Score |
| --- | ---: |
| Samples | 4,416 |
| Accuracy | 70.6% |
| Precision | 99.4% |
| Recall | 64.3% |
| F1 score | 78.1% |

The threshold is precision-focused, so the model is conservative about labeling text as AI-generated.

### Misinformation Detector Results

From `experiment_summary.json` and `domain_comparison.csv`.

| Metric | Score |
| --- | ---: |
| Best development macro F1 | 72.3% |
| Academic test macro F1 mean | 61.0% |
| Challenge set accuracy | 86.7% |
| Challenge set size | 30 |

Fine-tuned domain scores:

| Domain | Accuracy | Macro F1 |
| --- | ---: | ---: |
| SciFact | 70.7% | 69.3% |
| HealthVer | 56.7% | 56.7% |
| Climate-FEVER | 69.8% | 57.2% |
| SNLI | 91.5% | 91.6% |

## Project Structure

```text
frontend/                  Next.js user interface
backend/                   Django API and background analysis logic
ai-detector/               Local AI text detector model bundle
misinformation-detector/   Local misinformation detector model bundle
start.bat                  Starts backend and frontend together
start-backend-8010.cmd     Starts the backend on port 8010
start-frontend.cmd         Starts the frontend on port 3000
```

## Payment Sandboxes

The backend is configured for payment testing by default:

- eSewa uses sandbox mode with the `EPAYTEST` product code and UAT payment/status endpoints.
- Khalti uses sandbox mode with the KPG-2 development API URL.
- Production deployments must replace all sandbox keys, product codes, and provider URLs with live merchant credentials.

## Running Locally

Requirements:

- Node.js
- Python 3
- MongoDB
- Redis, optional unless `USE_REDIS=True`

Quick start on Windows:

```bat
start.bat
```

Manual frontend start:

```bat
cd frontend
npm install
npm run dev
```

Manual backend start:

```bat
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe manage.py sync_mongo_indexes
.venv\Scripts\python.exe manage.py runserver localhost:8010
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8010/api/health/`

## Important Notes

- Model outputs are risk signals, not final proof of authorship or factuality.
- Local development can run without Redis unless Redis-backed queues are enabled.
- The checked-in model bundles are loaded from disk with `local_files_only=True`.
- User scans and analysis jobs are stored in MongoDB through MongoEngine documents.
