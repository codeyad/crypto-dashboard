// backend/src/crypto/crypto.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';

describe('CryptoController', () => {
  let controller: CryptoController;
  let mockService: any; // ← FIX: 'any' para mock private props (ws, rates, avgs)

  beforeEach(async () => {
    mockService = {
      ws: { readyState: 1 }, // Mock WS open (any permite private)
      rates: {
        // 3 symbols
        'BINANCE:ETHUSDC': {},
        'BINANCE:ETHUSDT': {},
        'BINANCE:ETHBTC': {},
      },
      hourlyAverages: {
        'BINANCE:ETHUSDC': 3100,
        'BINANCE:ETHUSDT': 3000,
        'BINANCE:ETHBTC': 0.05,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [{ provide: CryptoService, useValue: mockService }],
    }).compile();

    controller = module.get<CryptoController>(CryptoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health info', () => {
    const result = controller.getHealth();
    expect(result).toHaveProperty('finnhub', 'connected');
    expect(result).toHaveProperty('uptime');
    expect(result.symbols).toHaveLength(3);
    expect(result.hourlyAverages).toHaveProperty('BINANCE:ETHUSDT', 3000);
  });
});
