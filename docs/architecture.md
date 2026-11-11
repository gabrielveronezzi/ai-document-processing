# Architecture

## Context and scope

AI Document Processing is a portfolio project demonstrating solution architecture, API design, AI integration, and full-stack engineering. It is not intended to process confidential or production banking documents.

The first release focuses on one end-to-end use case: upload a PDF, extract selected information, validate a structured response, persist the result, and display it for human review.

## Logical components

### Web application — `frontend/web`
- React + TypeScript.
- Upload experience, processing status, and extracted-data review.
- Communicates only with the application API; it does not call the LLM provider directly.

### Application API — `backend/api`
- ASP.NET Core Web API.
- Owns document metadata, upload validation, orchestration, and persistence.
- Defines the contract consumed by the frontend and the AI service.
- Keeps storage and AI-provider details behind interfaces/adapters.
- Authentication and authorization are not implemented in the current MVP.

### AI service — `services/document-ai`
- Python + FastAPI.
- Extracts text from text-based PDFs and orchestrates structured extraction.
- Selects a provider through `DOCUMENT_AI_PROVIDER`: deterministic `mock` by default or `openai` when configured.
- Uses strict JSON Schema output for the OpenAI integration.
- Treats PDF content and model output as untrusted data; validates output before returning it.
- Keeps provider credentials in the service environment, never in the frontend.

### Persistence and file storage
- PostgreSQL stores document metadata, status, and extraction results.
- Local filesystem storage is sufficient for the first development iteration.
- A storage abstraction can later support S3-compatible or cloud object storage without changing application workflows.

## Initial processing sequence

1. Frontend submits a multipart PDF upload to the API.
2. API validates the file, assigns an ID, stores it, and creates a `Processing` document record.
3. API invokes the AI service with the PDF payload.
4. AI service extracts text and invokes the configured provider.
5. Provider returns schema-constrained structured fields; the service returns the validated result.
6. API persists the result and marks the document `Completed`; failures are recorded as `Failed`.
7. Frontend retrieves the document and its extraction result for review.

The MVP executes this flow synchronously. A background queue and worker should be introduced when processing time, retries, or throughput make synchronous requests unsuitable.

## Key design decisions

| Concern | Initial decision | Rationale |
|---|---|---|
| Service boundaries | .NET API + Python AI service | Separates application workflow and AI processing |
| LLM integration | Provider adapter | Avoids coupling the application to one model vendor |
| Output format | Strict JSON Schema | Makes extraction results predictable and verifiable |
| Processing | Synchronous MVP | Reduces initial infrastructure and operational complexity |
| Storage | PostgreSQL + local development storage | Simple local setup with a path to production adapters |
| Human review | Required in the UI | Extraction is probabilistic and must be reviewed |

## Security and privacy

- Do not use real customer, employee, employer, banking, or confidential documents.
- Do not commit secrets; load credentials from environment variables or a secret manager.
- Enforce file size and content-type checks; do not trust file extensions alone.
- Treat document text as untrusted input and validate all AI-generated output.
- Avoid logging raw PDF text, prompts containing sensitive data, or full extracted payloads.
- The OpenAI provider sends extracted PDF text to the configured OpenAI API account. Review applicable provider data controls before use.
- Authentication, authorization, retention controls, malware scanning, and production-grade secret management are not implemented and are required before deployment beyond a trusted local environment.

## Future evolution

- OCR for scanned PDFs.
- Background processing with a queue and retry policy.
- Authentication and role-based authorization.
- Object storage adapter and retention/deletion workflows.
- Structured audit events and correlation IDs.
- Metrics, tracing, and operational dashboards.
- Multiple document types and configurable extraction schemas.
