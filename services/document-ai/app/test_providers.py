import pytest

from app.providers import MockProvider, get_provider


def test_mock_provider_returns_invoice_fields():
    kind, fields = MockProvider().extract(
        "Supplier: ACME Ltd\nInvoice Number: INV-42\nTotal: R$ 99,90"
    )

    assert kind == "invoice"
    assert fields["invoice_number"] == "INV-42"
    assert fields["total"] == "99,90"
    assert fields["currency"] == "BRL"


def test_mock_is_the_default_provider(monkeypatch):
    monkeypatch.delenv("DOCUMENT_AI_PROVIDER", raising=False)
    assert get_provider().name == "mock"


def test_openai_provider_requires_api_key(monkeypatch):
    monkeypatch.setenv("DOCUMENT_AI_PROVIDER", "openai")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    with pytest.raises(ValueError, match="OPENAI_API_KEY is required"):
        get_provider()


def test_unknown_provider_is_rejected(monkeypatch):
    monkeypatch.setenv("DOCUMENT_AI_PROVIDER", "unknown")

    with pytest.raises(ValueError, match="Unsupported DOCUMENT_AI_PROVIDER"):
        get_provider()
