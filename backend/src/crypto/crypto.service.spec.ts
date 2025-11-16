// backend/src/crypto/crypto.service.spec.ts
import { Test } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { CryptoGateway } from './crypto.gateway';
import { ConfigService } from '@nestjs/config';

describe('CryptoService', () => {
  let service: CryptoService;
  let gateway: CryptoGateway;
  let mockWs: any;

  beforeEach(async () => {
    gateway = { emitToAll: jest.fn() } as any;

    const module = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: ConfigService, useValue: { get: () => 'test_key' } },
        { provide: CryptoGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    mockWs = (global as any).__MOCK_WS__; // ← Usa el mock global
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should initialize rates', () => {
    expect(Object.keys((service as any).rates)).toHaveLength(3);
  });

  it('should calculate hourly average', () => {
    const symbol = 'BINANCE:ETHUSDT';
    (service as any).rates[symbol].hourlyData = [100, 200, 150];
    service['calculateHourlyAverages']();
    expect((service as any).hourlyAverages[symbol]).toBeCloseTo(150);
  });

  it('should reconnect on close', () => {
    const spy = jest.spyOn(service as any, 'connectToFinnhub');
    const closeCb = mockWs.on.mock.calls.find(
      (c: any) => c[0] === 'close',
    )?.[1];
    expect(closeCb).toBeDefined();
    closeCb?.();
    jest.advanceTimersByTime(5000);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit update on trade', (done) => {
    service.subscribeToUpdates((update) => {
      expect(update.symbol).toBe('BINANCE:ETHUSDT');
      expect(update.current).toBe(2000);
      done();
    });

    const msgCb = mockWs.on.mock.calls.find(
      (c: any) => c[0] === 'message',
    )?.[1];
    expect(msgCb).toBeDefined();
    msgCb?.(
      JSON.stringify({
        type: 'trade',
        data: [{ s: 'BINANCE:ETHUSDT', p: 2000, t: Date.now() }],
      }),
    );
  });
});
