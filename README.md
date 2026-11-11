# AI Document Processing

A modular document-processing platform that extracts structured information from PDF files through an API and an independently deployable AI service.

> **Current status:** Backend + Python processing service implemented as an initial local MVP. The React frontend and real LLM integration are next.

## What works in this MVP

- Upload a PDF through the ASP.NET Core API.
- Validate file extension, PDF signature, and a 10 MB size limit.
- Store the original file locally and document metadata in PostgreSQL.
- Send the PDF to a Python/FastAPI service.
- Extract text from text-based PDFs with pypdf.
- Extract a small set of invoice-like fields using a deterministic mock provider.
- Persist and retrieve processing status and extracted results.
- Run the stack locally with Docker Compose.

The mock provider is intentional: it makes the end-to-end flow testable without an LLM key. It is **not** a production-grade extraction engine. Scanned PDFs currently require OCR and are not supported by the MVP.

## Architecture

| Component | Responsibility | Technology |
|---|---|---|
| API | Upload validation, orchestration, metadata, persistence | ASP.NET Core / .NET 10 |
| AI service | PDF text extraction and structured field extraction | Python 3.12, FastAPI, pypdf |
| Database | Document metadata and extraction result | PostgreSQL 17 |
| File storage | Original PDFs | Docker named volume (local MVP) |
| Frontend | Upload and review experience | React + TypeScript (planned) |

### Processing flow

1. `POST /api/documents` receives a multipart PDF.
2. The API validates the file, saves it, and creates a `Processing` record.
3. The API calls `POST /v1/process` on the Python service.
4. The Python service extracts text and returns structured fields.
5. The API stores the response and marks the record `Completed` or `Failed`.
6. Clients can retrieve the result using the document ID.

See [architecture notes](docs/architecture.md) and the [roadmap](docs/roadmap.md).

## Run locally

Prerequisite: Docker Desktop or Docker Engine with the Compose plugin.

From the repository root:

```bash
docker compose up --build
```

Services:

| Service | URL |
|---|---|
| .NET API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |
| Python AI service | http://localhost:8000 |
| AI service docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

Upload a PDF:

```bash
curl -X POST http://localhost:8080/api/documents \
  -F "file=@./sample-invoice.pdf"
```

The API returns a document ID and its processing status. Retrieve it with:

```bash
curl http://localhost:8080/api/documents/<DOCUMENT_ID>
```

List the latest documents:

```bash
curl http://localhost:8080/api/documents
```

Health checks:

- `GET http://localhost:8080/health`
- `GET http://localhost:8000/health`

Stop the stack:

```bash
docker compose down
```

To remove the local database and uploaded files as well:

```bash
docker compose down -v
```

## Run Python tests locally

```bash
cd services/document-ai
python -m pip install -r requirements.txt pytest
python -m pytest -q
```

## Repository structure

```text
.
├── backend/api/                 # ASP.NET Core API
├── services/document-ai/        # Python/FastAPI service
├── frontend/web/                # Planned React application
├── docs/                        # Architecture and roadmap
├── tests/                       # Cross-component test guidance
├── .github/workflows/ci.yml     # Python tests and .NET build
└── docker-compose.yml
```

## Current limitations and next steps

- Mock extraction only; replace it with a provider adapter for a real LLM.
- Text-based PDFs only; add OCR for scanned documents.
- Synchronous processing; introduce a queue and worker for long-running jobs.
- No authentication or authorization yet.
- Local file storage; add an object-storage adapter and retention controls.
- Add integration tests, migrations, and the React upload/review UI.

## Security and privacy

This is a portfolio MVP intended for local development. Do not expose it publicly or upload real customer, employee, banking, or confidential documents. Authentication, authorization, malware scanning, robust retention/deletion controls, and production-grade secret management must be implemented before deployment beyond a trusted local environment.

Never commit API keys, credentials, or sensitive files. Use synthetic sample PDFs only.

## License

License to be defined before external distribution.
