import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import WebSocket from 'ws';
import * as fs from 'fs';
import * as path from 'path';

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

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private ws: WebSocket | null = null;

  private rates: Record<string, RateData> = {};
  private hourlyAverages: Record<string, number> = {};
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private updateCallback: UpdateCallback | null = null;

  private readonly symbols = [
    'BINANCE:ETHUSDC',
    'BINANCE:ETHUSDT',
    'BINANCE:ETHBTC',
  ];

  private readonly avgPath: string;

  constructor() {
    this.avgPath = path.join(__dirname, '../../data/hourly-avgs.json');
    this.initializeRates();
    this.loadPersistedAverages();
    this.connectToFinnhub();
  }

  getInitialData(): CryptoUpdate[] {
    return Object.values(this.rates).map((rate) => ({
      symbol: rate.symbol,
      current: rate.current,
      timestamp: rate.timestamp,
      hourlyAverage: this.hourlyAverages[rate.symbol] ?? null,
    }));
  }

  subscribeToUpdates(callback: UpdateCallback) {
    this.updateCallback = callback;
  }

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

  private loadPersistedAverages() {
    const dataDir = path.dirname(this.avgPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      return;
    }
    if (fs.existsSync(this.avgPath)) {
      try {
        const loaded = JSON.parse(fs.readFileSync(this.avgPath, 'utf8'));
        this.hourlyAverages = { ...this.hourlyAverages, ...loaded };
      } catch (err) {
        this.logger.error('Error loading avgs', err);
      }
    }
  }

  private connectToFinnhub() {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      this.logger.error('FINNHUB_API_KEY not set');
      this.scheduleReconnect();
      return;
    }

    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

    this.ws.on('open', () => {
      this.logger.log('Connected to Finnhub WS');
      this.symbols.forEach((symbol) => {
        this.ws!.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'trade' && Array.isArray(msg.data)) {
          msg.data.forEach((trade) => {
            const symbol = trade.s;
            if (this.rates[symbol]) {
              const price = trade.p;
              const ts = new Date(trade.t).toISOString();

              this.rates[symbol].current = price;
              this.rates[symbol].timestamp = ts;
              this.rates[symbol].hourlyData.push(price);

              this.emitUpdate({ symbol, current: price, timestamp: ts });
            }
          });
        }
      } catch (err) {
        this.logger.error('Message parse error', err);
      }
    });

    this.ws.on('close', () => {
      this.logger.warn('Finnhub disconnected');
      this.scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      this.logger.error('WS error', err.message);
      this.scheduleReconnect();
    });
  }

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

  @Cron(CronExpression.EVERY_HOUR)
  calculateHourlyAverages() {
    this.symbols.forEach((symbol) => {
      const data = this.rates[symbol].hourlyData;
      if (data.length > 0) {
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        this.hourlyAverages[symbol] = avg;
        this.rates[symbol].hourlyData = [];
        this.logger.log(`Hourly avg ${symbol}: ${avg.toFixed(2)}`);
      }
    });
    try {
      fs.writeFileSync(this.avgPath, JSON.stringify(this.hourlyAverages));
    } catch (err) {
      this.logger.error('Persist avgs error', err);
    }
  }

  // Reconnection Logic
  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.logger.log('Reconnecting to Finnhub...');
      this.connectToFinnhub();
      this.reconnectTimeout = null;
    }, 5000);
  }
}
