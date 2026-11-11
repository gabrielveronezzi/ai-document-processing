# Web Application

React + TypeScript interface for uploading PDF documents, tracking processing status, and reviewing extracted fields.

## Features

- Drag-and-drop or browse to upload PDF files (maximum 10 MB).
- Document history with file size, upload date, and processing status.
- Detail panel showing the structured fields returned by the extraction service.
- Responsive layout for desktop and mobile.
- API calls use relative paths; Nginx proxies requests to the API in Docker Compose, avoiding browser-side container DNS and CORS configuration.

## Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

## Run the frontend independently

Requires Node.js 22+.

```bash
cd frontend/web
npm install
npm run dev
```

The Vite development server proxies `/api` and `/health` to `http://localhost:8080`. Start the API separately.

## Build

```bash
npm run build
```

The frontend contains no LLM credentials. It is a local-development portfolio MVP and should not be exposed publicly until authentication, authorization, and production security controls are implemented.