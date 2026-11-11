# Roadmap

## Phase 1 — Foundation
- [x] Define scope and architecture.
- [x] Create repository structure and engineering conventions.
- [x] Add solution/project files and local development configuration.

## Phase 2 — First vertical slice
- [x] Upload a PDF through the API.
- [x] Persist document metadata and processing status.
- [x] Extract PDF text in the Python service.
- [x] Return schema-validated structured data from a mock provider.
- [x] Persist and retrieve extraction results.

## Phase 3 — AI integration and UI
- [x] Add a hosted OpenAI provider behind a provider adapter.
- [x] Build the React upload and result-review screens.
- [x] Add error handling and user-friendly processing states.

## Phase 4 — Quality and operations
- [x] Unit tests for deterministic extraction/provider behavior.
- [x] GitHub Actions CI for Python, .NET, and frontend builds.
- [ ] Integration and end-to-end tests.
- [ ] Structured logs, metrics, and tracing.
- [ ] Background processing, retries, and idempotency.

## Phase 5 — Production-oriented capabilities
- [ ] Authentication and authorization.
- [ ] Object storage and retention policies.
- [ ] Audit trail and operational dashboards.
- [ ] OCR for scanned PDFs.
- [ ] Deployment documentation and production security review.
