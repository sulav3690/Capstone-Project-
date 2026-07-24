# API and Postman Test Guide

This document lists every backend API used by the website and gives practical Postman test cases. It reflects the current implementation; no application code was changed.

## 1. Postman setup

Create a Postman environment with these variables:

| Variable | Initial value | Purpose |
|---|---|---|
| `baseUrl` | `http://127.0.0.1:8010` | Backend address |
| `username` | `postman_user` | Test account username |
| `email` | `postman_user@example.com` | Test account email |
| `password` | `Postman123!` | Test account password (minimum 8 characters) |
| `jobId` | leave blank | Set after starting an analysis |
| `recordId` | leave blank | Set after an analysis succeeds |

Use `Content-Type: application/json` unless an endpoint says otherwise. Keep the final `/` in every URL; Django may redirect requests that omit it.

### Authentication

Authentication uses two HTTP-only cookies:

- `access_token`: used by protected APIs; default lifetime is 15 minutes unless changed in environment settings.
- `refresh_token`: used to obtain a new access token; default lifetime is configured by the backend.

Postman normally stores cookies from Register or Login automatically. Confirm that the cookie jar for `127.0.0.1` contains both cookies. Use the same hostname throughout: cookies created for `127.0.0.1` will not be sent to `localhost`.

### Common Postman test script

Use this basic script in the **Tests** tab and adjust the expected status:

```javascript
pm.test("Expected HTTP status", () => {
  pm.response.to.have.status(200);
});

pm.test("Response is JSON", () => {
  pm.response.to.be.json;
});

pm.test("Response has a status field", () => {
  pm.expect(pm.response.json()).to.have.property("status");
});
```

## 2. Endpoint summary

| # | Method | Endpoint | Authentication | Expected success |
|---:|---|---|---|---:|
| 1 | GET | `/api/health/` | Public | 200 |
| 2 | POST | `/api/auth/register/` | Public | 201 |
| 3 | POST | `/api/auth/login/` | Public | 200 |
| 4 | POST | `/api/auth/logout/` | Access cookie | 200 |
| 5 | POST | `/api/auth/token/refresh/` | Refresh cookie | 200 |
| 6 | GET | `/api/auth/me/` | Access cookie | 200 |
| 7 | PUT | `/api/auth/me/` | Access cookie | 200 |
| 8 | PATCH | `/api/auth/me/` | Access cookie | 200 |
| 9 | GET | `/api/auth/admin-stats/` | Admin authorization | 200 |
| 10 | POST | `/api/auth/feedback/` | Public | 201 |
| 11 | POST | `/api/auth/onboarding-survey/` | Public | 201 |
| 12 | POST | `/api/support/` | Public | 201 |
| 13 | POST | `/api/analyze/` | Access cookie | 202 |
| 14 | GET | `/api/analyze/status/:jobId/` | Access cookie | 200 |
| 15 | GET | `/api/analyze/history/` | Access cookie | 200 |
| 16 | GET | `/api/analyze/history/:recordId/` | Access cookie; record owner | 200 |

## 3. Health API

### GET `/api/health/`

Request: `GET {{baseUrl}}/api/health/`

Example success response:

```json
{
  "status": "ok",
  "services": {
    "mongodb": "ok",
    "redis": "disabled"
  },
  "server_metadata": {
    "framework": "Django REST Framework (Django 4.2)",
    "version": "1.0.0",
    "timestamp": 1750000000
  }
}
```

Tests:

1. Healthy backend: expect 200, `services.mongodb` = `ok`, and overall status `ok` or `degraded`.
2. MongoDB unavailable: expect 500, overall status `unhealthy`, and MongoDB `failed`.
3. Redis unavailable while enabled: expect 200 with overall status `degraded` and Redis `degraded`.

```javascript
pm.test("Health response has service state", () => {
  const body = pm.response.json();
  pm.expect(body.services).to.have.keys("mongodb", "redis");
  pm.expect(body.server_metadata.timestamp).to.be.a("number");
});
```

## 4. Authentication and profile APIs

### POST `/api/auth/register/`

Request: `POST {{baseUrl}}/api/auth/register/`

```json
{
  "username": "{{username}}",
  "email": "{{email}}",
  "password": "{{password}}",
  "full_name": "Postman Test User",
  "phone": "9841234567",
  "country_code": "+977",
  "role": "student"
}
```

Required: `username`, `email`, `password`. Optional role values: `student`, `teacher`, `other`. Phone, when supplied, must contain 7–15 digits after non-digits are removed. Username permits letters, numbers, `_`, `.`, `@`, `+`, and `-`.

Tests:

1. New valid account: 201, status `success`, user returned, and access/refresh cookies created.
2. Duplicate username: 400 with `details.username`.
3. Duplicate email: 400 with `details.email`.
4. Password shorter than 8 characters: 400.
5. Invalid email, username characters, phone, or role: 400.
6. Missing required field: 400.

```javascript
pm.test("User was registered", () => {
  pm.response.to.have.status(201);
  const body = pm.response.json();
  pm.expect(body.status).to.eql("success");
  pm.expect(body.user.username).to.eql(pm.environment.get("username"));
  pm.expect(body.user).not.to.have.property("password");
});
```

### POST `/api/auth/login/`

The `username` field accepts either the username or email address.

```json
{
  "username": "{{username}}",
  "password": "{{password}}"
}
```

Tests:

1. Valid username/password: 200, user returned, cookies created.
2. Valid email/password: 200.
3. Wrong password or unknown user: 401.
4. Missing username or password: 400.

```javascript
pm.test("Login succeeds and does not expose password", () => {
  pm.response.to.have.status(200);
  const body = pm.response.json();
  pm.expect(body.status).to.eql("success");
  pm.expect(body.user).not.to.have.property("password");
});
```

### POST `/api/auth/logout/`

Request: `POST {{baseUrl}}/api/auth/logout/` with no body. Requires the access cookie. It clears both authentication cookies and attempts to blacklist the refresh token.

Tests:

1. Logged-in user: 200 and status `success`.
2. Call `GET /api/auth/me/` afterward: expect 401.
3. No/invalid access cookie: expect 401.

### POST `/api/auth/token/refresh/`

Request: `POST {{baseUrl}}/api/auth/token/refresh/` with no body. The `refresh_token` cookie must exist.

Tests:

1. Valid refresh cookie: 200 and a new `access_token` cookie.
2. Missing refresh cookie: 401.
3. Expired, malformed, or blacklisted refresh cookie: 401 and authentication cookies cleared.

### GET `/api/auth/me/`

Request: `GET {{baseUrl}}/api/auth/me/`

Returns `id`, `username`, `email`, `full_name`, `phone`, `country_code`, `role`, `profile_picture_url`, `subscription_plan`, `is_admin`, and `created_at` under `user`.

Tests:

1. Valid access cookie: 200 and the logged-in user's profile.
2. Missing/expired access cookie: 401.

### PUT or PATCH `/api/auth/me/`

Both methods perform a partial update. JSON example:

```json
{
  "username": "postman_user_updated",
  "email": "postman_updated@example.com",
  "subscription_plan": "Monthly"
}
```

Allowed subscription plans in the stored user model are `Free`, `Weekly`, `Monthly`, and `Yearly`.

For a profile picture, select **form-data** instead of raw JSON, add `profile_picture` as a File, and optionally add `username`, `email`, or `subscription_plan` as Text fields. Do not manually set the multipart `Content-Type`; Postman adds the boundary.

Tests:

1. Update one field with PATCH: 200 and changed field in `user`.
2. Update several fields with PUT: 200.
3. Upload a valid image: 200 and non-empty `profile_picture_url`.
4. Username/email already used by another account: 400.
5. Invalid email or non-image upload: 400.
6. Missing access cookie: 401.

## 5. Admin API

### GET `/api/auth/admin-stats/`

Request: `GET {{baseUrl}}/api/auth/admin-stats/`

Authorization is accepted in either of these ways:

- Log in as a user whose `is_admin` is true or whose username is exactly `admin`.
- Development mode only: send headers `X-Admin-Username: admin` and `X-Admin-Password: admin123`.

The response contains totals plus up to 50 newest users and 50 newest scans.

Tests:

1. Authenticated admin: 200; `stats.total_users` and `stats.total_scans` are numbers.
2. Development headers while DEBUG is true: 200.
3. Ordinary authenticated user: 403.
4. No authorization: 403.
5. Development headers while DEBUG is false: 403.

```javascript
pm.test("Admin statistics have expected collections", () => {
  pm.response.to.have.status(200);
  const body = pm.response.json();
  pm.expect(body.stats.total_users).to.be.a("number");
  pm.expect(body.stats.total_scans).to.be.a("number");
  pm.expect(body.users).to.be.an("array");
  pm.expect(body.scans).to.be.an("array");
});
```

## 6. Feedback, survey, and support APIs

### POST `/api/auth/feedback/`

All fields are optional.

```json
{
  "hear_about_us": "Search engine",
  "role": "Student",
  "ai_usage": "Weekly",
  "why_choose_us": ["Easy to use", "Fast results"]
}
```

Tests:

1. Valid payload: 201.
2. Empty object: 201 (currently allowed).
3. `why_choose_us` is not a list: 400.
4. A list member is not a valid string: 400.

### POST `/api/auth/onboarding-survey/`

All fields are optional.

```json
{
  "role": "student",
  "email": "{{email}}",
  "heard_about_us": "Friend",
  "purpose": "Check assignments",
  "plan_chosen": "Free",
  "completed_at": "2026-07-15T12:00:00Z"
}
```

Tests:

1. Valid payload: 201.
2. Empty object: 201 (currently allowed).
3. Invalid email: 400.
4. Invalid datetime: 400.

### POST `/api/support/`

```json
{
  "name": "Postman Test User",
  "email": "{{email}}",
  "subject": "Postman API test",
  "message": "This ticket was submitted during API verification."
}
```

All four fields are required.

Tests:

1. Valid ticket: 201.
2. Missing any required field: 400.
3. Invalid email: 400.
4. `name` or `subject` longer than 255 characters: 400.

## 7. Analysis APIs

All analysis endpoints require a valid access cookie.

### POST `/api/analyze/`

```json
{
  "text": "Furthermore, this is a sufficiently long sample paragraph for testing the analysis service through Postman.",
  "aiDetection": true,
  "misinformation": true
}
```

`text` is required, must have at least 20 characters, and cannot exceed 5,000 whitespace-separated words. Both Boolean flags default to `true` when omitted.

Success returns 202 because analysis may run asynchronously. Save the job ID:

```javascript
pm.test("Analysis was queued", () => {
  pm.response.to.have.status(202);
  const body = pm.response.json();
  pm.expect(body.job_id).to.be.a("string").and.not.empty;
  pm.environment.set("jobId", body.job_id);
});
```

Tests:

1. Valid text and both flags: 202 with `job_id`.
2. Omit flags: 202; both default to true.
3. Set one/both flags false: 202; disabled score should be 0 in the final result.
4. Text under 20 characters: 400.
5. Text over 5,000 words: 400.
6. Missing text or non-Boolean flags: 400.
7. Missing access cookie: 401.

### GET `/api/analyze/status/:jobId/`

Request: `GET {{baseUrl}}/api/analyze/status/{{jobId}}/`

Possible job statuses are `PENDING`, `PROCESSING`, `SUCCESS`, and `FAILED`. On `SUCCESS`, `job.result` contains the complete analysis record.

```javascript
pm.test("Job status is valid", () => {
  pm.response.to.have.status(200);
  const body = pm.response.json();
  pm.expect(["PENDING", "PROCESSING", "SUCCESS", "FAILED"]).to.include(body.job.status);
  if (body.job.status === "SUCCESS") {
    pm.expect(body.job.result).to.have.property("id");
    pm.environment.set("recordId", body.job.result.id);
  }
});
```

Tests:

1. Existing job: 200 with a valid status.
2. Completed job: 200 with result fields `id`, `input_text`, `ai_score`, `misinformation_score`, `detailed_breakdown`, and `created_at`.
3. Unknown job ID: 404.
4. Missing access cookie: 401.

Note: the current status endpoint checks that the caller is authenticated, but it does not check that the job belongs to that caller.

### GET `/api/analyze/history/`

Request: `GET {{baseUrl}}/api/analyze/history/`

Tests:

1. Authenticated user: 200 and `history` is an array, newest records first.
2. New user with no analyses: 200 and empty array.
3. Missing access cookie: 401.
4. Confirm records from another account are not present.

### GET `/api/analyze/history/:recordId/`

Request: `GET {{baseUrl}}/api/analyze/history/{{recordId}}/`

Tests:

1. Record owned by logged-in user: 200 with `record`.
2. Existing record owned by another user: 403.
3. Unknown or malformed record ID: 404.
4. Missing access cookie: 401.

## 8. End-to-end Postman run order

Run requests in this order for a complete smoke test:

1. Health check.
2. Register a unique user; confirm cookies.
3. Get current profile.
4. Patch the profile.
5. Submit feedback.
6. Submit onboarding survey.
7. Submit support ticket.
8. Start analysis; save `jobId`.
9. Poll job status every 1–2 seconds until `SUCCESS`; save `recordId`.
10. List analysis history.
11. Get the saved record detail.
12. Refresh the access token.
13. Log out.
14. Confirm a protected endpoint now returns 401.
15. Log in again using username, then repeat using email.

Use a unique username/email on every full run, for example by adding a timestamp in a pre-request script:

```javascript
const suffix = Date.now();
pm.environment.set("username", `postman_${suffix}`);
pm.environment.set("email", `postman_${suffix}@example.com`);
```

Place that script only on the Register request (or run it once), otherwise later requests will accidentally use a different account name.

## 9. Cross-cutting negative and security tests

| Test | Expected result |
|---|---|
| Protected endpoint without cookies | 401 |
| Protected endpoint with malformed/expired access cookie | 401 |
| Unsupported HTTP method | 405 |
| Invalid JSON request body | 400 |
| Wrong `Content-Type` for JSON | 400 or 415 depending on parser behavior |
| Access another user's history detail | 403 |
| Non-admin calls admin stats | 403 |
| Duplicate registration | 400 |
| Response user object contains password | Must never occur |
| SQL/HTML/script-like strings in text fields | Must not cause server error or execute in a client |

When Redis rate limiting is enabled:

- `/api/auth/*` permits 10 requests per IP per 60 seconds.
- Other API paths permit 100 requests per IP per 60 seconds.
- `/api/health/` bypasses rate limiting.
- Exceeding a limit returns 429, a `Retry-After` header, and retry details in JSON.

## 10. Current implementation observations to verify

These are useful QA checks, not code changes:

1. The browser API utility exposes GET, POST, PUT, and DELETE, but the payment page calls `api.patch(...)`. The backend supports PATCH; that particular browser call may fail before reaching it.
2. Profile `subscription_plan` is accepted by the serializer as any string, while the database model only accepts `Free`, `Weekly`, `Monthly`, or `Yearly`. Test an invalid value and watch for a possible 500 response rather than a clean 400 validation response.
3. The job-status endpoint allows any authenticated user who knows a job ID to query it; unlike history detail, it has no ownership check.
4. Development admin headers contain fixed credentials and work only while Django DEBUG mode is enabled. They must not be relied on in production.
5. Analysis scores include random values, so assert valid ranges and structure rather than exact score numbers.

## 11. Result record checks

For a successful analysis, verify:

- `ai_score` and `misinformation_score` are numbers from 0 through 100.
- A disabled detector has a score of 0.
- `detailed_breakdown.metrics` contains word, character, and sentence counts plus average sentence length.
- `detailed_breakdown.ai_details` contains markers, perplexity, burstiness, and verdict.
- `detailed_breakdown.misinfo_details` contains markers, capitalization ratio, claim count, and verdict.
- `created_at` is a valid ISO datetime.
- History and detail return the same record values for the same ID.
