from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pypdf.errors import PdfReadError

from app.extractor import extract_pdf_text, mock_extract_fields
from app.schemas import ExtractionResult

app = FastAPI(
    title="Document AI Service",
    version="0.1.0",
    description="PDF text extraction and structured field extraction for the portfolio MVP.",
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

    return ExtractionResult(
        document_id=document_id,
        provider="mock",
        document_type="invoice" if any(term in text.lower() for term in ("invoice", "fatura", "nota fiscal")) else "generic",
        fields=mock_extract_fields(text),
        text_length=len(text),
    )
