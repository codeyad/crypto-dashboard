import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CryptoService } from './crypto.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class CryptoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(CryptoGateway.name);
  private lastEmits: Record<string, number> = {};

  constructor(private cryptoService: CryptoService) {
    this.cryptoService.subscribeToUpdates((data) => {
      const now = Date.now();
      if (
        !this.lastEmits[data.symbol] ||
        now - this.lastEmits[data.symbol] > 1000
      ) {
        this.server.emit('rateUpdate', data);
        this.lastEmits[data.symbol] = now;
      }
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
    // Handled on connect
  }
}
