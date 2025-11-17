# Crypto Price Tracker (NestJS + WebSockets + Cron)

This project streams real‑time cryptocurrency data from Finnhub using WebSockets, processes it inside a NestJS service, and broadcasts updated prices through a custom WebSocket Gateway. It also includes scheduled tasks (cron jobs) powered by @nestjs/schedule to monitor and maintain the WebSocket connection.

---

## 🚀 Tech Stack

### Backend (NestJS)

- NestJS Framework
- WebSockets (ws)
- Socket Gateway for client updates
- ScheduleModule for cron jobs
- TypeScript

---

## 📂 Recommended Folder Structure

```
src/crypto/
 ├─ crypto.gateway.ts
 ├─ crypto.service.ts
 └─ crypto.module.ts
```

---

## 📡 Data Flow

1. `CryptoService` opens a WebSocket connection to Finnhub.
2. The service subscribes to the configured symbol (e.g., `BINANCE:ETHUSDT`).
3. Finnhub emits real‑time trade data.
4. `CryptoGateway` pushes processed updates to connected clients.
5. Optional cron jobs can monitor the WebSocket connection’s health and trigger reconnection.

---

## 🔧 Environment Variables

Create a `.env` file:

```
FINNHUB_API_KEY=YOUR_API_KEY
FINNHUB_SYMBOL=BINANCE:ETHUSDT
```

---

## ▶️ Available Scripts

Install dependencies:

```
npm install
```

Development:

```
npm run start:dev
```

Build:

```
npm run build
```

Production:

```
npm run start:prod
```

---

## 🔌 WebSocket Client Example

```js
const socket = new WebSocket("ws://localhost:3000/crypto");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Live price:", data);
};
```

---

## 🧪 Quick Browser Test

Open console (F12) and run:

```js
let s = new WebSocket("ws://localhost:3000/crypto");
s.onmessage = (e) => console.log("Tick:", e.data);
```

---

## 🛡 Notes

- Your existing `AppModule` setup is correct — no changes needed.
- The service automatically reconnects when Finnhub disconnects.
- All live updates flow through `CryptoService`.

---
