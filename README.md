# Accenture Global Office Interactive Map (MVP)

This repository contains a standalone web application implementing the MVP for the Accenture Global Office Interactive Map:

- Frontend: React + Vite + TypeScript + Mapbox GL JS
- Backend: Node + Express with file-backed mock data

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Set environment variables

- Frontend requires `VITE_MAPBOX_TOKEN` in `apps/frontend/.env`:

```bash
# apps/frontend/.env
VITE_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN
```

- Backend (optional) can override defaults in `apps/backend/.env` (not required for local):

```bash
# apps/backend/.env
PORT=5175
ALLOW_ORIGIN=http://localhost:5173
```

3) Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5175

## Features (Phase 1 MVP)

- World map (globe projection) with primary office pins
- Purple pins with hover and zoom on click
- Sliding office info panel with quick stats
- Basic search (by office name, city, or country)
- REST endpoints:
  - GET /api/regions
  - GET /api/offices
  - GET /api/offices/:id
  - POST/PUT/DELETE /api/offices (demo-only admin-lite)

## Project Structure

```
apps/
  backend/
    src/index.js
    data/*.json
  frontend/
    src/
      components/*
      store/*
      App.tsx
      main.tsx
    index.html
```

## Notes

- Mapbox styles require a token. Create one at https://account.mapbox.com and paste into `VITE_MAPBOX_TOKEN`.
- The admin endpoints persist to JSON files under `apps/backend/data`. This is for demo/MVP only.
- The frontend proxies `/api` to the backend during `vite` dev via `vite.config.ts`.

## Foscam Live Feed Integration

The application supports live camera feeds from Foscam cameras. To configure:

1. **Add camera URL to office data**: Include a `cameraUrl` field in the office JSON object
2. **Supported formats**:
   - HTTP stream: `http://username:password@ip:port/video.cgi`
   - RTSP stream: `rtsp://username:password@ip:port/video.h264` (requires backend conversion to HLS/WebRTC)
3. **Security**: For production, proxy camera streams through your backend to avoid exposing credentials
4. **Usage**: Click the "📹 View Live Feed" button in the office panel to view the camera feed

**Note**: RTSP streams require server-side conversion to HLS or WebRTC for browser compatibility. HTTP streams work directly.

## Next Phases (scaffolding-ready)

- Secondary pins, galleries, POCs, clients, citizenship timelines
- Advanced filters and accessibility polish
- AI chatbot integration via `/api/chat` and UI button
- Headless CMS integration (Contentful/Strapi/Sanity) replacing JSON files
