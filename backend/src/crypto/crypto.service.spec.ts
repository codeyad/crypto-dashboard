import { Test } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { CryptoGateway } from './crypto.gateway';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

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
    mockWs = (global as any).__MOCK_WS__;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should persist hourly averages to file', () => {
    const symbol = 'BINANCE:ETHUSDT';
    (service as any).rates[symbol].hourlyData = [100, 200];
    service['calculateHourlyAverages']();
    const avgPath = path.join(__dirname, '../../data/hourly-avgs.json');
    expect(fs.existsSync(avgPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(avgPath, 'utf8'));
    expect(data[symbol]).toBeCloseTo(150);
    // Cleanup
    if (fs.existsSync(avgPath)) fs.unlinkSync(avgPath);
  });

  it('should load persisted averages on init', () => {
    const avgPath = (service as any).avgPath;
    const testData = { 'BINANCE:ETHUSDT': 150 };
    fs.writeFileSync(avgPath, JSON.stringify(testData));
    (service as any).hourlyAverages = {};
    service['loadPersistedAverages']();
    expect((service as any).hourlyAverages['BINANCE:ETHUSDT']).toBe(150);
    // Cleanup
    fs.unlinkSync(avgPath);
  });
});
