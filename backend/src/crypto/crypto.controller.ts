import { Controller, Get } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Controller('health')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  // Health Endpoint
  @Get()
  getHealth() {
    const ws = (this.cryptoService as any).ws;
    return {
      finnhub: ws?.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      symbols: Object.keys((this.cryptoService as any).rates),
      hourlyAverages: (this.cryptoService as any).hourlyAverages,
    };
  }
}
