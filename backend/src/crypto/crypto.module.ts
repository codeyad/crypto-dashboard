import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoGateway } from './crypto.gateway';

@Module({
  providers: [CryptoService, CryptoGateway]
})
export class CryptoModule {}
