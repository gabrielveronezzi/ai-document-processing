# Document AI Service

Python + FastAPI service for PDF text extraction and structured field extraction through interchangeable providers.

## Providers

- `mock` (default): deterministic local extraction for tests and development. No credentials required.
- `openai`: uses the OpenAI Chat Completions API with strict JSON Schema output. The default model is `gpt-4o-mini`.

The provider is selected with `DOCUMENT_AI_PROVIDER`. Provider credentials are read only by this service and must never be exposed to the browser or committed to source control.

## Configure OpenAI

At the repository root, create a local `.env` file (it is ignored by Git):

```dotenv
DOCUMENT_AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
```

Then rebuild and start the stack:

```bash
docker compose up --build
```

To return to deterministic local mode, set `DOCUMENT_AI_PROVIDER=mock` and restart the service.

## Extraction behavior and safeguards

- The service extracts text from text-based PDFs using pypdf; scanned PDFs need OCR and are not supported yet.
- The OpenAI provider receives at most 40,000 characters from the extracted document.
- Structured output is constrained by a strict JSON Schema.
- Missing or uncertain values should be returned as null; the model is instructed not to invent values.
- PDF text is treated as untrusted input. Instructions embedded in a document must not be followed.
- Provider errors are returned as generic service errors; raw provider responses and document text are not returned to the caller.

The extracted content is sent to the configured provider for processing. Use synthetic or non-sensitive sample documents only, and review the provider's current data handling and retention terms before using any real documents.

## Tests

```bash
python -m pip install -r requirements.txt pytest
python -m pytest -q
```
