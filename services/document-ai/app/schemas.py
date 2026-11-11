from pydantic import BaseModel, Field


class ExtractionResult(BaseModel):
    document_id: str
    provider: str = "mock"
    document_type: str = "unknown"
    fields: dict[str, str | None] = Field(default_factory=dict)
    text_length: int
