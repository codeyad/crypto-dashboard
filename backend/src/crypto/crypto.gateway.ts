// backend/src/crypto/crypto.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CryptoService, CryptoUpdate } from './crypto.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class CryptoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(CryptoGateway.name);

  constructor(private cryptoService: CryptoService) {
    this.cryptoService.subscribeToUpdates((data: CryptoUpdate) => {
      this.server.emit('rateUpdate', data);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('initialData', this.cryptoService.getInitialData());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToRates')
  handleSubscribe() {
    // Ya se maneja en conexión
  }
}
