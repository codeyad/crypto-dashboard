# Real-Time Crypto Dashboard

**Senior Fullstack Engineer - Take-Home Exercise**

Live dashboard with real-time **ETH/USDC**, **ETH/USDT**, and **ETH/BTC** rates from **Finnhub**, hourly averages, live charts, and connection status.

---

## Tech Stack

| Layer     | Tech                                                           |
| --------- | -------------------------------------------------------------- |
| Backend   | **NestJS** + TypeScript + Socket.IO + Finnhub WebSocket        |
| Frontend  | **Next.js 14** (App Router) + TypeScript + Tailwind + Recharts |
| Real-time | **Socket.IO** (WebSocket + fallback)                           |

---

## Features

- Real-time price streaming via Finnhub WebSocket
- **Hourly average** calculated and updated every hour
- **Auto-reconnect** on Finnhub or Socket.IO failure
- Live charts with last 50 data points
- Connection status indicator
- Responsive, clean UI with Tailwind
- Type-safe with full TypeScript interfaces
- Unit & integration tests

---

## Project Structure

crypto-dashboard/
├── backend/ # NestJS API
│ ├── src/crypto/
│ │ ├── crypto.service.ts
│ │ └── crypto.gateway.ts
│ └── .env.example
├── frontend/ # Next.js App
│ ├── app/
│ │ ├── page.tsx
│ │ └── components/
│ ├── lib/
│ │ └── socket.ts
│ └── tests/
└── README.md

---

## Setup & Run

### 1. Get Finnhub API Key

1. Go to [https://finnhub.io/dashboard](https://finnhub.io/dashboard)
2. Sign up (free tier)
3. Copy your **API Key**

---

### 2. Backend (NestJS)

```bash
cd backend
cp .env.example .env
# Edit .env
# FINNHUB_API_KEY=your_key_here

npm install
npm run start:dev
```
