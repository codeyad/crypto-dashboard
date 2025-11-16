// backend/src/crypto/crypto.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import WebSocket from 'ws';

// === INTERFACES ===
export interface RateData {
  symbol: string;
  current: number | null;
  timestamp: string | null;
  hourlyData: number[];
}

export interface CryptoUpdate {
  symbol: string;
  current: number | null;
  timestamp: string | null;
  hourlyAverage: number | null;
}

type UpdateCallback = (update: CryptoUpdate) => void;

// === SERVICIO ===
@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private ws: WebSocket | null = null;

  // === ESTADO ===
  private rates: Record<string, RateData> = {};
  private hourlyAverages: Record<string, number> = {};
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private updateCallback: UpdateCallback | null = null;

  private readonly symbols = [
    'BINANCE:ETHUSDC',
    'BINANCE:ETHUSDT',
    'BINANCE:ETHBTC',
  ];

  constructor() {
    this.initializeRates();
    this.connectToFinnhub();
  }

  // === MÉTODOS PÚBLICOS ===
  getInitialData(): CryptoUpdate[] {
    return Object.values(this.rates).map((rate: RateData) => ({
      symbol: rate.symbol,
      current: rate.current,
      timestamp: rate.timestamp,
      hourlyAverage: this.hourlyAverages[rate.symbol] ?? null,
    }));
  }

  subscribeToUpdates(callback: UpdateCallback) {
    this.updateCallback = callback;
  }

  // === INICIALIZACIÓN ===
  private initializeRates() {
    this.symbols.forEach((symbol) => {
      this.rates[symbol] = {
        symbol,
        current: null,
        timestamp: null,
        hourlyData: [],
      };
      this.hourlyAverages[symbol] = 0;
    });
  }

  // === CONEXIÓN FINNHUB ===
  private connectToFinnhub() {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      this.logger.error('FINNHUB_API_KEY no está definida');
      this.scheduleReconnect();
      return;
    }

    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

    this.ws.on('open', () => {
      this.logger.log('Conectado a Finnhub WebSocket');
      this.symbols.forEach((symbol) => {
        this.ws!.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'trade' && Array.isArray(msg.data)) {
          msg.data.forEach((trade: any) => {
            const symbol = trade.s;
            if (this.rates[symbol]) {
              const price = trade.p;
              const timestamp = new Date(trade.t).toISOString();

              this.rates[symbol].current = price;
              this.rates[symbol].timestamp = timestamp;
              this.rates[symbol].hourlyData.push(price);

              this.emitUpdate({ symbol, current: price, timestamp });
            }
          });
        }
      } catch (err) {
        this.logger.error('Error procesando mensaje:', err);
      }
    });

    this.ws.on('close', () => {
      this.logger.warn('Desconectado de Finnhub');
      this.scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      this.logger.error('Error WebSocket:', err.message);
      this.scheduleReconnect();
    });
  }

  // === EMITIR ACTUALIZACIÓN ===
  private emitUpdate(update: {
    symbol: string;
    current: number;
    timestamp: string;
  }) {
    if (this.updateCallback) {
      this.updateCallback({
        symbol: update.symbol,
        current: update.current,
        timestamp: update.timestamp,
        hourlyAverage: this.hourlyAverages[update.symbol] ?? null,
      });
    }
  }

  // === PROMEDIO HORARIO ===
  @Cron(CronExpression.EVERY_HOUR)
  calculateHourlyAverages() {
    this.symbols.forEach((symbol) => {
      const data = this.rates[symbol].hourlyData;
      if (data.length > 0) {
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        this.hourlyAverages[symbol] = avg;
        this.rates[symbol].hourlyData = [];
        this.logger.log(`Promedio horario ${symbol}: ${avg.toFixed(2)}`);
      }
    });
  }

  // === RECONEXIÓN ===
  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.logger.log('Reconectando a Finnhub...');
      this.connectToFinnhub();
      this.reconnectTimeout = null;
    }, 5000);
  }
}
