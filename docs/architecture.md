# Architecture

## Context and scope

AI Document Processing is a portfolio project demonstrating solution architecture, API design, AI integration, and full-stack engineering. It is not intended to process confidential or production banking documents.

The first release focuses on one end-to-end use case: upload a PDF, extract selected information, validate a structured response, persist the result, and display it for human review.

## Logical components

### Web application — `frontend/web`

- React + TypeScript.
- Upload experience, processing status, and extracted-data review.
- Communicates only with the public application API; it does not call the LLM provider directly.

### Application API — `backend/api`

- ASP.NET Core Web API.
- Owns document metadata, upload validation, orchestration, persistence, and application-level authorization.
- Defines the contract consumed by the frontend and the AI service.
- Keeps storage and AI-provider details behind interfaces/adapters.

### AI service — `services/document-ai`

- Python + FastAPI.
- Responsible for PDF text extraction, prompt construction, LLM invocation, and schema validation.
- Uses a provider adapter so the orchestration layer is not coupled to one model vendor.
- Treats model output as untrusted and rejects invalid or incomplete structured responses.

### Persistence and file storage

- PostgreSQL stores document metadata, status, and normalized extraction results.
- Local filesystem storage is sufficient for the first development iteration.
- A storage abstraction can later support S3-compatible or cloud object storage without changing application workflows.

## Initial processing sequence

1. Frontend submits a multipart PDF upload to the API.
2. API validates file type and size, assigns an ID, stores the file, and creates a `Pending` document record.
3. API invokes the AI service with the document reference or file payload.
4. AI service extracts text, calls the configured provider, and validates the response against a defined schema.
5. API persists the validated result and marks the document `Completed`; failures are recorded as `Failed` without exposing sensitive provider details.
6. Frontend retrieves the document and its extraction result for review.

The MVP may execute this flow synchronously. A background queue and worker should be introduced when processing time, retries, or throughput make synchronous requests unsuitable.

## Key design decisions

| Concern | Initial decision | Rationale |
|---|---|---|
| Service boundaries | .NET API + Python AI service | Keeps application workflow and AI/data processing concerns independently evolvable |
| LLM integration | Provider adapter | Avoids vendor lock-in and simplifies testing |
| Output format | Explicit JSON schema | Makes extraction results predictable and verifiable |
| Processing | Synchronous MVP | Reduces initial infrastructure and operational complexity |
| Storage | PostgreSQL + local development storage | Simple local setup with a path to production adapters |
| Human review | Required in the UI | Extraction is probabilistic and must be reviewable |

## Security and privacy

- Do not use real customer, employee, or employer documents.
- Do not commit secrets; load credentials from environment variables.
- Enforce file size and content-type checks; do not trust file extensions alone.
- Validate all AI-generated output before persistence or downstream use.
- Avoid logging raw PDF text, prompts containing sensitive data, or full extracted payloads.
- Add authentication, authorization, retention controls, and malware scanning before any production use.

## Future evolution

- Background processing with a queue and retry policy.
- Authentication and role-based authorization.
- Object storage adapter and retention/deletion workflows.
- Structured audit events and correlation IDs.
- Metrics, tracing, and operational dashboards.
- Multiple document types and configurable extraction schemas.
