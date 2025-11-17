"use client";

import { Zap, Wifi, WifiOff, Loader2 } from "lucide-react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { CryptoCard } from "@/components/CryptoCard";

const PAIRS = [
  { symbol: "BINANCE:ETHUSDC", label: "ETH/USDC" },
  { symbol: "BINANCE:ETHUSDT", label: "ETH/USDT" },
  { symbol: "BINANCE:ETHBTC", label: "ETH/BTC" },
];

export default function Dashboard() {
  const { data, isConnected, isConnecting, error } = useCryptoData();

  const handleRetry = () => {
    if (error) {
      const socket = (window as any).__SOCKET__;
      socket?.connect();
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>
          <Zap size={32} color="#6366f1" />
          Crypto Dashboard
        </h1>
        <div
          className={`status ${
            isConnecting ? "connecting" : isConnected ? "live" : "offline"
          }`}
        >
          {isConnecting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isConnected ? (
            <Wifi size={20} />
          ) : (
            <WifiOff size={20} />
          )}
          {isConnecting ? "Connecting..." : isConnected ? "Live" : "Offline"}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PAIRS.map(({ symbol, label }) => {
          const cryptoItem = data[symbol];
          return (
            <CryptoCard
              key={symbol}
              symbol={symbol}
              label={label}
              current={cryptoItem?.current ?? null}
              timestamp={cryptoItem?.timestamp ?? null}
              hourlyAverage={cryptoItem?.hourlyAverage ?? null}
              history={cryptoItem?.history ?? []}
            />
          );
        })}
      </div>
    </div>
  );
}
