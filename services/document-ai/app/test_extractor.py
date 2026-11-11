from app.extractor import mock_extract_fields


def test_extracts_invoice_fields_from_sample_text():
    text = """
    Supplier: ACME Supplies Ltd
    Invoice Number: INV-2026-0042
    Issue Date: 11/11/2026
    Total: R$ 1.234,56
    """
    fields = mock_extract_fields(text)

    assert fields["supplier"] == "ACME Supplies Ltd"
    assert fields["invoice_number"] == "INV-2026-0042"
    assert fields["issue_date"] == "11/11/2026"
    assert fields["total"] == "1.234,56"


def test_missing_fields_are_none():
    fields = mock_extract_fields("A document without invoice metadata.")

    assert fields["invoice_number"] is None
    assert fields["total"] is None
