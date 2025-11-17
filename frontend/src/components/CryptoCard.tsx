// src/components/CryptoCard.tsx
import { Line } from "react-chartjs-2";
import { Clock } from "lucide-react";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Filler);

interface CryptoCardProps {
  symbol: string;
  label: string;
  current: number | null;
  timestamp: string | null;
  hourlyAverage: number | null;
  history: { time: number; price: number }[];
}

export const CryptoCard = ({
  symbol,
  label,
  current,
  timestamp,
  hourlyAverage,
  history,
}: CryptoCardProps) => {
  const change =
    current && hourlyAverage && hourlyAverage > 0
      ? ((current - hourlyAverage) / hourlyAverage) * 100
      : 0;

  const chartData = {
    datasets: [
      {
        data: history.map((p) => ({ x: p.time, y: p.price })),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        type: "time" as const,
        ticks: { display: false },
        grid: { display: false },
      },
      y: {
        ticks: { display: false },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
    },
    animation: { duration: 0 },
  };

  if (!current) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <h3>{label}</h3>
          <p>Real-time Rate</p>
        </div>
        <span className={`change ${change >= 0 ? "up" : "down"}`}>
          {change >= 0 ? "Up" : "Down"} {Math.abs(change).toFixed(2)}%
        </span>
      </div>

      <div className="price">
        {current.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}
      </div>

      <div className="meta">
        <span className="flex items-center gap-1">
          <Clock size={16} />
          {new Date(timestamp!).toLocaleTimeString()}
        </span>
        <span>Avg: {hourlyAverage ? hourlyAverage.toFixed(6) : "N/A"}</span>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
