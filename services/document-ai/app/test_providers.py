from app.providers import MockProvider


def test_mock_provider_returns_invoice_fields():
    kind, fields = MockProvider().extract(
        "Supplier: ACME Ltd\nInvoice Number: INV-42\nTotal: R$ 99,90"
    )

    assert kind == "invoice"
    assert fields["invoice_number"] == "INV-42"
    assert fields["total"] == "99,90"
    assert fields["currency"] == "BRL"
