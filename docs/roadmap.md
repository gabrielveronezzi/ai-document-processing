# Roadmap

This roadmap distinguishes completed MVP capabilities from work that remains before any production-oriented deployment.

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

## Phase 3 — AI integration and user experience
- [x] Add an OpenAI provider behind a provider adapter.
- [x] Build the React upload and result-review screens.
- [x] Add error handling and user-friendly processing states.

## Phase 4 — Automated quality checks
- [x] Unit tests for deterministic extraction/provider behavior.
- [x] GitHub Actions CI for Python tests, .NET build, and frontend build.
- [x] Docker Compose integration smoke test covering service health, synthetic PDF upload, extraction, persistence, and API response.
- [ ] Expand automated coverage for failure paths and edge cases.
- [ ] Add structured logs, metrics, and tracing.

## Phase 5 — Resilience and production-oriented capabilities
- [ ] Background processing, retries, and idempotency.
- [ ] Authentication and authorization.
- [ ] Object storage and retention/deletion policies.
- [ ] Audit trail and operational dashboards.
- [ ] OCR for scanned PDFs.
- [ ] Deployment documentation, threat modeling, and production security review.
