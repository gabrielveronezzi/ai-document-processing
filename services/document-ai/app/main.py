from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from openai import OpenAIError
from pypdf.errors import PdfReadError

from app.extractor import extract_pdf_text
from app.providers import get_provider
from app.schemas import ExtractionResult

app = FastAPI(
    title="Document AI Service",
    version="0.2.0",
    description="PDF text extraction and provider-based structured field extraction.",
)


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/v1/process", response_model=ExtractionResult)
async def process_document(
    document_id: str = Form(...),
    file: UploadFile = File(...),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Only application/pdf is supported.")

    try:
        text = extract_pdf_text(file.file)
    except (PdfReadError, ValueError):
        raise HTTPException(status_code=422, detail="The uploaded file is not a readable PDF.")

    if not text:
        raise HTTPException(status_code=422, detail="No extractable text was found in the PDF.")

    try:
        provider = get_provider()
        document_type, fields = provider.extract(text)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except (OpenAIError, KeyError, TypeError) as exc:
        # Avoid returning provider payloads or document text to the caller.
        raise HTTPException(status_code=502, detail="The configured AI provider could not process this document.") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Document extraction failed.") from exc

    return ExtractionResult(
        document_id=document_id,
        provider=provider.name,
        document_type=document_type,
        fields=fields,
        text_length=len(text),
    )
