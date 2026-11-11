# AI Document Processing

A modular, AI-powered document processing platform that extracts structured information from PDF files, validates the results, and makes them available through an API and a web interface.

> **Status:** Initial architecture and project scaffold. The implementation will be delivered incrementally, starting with a working end-to-end MVP.

## Goals

- Upload PDF documents through a web application.
- Extract text and relevant information from documents.
- Use an interchangeable LLM provider to produce structured JSON.
- Validate extracted data before persisting it.
- Track processing status and provide a reviewable result.
- Keep the system modular, testable, observable, and easy to run locally.

## Architecture

The solution is organized into three main application components:

| Component | Responsibility | Initial technology |
|---|---|---|
| Web frontend | Upload documents and review extracted data | React + TypeScript |
| API | Upload orchestration, metadata, persistence, and application endpoints | ASP.NET Core Web API (.NET) |
| AI processing service | Text extraction, LLM orchestration, and structured output validation | Python + FastAPI |
| Database | Document metadata, processing status, and extracted results | PostgreSQL |
| File storage | Original PDF files | Local storage for development; object storage adapter later |

### Processing flow

1. A user uploads a PDF through the web application.
2. The API validates the request, stores the file, and creates a document record.
3. The API sends the document to the AI processing service.
4. The AI service extracts text, invokes the configured LLM provider, and validates the structured response.
5. The API stores the result and updates the processing status.
6. The frontend displays the extracted fields for review.

See [the architecture notes](docs/architecture.md) for boundaries, data flow, and design decisions.

## Repository structure

```text
.
├── backend/
│   └── api/                 # ASP.NET Core API
├── services/
│   └── document-ai/         # Python/FastAPI processing service
├── frontend/
│   └── web/                 # React + TypeScript application
├── docs/
│   ├── architecture.md
│   └── roadmap.md
├── tests/
│   └── README.md
├── .github/
│   └── workflows/
├── .editorconfig
├── .gitignore
└── README.md
```

## Getting started

The repository currently contains the architecture and initial scaffold. Runtime instructions will be added with the first executable vertical slice.

### Planned local development prerequisites

- .NET SDK (current LTS)
- Python 3.12+
- Node.js LTS
- Docker Desktop / Docker Engine
- An LLM API key (only required when using a hosted provider)

Never commit API keys, credentials, real customer documents, or sensitive data. Use synthetic documents and environment variables for local development.

## Engineering principles

- **Provider independence:** isolate LLM-specific code behind an interface.
- **Explicit contracts:** use versionable request/response schemas between services.
- **Validation first:** treat model output as untrusted input and validate it before persistence.
- **Privacy by design:** minimize stored document content and avoid logging sensitive data.
- **Testability:** unit-test business rules and validate service contracts.
- **Incremental delivery:** start with a synchronous MVP; introduce queues, authentication, and advanced observability when justified.

## Roadmap

1. [x] Define system boundaries and initial architecture.
2. [x] Establish repository structure and engineering conventions.
3. [ ] Implement PDF upload and document metadata in the API.
4. [ ] Implement text extraction and structured-output pipeline in Python.
5. [ ] Persist results in PostgreSQL and expose processing status.
6. [ ] Build the React upload and review experience.
7. [ ] Add integration tests and CI checks.
8. [ ] Add asynchronous processing, authentication, and observability.

## License

License to be defined before external distribution.
