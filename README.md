Real-Time Crypto Dashboard
Senior Fullstack Engineer - Take-Home Exercise
A real-time dashboard displaying live exchange rates for ETH/USDC, ETH/USDT, and ETH/BTC from Finnhub's WebSocket API, with live charts, hourly averages (persisted to JSON), and connection status.
Dashboard Screenshot

Tech Stack

LayerTechnologiesBackendNestJS + TypeScript + Socket.IO + Finnhub WS + ScheduleModuleFrontendNext.js 14 (App Router) + TypeScript + Chart.js + Tailwind CSS + Socket.IO ClientReal-TimeSocket.IO (WS with fallbacks) + Throttling (1s/symbol)PersistenceJSON file (/backend/data/hourly-avgs.json) – scalable to DBTestingJest (backend unit/E2E) + React Testing Library (frontend)

Features

Real-time trade updates from Finnhub WS for 3 pairs.
Hourly averages via Cron, persisted/reloaded from JSON.
Live charts with timestamps (last 60 points).
States: Connecting/Live/Offline + error banner/retry.
Responsive UI, loading spinners, change % vs avg.
Health endpoint: GET /health (status, uptime, avgs).
Error handling: Logging, validation, reconnect (5s delay).
Tests: 80%+ coverage (WS mocks, async states).

Decisions:

Flow: Finnhub trades → Service (buffer/calc) → Gateway (throttle emit) → Hook (history push).
Socket.IO for bi-dir + fallback (vs SSE).
Symbols: Per detailed reqs (ETH pairs); 'BINANCE:SYMBOL' format.
Avg init 0 until first hour; low-volume pairs show loading.
AI: Scaffolding only; logic/tests manual.

Setup & Run (Consistent Across Env)
Prerequisites

Node.js 18+.
Finnhub API Key (free): finnhub.io/dashboard.

Environment
Root .env:
FINNHUB_API_KEY=your_key
PORT=3001 # Backend
Local Run

Backend: cd backend
npm install
npm run start:dev # Port 3001Logs: "Connected to Finnhub WS".
Health: curl localhost:3001/health.
Frontend: cd frontend
npm install
npm run dev # Port 3000, connects to backend
Tests: npm run test # Backend/frontend (Jest/RTL)
npm run test -- --coverage # >80%

Docker (Recommended for Consistency)
Uses multi-stage builds for prod-like env (Node 20-alpine, volumes for data/env).

Build/Run: docker-compose up --build # Backend:3001, Frontend:3000
Env: Root .env auto-loaded.
Volumes: Persists /data for avgs.
Stop: docker-compose down -v (clean data if needed).
Verify:
docker logs frontend-1 (frontend logs).
docker logs backend-1 (WS connect).
Dashboard: localhost:3000.

Project Structure
crypto-dashboard/
├── backend/ # NestJS API
│ ├── src/crypto/ # Service, Gateway, Controller, Module
│ ├── test/ # Specs, e2e
│ └── Dockerfile # Multi-stage build
├── frontend/ # Next.js App
│ ├── src/app/ # page.tsx, layout.tsx, globals.css
│ ├── components/ # CryptoCard.tsx
│ ├── hooks/ # useCryptoData.ts
│ └── Dockerfile # Optimized Next build
├── docker-compose.yml # Full stack
└── README.md

Troubleshooting

No data: Check API key + /health. Free tier limits trades (ETH/BTC sparse).
Avg 0: First hour needed; persists across restarts.
Charts empty: Wait trades (~1-5s); mock in tests.
Styles: Tailwind v3; npm run dev after changes.

Ready for review/demo. Questions? Let's discuss scaling (e.g., Redis for avgs).
License
MIT – Feel free to adapt.
