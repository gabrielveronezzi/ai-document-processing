# AI Document Processing

A modular document-processing platform that extracts structured information from PDF files through an API and an independently deployable AI service, with a React review interface.

> **Current status:** Local MVP with React frontend, ASP.NET Core API, Python processing service, PostgreSQL, and an optional OpenAI extraction provider. The deterministic mock provider remains the default.

## What works in this MVP

- Upload a PDF through the React interface or API.
- Validate file extension, PDF signature, and a 10 MB API size limit.
- Store the original file locally and document metadata in PostgreSQL.
- Send the PDF to a Python/FastAPI service.
- Extract text from text-based PDFs with pypdf.
- Choose deterministic mock extraction or OpenAI-powered structured extraction.
- Constrain OpenAI responses with strict JSON Schema and handle missing fields as null.
- Persist and retrieve processing status and extracted results.
- Review document history, status, and extracted fields in the web interface.
- Run the stack locally with Docker Compose.

Scanned PDFs currently require OCR and are not supported. The OpenAI provider sends extracted document text to the configured OpenAI API account. Use synthetic or non-sensitive files only.

## Architecture

| Component | Responsibility | Technology |
|---|---|---|
| Web | Upload, document history, extraction review | React, TypeScript, Vite, Nginx |
| API | Upload validation, orchestration, metadata, persistence | ASP.NET Core / .NET 10 |
| AI service | PDF text extraction and provider-based structured extraction | Python 3.12, FastAPI, pypdf, OpenAI SDK |
| Database | Document metadata and extraction result | PostgreSQL 17 |
| File storage | Original PDFs | Docker named volume (local MVP) |

### Processing flow

1. The web app sends a multipart PDF to `POST /api/documents`.
2. The API validates the file, saves it, and creates a `Processing` record.
3. The API calls `POST /v1/process` on the Python service.
4. The Python service extracts text and invokes the configured extraction provider.
5. The provider returns structured fields constrained by a JSON Schema.
6. The API stores the response and marks the document `Completed` or `Failed`.
7. The web app displays the document status and extracted fields.

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

The web app uses Nginx to proxy `/api` requests to the API container, avoiding browser-side Docker DNS and a separate CORS configuration.

### Enable OpenAI extraction

The mock provider works out of the box and requires no API key. To enable OpenAI, create a local `.env` file in the repository root:

```dotenv
DOCUMENT_AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
```

Then rebuild/start the stack:

```bash
docker compose up --build
```

To use the deterministic mock again, set `DOCUMENT_AI_PROVIDER=mock` and restart the stack. The `.env` file is excluded from the Docker build context and Git.

The provider is selected only inside the Python service. The API key is never sent to the frontend.

### API examples

Upload through the UI, or use the API:

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
├── services/document-ai/        # Python/FastAPI + extraction providers
├── frontend/web/                # React + TypeScript application
├── docs/                        # Architecture and roadmap
├── tests/                       # Cross-component test guidance
├── .github/workflows/ci.yml     # Python tests, .NET and frontend builds
└── docker-compose.yml
```

## Current limitations and next steps

- OCR for scanned PDFs.
- Integration and end-to-end tests.
- Background processing, retries, and idempotency.
- Authentication and authorization.
- Local file storage; add an object-storage adapter and retention controls.
- Structured logs, metrics, tracing, and audit events.
- Production-grade secret management and security review.

## Security and privacy

This is a portfolio MVP intended for local development. Do not expose it publicly or upload real customer, employee, banking, or confidential documents. When OpenAI is enabled, extracted PDF text is sent to the configured OpenAI API account; review the applicable data handling and retention terms before use.

Authentication, authorization, malware scanning, robust retention/deletion controls, and production-grade secret management must be implemented before deployment beyond a trusted local environment.

Never commit API keys, credentials, or sensitive files. Use synthetic sample PDFs only.

## License

License to be defined before external distribution.
