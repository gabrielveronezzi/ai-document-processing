import re
from pypdf import PdfReader


def extract_pdf_text(file_object) -> str:
    reader = PdfReader(file_object)
    return "\n".join(page.extract_text() or "" for page in reader.pages).strip()


def mock_extract_fields(text: str) -> dict[str, str | None]:
    """Deterministic demo extractor. Replace with an LLM provider adapter later."""
    patterns = {
        "invoice_number": r"(?i)(?:invoice|fatura|nota fiscal)\s*(?:number|nº|no\.?|#)?\s*[:\-]?\s*([A-Z0-9./-]{3,})",
        "issue_date": r"(?i)(?:issue date|data de emiss[aã]o|emiss[aã]o)\s*[:\-]?\s*(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}-\d{2}-\d{2})",
        "total": r"(?i)(?:total|valor total|amount due)\s*[:\-]?\s*(?:R\$\s*)?([\d.,]+)",
        "supplier": r"(?i)(?:supplier|fornecedor|empresa)\s*[:\-]?\s*([^\n]{2,100})",
    }
    return {
        field: (match.group(1).strip() if (match := re.search(pattern, text)) else None)
        for field, pattern in patterns.items()
    }
