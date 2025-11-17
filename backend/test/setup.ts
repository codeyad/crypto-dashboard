// backend/test/setup.ts
process.env.NODE_ENV = 'test';
process.env.FINNHUB_API_KEY = 'test_key_123';

// Mock GLOBAL de WebSocket
const mockWsInstance = {
  on: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
};

jest.mock('ws', () => {
  return jest.fn(() => mockWsInstance);
});

(global as any).__MOCK_WS__ = mockWsInstance;
