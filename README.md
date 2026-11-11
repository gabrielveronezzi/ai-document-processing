# AI Document Processing

A modular document-processing platform that extracts structured information from PDF files through an API and an independently deployable AI service, with a React review interface.

> **Current status:** Local MVP with React frontend, ASP.NET Core API, Python processing service, and PostgreSQL. Extraction currently uses a deterministic mock provider rather than a live LLM.

## What works in this MVP

- Upload a PDF through the React interface or API.
- Validate file extension, PDF signature, and a 10 MB API size limit.
- Store the original file locally and document metadata in PostgreSQL.
- Send the PDF to a Python/FastAPI service.
- Extract text from text-based PDFs with pypdf.
- Extract a small set of invoice-like fields using a deterministic mock provider.
- Persist and retrieve processing status and extracted results.
- Review document history, status, and extracted fields in the web interface.
- Run the stack locally with Docker Compose.

The mock provider is intentional: it makes the end-to-end flow testable without an LLM key. It is **not** a production-grade extraction engine. Scanned PDFs currently require OCR and are not supported by the MVP.

## Architecture

| Component | Responsibility | Technology |
|---|---|---|
| Web | Upload, document history, extraction review | React, TypeScript, Vite, Nginx |
| API | Upload validation, orchestration, metadata, persistence | ASP.NET Core / .NET 10 |
| AI service | PDF text extraction and structured field extraction | Python 3.12, FastAPI, pypdf |
| Database | Document metadata and extraction result | PostgreSQL 17 |
| File storage | Original PDFs | Docker named volume (local MVP) |

### Processing flow

1. The web app sends a multipart PDF to `POST /api/documents`.
2. The API validates the file, saves it, and creates a `Processing` record.
3. The API calls `POST /v1/process` on the Python service.
4. The Python service extracts text and returns structured fields.
5. The API stores the response and marks the record `Completed` or `Failed`.
6. The web app displays the document status and extracted fields.

See [architecture notes](docs/architecture.md) and the [roadmap](docs/roadmap.md).

## Run locally

Prerequisite: Docker Desktop or Docker Engine with the Compose plugin.

From the repository root:

```bash
docker compose up --build
```

Open the web application at **http://localhost:3000**.

Services:

| Service | URL |
|---|---|
| Web application | http://localhost:3000 |
| .NET API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |
| Python AI service | http://localhost:8000 |
| AI service docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

The web app uses Nginx to proxy `/api` requests to the API container, so the browser does not need to resolve Docker service names or use a separate CORS configuration.

Upload directly through the UI, or use the API:

```bash
curl -X POST http://localhost:8080/api/documents \
  -F "file=@./sample-invoice.pdf"
```

Retrieve a document by ID:

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

## Run frontend independently

Requires Node.js 22+.

```bash
cd frontend/web
npm install
npm run dev
```

The Vite dev server proxies API requests to `http://localhost:8080`. Start the API and dependencies separately.

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
├── frontend/web/                # React + TypeScript application
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
- Add integration tests, migrations, and end-to-end frontend tests.

## Security and privacy

This is a portfolio MVP intended for local development. Do not expose it publicly or upload real customer, employee, banking, or confidential documents. Authentication, authorization, malware scanning, robust retention/deletion controls, and production-grade secret management must be implemented before deployment beyond a trusted local environment.

Never commit API keys, credentials, or sensitive files. Use synthetic sample PDFs only.

## License

License to be defined before external distribution.
