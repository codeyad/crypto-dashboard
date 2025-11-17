// src/hooks/useCryptoData.ts
import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface RateData {
  symbol: string;
  current: number | null;
  timestamp: string | null;
  hourlyAverage: number | null;
}

interface ChartPoint {
  time: number;
  price: number;
}

interface CryptoData {
  current: number | null;
  timestamp: string | null;
  hourlyAverage: number | null;
  history: ChartPoint[];
}

export const useCryptoData = () => {
  const [data, setData] = useState<Record<string, CryptoData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true); // ← NUEVO
  const [error, setError] = useState<string | null>(null); // ← NUEVO
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null); // ← NUEVO: Clear error
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);
    });
    socket.on('connect_error', (err: Error) => { // ← NUEVO
      setError('Backend unavailable, retrying...');
      setIsConnected(false);
      setIsConnecting(false);
    });

    socket.on('initialData', (initial: RateData[]) => {
      const init: Record<string, CryptoData> = {};
      initial.forEach(item => {
        init[item.symbol] = {
          current: item.current,
          timestamp: item.timestamp,
          hourlyAverage: item.hourlyAverage,
          history: [],
        };
      });
      setData(init);
    });

    socket.on('rateUpdate', (update: RateData) => {
      setData(prev => {
        const prevItem = prev[update.symbol] || { history: [] as ChartPoint[] };
        const newHistory = [
          ...prevItem.history,
          { time: new Date(update.timestamp || Date.now()).getTime(), price: update.current! }
        ].slice(-60); // ← MEJORADO: Siempre push con real timestamp, slice para perf
        return {
          ...prev,
          [update.symbol]: {
            ...update,
            history: newHistory,
          },
        };
      });
    });

    // ← REMOVIDO: Interval simulado (ahora usa real updates)

    return () => {
      socket.disconnect();
    };
  }, []);

  return { data, isConnected, isConnecting, error }; // ← NUEVO: Return extras
};