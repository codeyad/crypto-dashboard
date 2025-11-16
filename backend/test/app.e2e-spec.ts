// backend/test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { io } from 'socket.io-client';

describe('App (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let port: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    await app.listen(0); // ← ESCUCHA EN PUERTO ALEATORIO
    server = app.getHttpServer();
    port = server.address().port;
  }, 10000);

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(server).get('/').expect(404);
  });

  it('WebSocket connects and gets initial data', (done) => {
    const client = io(`http://localhost:${port}`, { reconnection: false });

    client.on('connect', () => {
      expect(client.connected).toBe(true);
    });

    client.on('initialData', (data) => {
      expect(data).toHaveLength(3);
      client.disconnect();
      done();
    });

    client.on('connect_error', (err) => {
      client.disconnect();
      done(err);
    });
  });
});
