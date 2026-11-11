# AI Document Processing

[![CI](https://github.com/gabrielveronezzi/ai-document-processing/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrielveronezzi/ai-document-processing/actions/workflows/ci.yml)

A modular, AI-assisted document processing platform that turns PDF files into structured, reviewable data. It combines a React web interface, an ASP.NET Core API, an independently deployable Python AI service, and PostgreSQL.

> **Project status:** Portfolio MVP. The full Docker Compose stack is covered by an automated integration smoke test. It is intended for local evaluation and demonstration—not production deployment.

## Why this project?

Many business workflows still depend on manually reading documents and re-entering information into systems. This project explores a modular approach to extracting structured data from PDFs while keeping the application workflow, AI integration, and user review responsibilities separate.

The implementation demonstrates:
- Full-stack engineering across TypeScript, .NET, and Python.
- Service boundaries and API-based orchestration.
- Provider-based AI integration with schema-constrained output.
- Containerized local development and automated CI validation.
- Defensive handling of untrusted document content and explicit human review.

## Capabilities

- Upload PDF documents through the web interface or REST API.
- Validate file extension, PDF signature, and a 10 MB upload limit at the API.
- Persist document metadata, processing status, and extraction results in PostgreSQL.
- Extract text from text-based PDFs using pypdf.
- Switch between a deterministic mock provider (default) and an optional OpenAI provider.
- Constrain AI responses with JSON Schema and represent unavailable fields as null.
- Review document history, processing status, and extracted fields in the web interface.
- Run the complete stack locally with Docker Compose.

**Current scope:** scanned PDFs requiring OCR are not supported. Processing is synchronous. Authentication and authorization are not implemented. See [limitations and roadmap](#limitations-and-roadmap).

## Architecture

| Component | Responsibility | Technology |
|---|---|---|
| Web application | PDF upload, document history, result review | React, TypeScript, Vite, Nginx |
| Application API | Validation, orchestration, metadata, persistence | ASP.NET Core / .NET 10 |
| AI service | PDF text extraction and structured extraction | Python 3.12, FastAPI, pypdf, OpenAI SDK |
| Database | Document metadata, status, extraction result | PostgreSQL 17 |
| File storage | Original PDF files in the local MVP | Docker named volume |

### Processing flow

1. The web application submits a PDF to `POST /api/documents`.
2. The API validates the upload, stores the file, and creates a processing record.
3. The API calls the Python service at `POST /v1/process`.
4. The AI service extracts text and invokes the configured provider.
5. The provider returns structured data constrained by a JSON Schema.
6. The API persists the result and updates the document status.
7. The web application displays the status and extracted fields for human review.

See [Architecture](docs/architecture.md) for component responsibilities, design decisions, and security considerations.

## Quick start

### Prerequisites

- Docker Desktop or Docker Engine with the Docker Compose plugin.

### Start the application

From the repository root:

```bash
docker compose up --build
```

Open **http://localhost:3000**.

| Service | Local address |
|---|---|
| Web application | http://localhost:3000 |
| .NET API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |
| Python AI service | http://localhost:8000 |
| AI service documentation | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

The web container uses Nginx to proxy `/api` requests to the API container.

### AI provider configuration

The deterministic mock provider is enabled by default. It requires no API key and is suitable for local demonstrations and automated tests.

To enable OpenAI extraction, create a local `.env` file in the repository root:

```dotenv
DOCUMENT_AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
```

Then start or rebuild the stack:

```bash
docker compose up --build
```

To switch back, set `DOCUMENT_AI_PROVIDER=mock`. The API key is consumed by the Python service and is not sent to the frontend. **Never commit the `.env` file or share real credentials.**

When the OpenAI provider is enabled, extracted PDF text is sent to the configured OpenAI API account. Use synthetic or non-sensitive documents only, and review the provider's applicable data-handling terms.

### Try the API

Upload a PDF:

```bash
curl -X POST http://localhost:8080/api/documents \
  -F "file=@./sample-invoice.pdf"
```

Retrieve a document:

```bash
curl http://localhost:8080/api/documents/<DOCUMENT_ID>
```

List recent documents:

```bash
curl http://localhost:8080/api/documents
```

Health endpoints:

- API: `GET http://localhost:8080/health`
- AI service: `GET http://localhost:8000/health`

### Stop the application

```bash
docker compose down
```

To also remove the local database and uploaded files:

```bash
docker compose down -v
```

## Continuous integration

GitHub Actions runs four jobs on pushes and pull requests targeting `main`, and can also be triggered manually:

| Job | What it validates |
|---|---|
| `python-tests` | Python service automated tests |
| `dotnet-build` | .NET API restore and Release build |
| `frontend-build` | React/TypeScript production build |
| `integration-smoke` | Builds and starts the Docker Compose stack, checks service health, uploads a synthetic invoice PDF, and verifies the extracted response |

The integration smoke test uses the mock provider, so it does not require an OpenAI API key. The workflow tears down the containers and volumes after the test.

## Repository structure

```text
.
├── backend/api/                 # ASP.NET Core API
├── services/document-ai/        # Python/FastAPI and extraction providers
├── frontend/web/                # React + TypeScript application
├── docs/
│   ├── architecture.md          # Architecture and design decisions
│   └── roadmap.md               # Delivery status and planned evolution
├── tests/                       # Cross-component test guidance
├── .github/workflows/ci.yml     # Automated CI pipeline
└── docker-compose.yml
```

## Limitations and roadmap

This is a deliberately scoped MVP. The next engineering increments include:

- OCR support for scanned documents.
- Asynchronous processing, retries, and idempotency.
- Authentication, authorization, and role-based access.
- Object storage integration and retention/deletion policies.
- Structured logs, metrics, distributed tracing, and audit events.
- Security hardening and deployment documentation.

The current application should not be exposed to the public internet or used for real customer, employee, banking, or confidential documents. See the [roadmap](docs/roadmap.md) for tracked work.

## Security and privacy

- Treat uploaded PDFs and their contents as untrusted input.
- Use synthetic documents for demonstrations and testing.
- Never commit API keys, credentials, or sensitive files.
- Do not log raw document text or sensitive extracted content.
- OpenAI-enabled extraction transmits extracted PDF text to the configured OpenAI API account.
- Authentication, authorization, malware scanning, robust retention controls, and production-grade secret management are not yet implemented.

A successful CI run demonstrates that the automated checks pass; it is not a production security assessment or a guarantee of production readiness.

## License

No license has been selected yet. All rights reserved unless and until a license is added.
