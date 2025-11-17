import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoGateway } from './crypto.gateway';
import { CryptoController } from './crypto.controller';

@Module({
  providers: [CryptoService, CryptoGateway],
  controllers: [CryptoController],
})
export class CryptoModule {}
