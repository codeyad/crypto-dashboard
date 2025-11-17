// frontend/src/app/page.test.tsx
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom"; // Para toBeInTheDocument
import Dashboard from "./page";
import { io } from "socket.io-client";

// Mock Chart.js para canvas (evita "getContext" error)
jest.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="mock-chart" />, // Div simple en tests
}));

// Mock socket.io
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  connect: jest.fn(),
};
jest.mock("socket.io-client", () => jest.fn(() => mockSocket));

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__SOCKET__ = mockSocket; // Para retry
  });

  // TEST 1 (FIX: Simula connect + initialData para labels visibles)
  it("renders 3 crypto cards", async () => {
    render(<Dashboard />);
    // Simula connect (sale de connecting)
    await act(async () => {
      const connectCb = mockSocket.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      if (connectCb) connectCb();
    });
    // Simula initialData (popula cards, muestra labels)
    await act(async () => {
      const initialCb = mockSocket.on.mock.calls.find(
        (call) => call[0] === "initialData"
      )?.[1];
      if (initialCb) {
        initialCb([
          {
            symbol: "BINANCE:ETHUSDC",
            current: 3170,
            timestamp: "2025-11-16T00:00:00Z",
            hourlyAverage: 3160,
          },
          {
            symbol: "BINANCE:ETHUSDT",
            current: 3172,
            timestamp: "2025-11-16T00:00:00Z",
            hourlyAverage: 3160,
          },
          {
            symbol: "BINANCE:ETHBTC",
            current: 0.05,
            timestamp: "2025-11-16T00:00:00Z",
            hourlyAverage: 0.04,
          },
        ]);
      }
    });
    // Ahora labels visibles post-loading
    await waitFor(
      () => {
        expect(screen.getByText("ETH/USDC")).toBeInTheDocument();
        expect(screen.getByText("ETH/USDT")).toBeInTheDocument();
        expect(screen.getByText("ETH/BTC")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  // TEST 2 (ok, pero con act full)
  it("shows connection status", async () => {
    render(<Dashboard />);
    await act(async () => {
      const connectCb = mockSocket.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      if (connectCb) connectCb();
    });
    await waitFor(() =>
      expect(screen.getByText(/Live|Offline/i)).toBeInTheDocument()
    );
  });

  // TEST 3 (ok)
  it("displays current price when data arrives", async () => {
    render(<Dashboard />);

    await act(async () => {
      const connectCb = mockSocket.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      if (connectCb) connectCb();
    });

    const initialDataCallback = mockSocket.on.mock.calls.find(
      (call) => call[0] === "initialData"
    )?.[1];
    await act(async () => {
      if (initialDataCallback) {
        initialDataCallback([
          {
            symbol: "BINANCE:ETHUSDT",
            current: 3160.3,
            timestamp: "2025-11-15T22:15:41Z",
            hourlyAverage: 3149.27,
          },
        ]);
      }
    });

    await waitFor(
      () => {
        expect(screen.getByText("3,160.30")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  // TEST 4 (ok)
  it("shows connecting state", async () => {
    render(<Dashboard />);
    expect(screen.getByText("Connecting...")).toBeInTheDocument();
    await act(async () => {
      const connectCb = mockSocket.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];
      if (connectCb) connectCb();
    });
    await waitFor(() => expect(screen.getByText("Live")).toBeInTheDocument());
  });

  // TEST 5 (ok)
  it("shows error and retry", async () => {
    render(<Dashboard />);
    await act(async () => {
      const errorCb = mockSocket.on.mock.calls.find(
        (call) => call[0] === "connect_error"
      )?.[1];
      if (errorCb) errorCb(new Error("test"));
    });
    await waitFor(() =>
      expect(screen.getByText(/unavailable/i)).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));
    expect(mockSocket.connect).toHaveBeenCalledTimes(1);
  });
});
