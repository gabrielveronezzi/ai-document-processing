# Tests

This directory is reserved for cross-component integration and end-to-end tests.

Component-specific tests should live alongside their respective projects:
- .NET unit and integration tests: under `backend/`.
- Python tests: under `services/document-ai/`.
- Frontend tests: under `frontend/web/`.

Use synthetic fixtures only. Never commit real customer, employee, or confidential documents.
