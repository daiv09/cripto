"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  getChartConfig,
  getCandlestickConfig,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from "@/constants";
import {
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  createChart,
  Time,
} from "lightweight-charts";
import { fetcher } from "@/lib/coingecko.actions";
import { convertOHLCData } from "@/lib/utils";

// Ensure these match your project types
type Period =
  | "daily"
  | "weekly"
  | "monthly"
  | "3months"
  | "6months"
  | "yearly"
  | "max";
type OHLCData = [number, number, number, number, number];

interface CandlestickChartProps {
  children?: React.ReactNode;
  data: OHLCData[];
  coinId: string;
  height?: number;
  initialPeriod?: Period;
  liveOhlcv?: OHLCData | null; // <--- New Optional Prop for Live Updates
}

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = "daily",
  liveOhlcv, // Destructure new prop
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [period, setPeriod] = useState<Period>(initialPeriod as Period);
  const [isPending, startTransition] = useTransition();

  // --- 1. Historical Data Fetching (Static Mode Only) ---
  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const config = PERIOD_CONFIG[selectedPeriod];
      // If live mode is active, we might disable timeframe fetching or handle differently
      if (liveOhlcv) return;

      const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
        vs_currency: "inr",
        days: config.days,
        precision: "full",
      });

      setOhlcData(newData ?? []);
    } catch (e) {
      console.error("Failed to fetch OHLCData", e);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;
    startTransition(async () => {
      setPeriod(newPeriod);
      await fetchOHLCData(newPeriod);
    });
  };

  // --- 2. Chart Initialization ---
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // Safety check: destroy old chart instance if re-initializing
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const showTime =
      ["daily", "weekly", "monthly"].includes(period) || !!liveOhlcv;

    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: container.clientWidth,
    });

    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    // Determine initial data source:
    // In Live Mode, we trust the parent 'data' prop entirely.
    // In Static Mode, we use local 'ohlcData' state to support button switching.
    const sourceData = liveOhlcv ? data : ohlcData;

    const convertToSeconds = sourceData.map(
      (item) =>
        [
          Math.floor(item[0] / 1000),
          item[1],
          item[2],
          item[3],
          item[4],
        ] as OHLCData
    );

    series.setData(convertOHLCData(convertToSeconds));
    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      chart.applyOptions({ width: entries[0].contentRect.width });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
    // Re-init if switching periods OR if the base dataset changes massively
  }, [height, period, ohlcData, data, liveOhlcv ? "live" : "static"]);

  // --- 3. Real-Time Update Effect (Live Mode Only) ---
  useEffect(() => {
    // This effect runs ONLY when the live candle updates
    if (!candleSeriesRef.current || !liveOhlcv) return;

    // Use .update() for efficient re-painting of just the last candle
    candleSeriesRef.current.update({
      time: Math.floor(liveOhlcv[0] / 1000) as Time,
      open: liveOhlcv[1],
      high: liveOhlcv[2],
      low: liveOhlcv[3],
      close: liveOhlcv[4],
    });
  }, [liveOhlcv]);

  return (
    <div id="candlestick-chart" className="flex flex-col h-full w-full">
      <div className="chart-header flex items-center justify-between mb-2">
        <div className="flex-1">{children}</div>

        {/* Hide Timeframe buttons in Live Mode to keep UI clean */}
        {!liveOhlcv && (
          <div className="button-group flex gap-1 bg-slate-900/50 p-1 rounded-lg">
            {PERIOD_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  period === value
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                onClick={() => handlePeriodChange(value as Period)}
                disabled={isPending}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={chartContainerRef}
        className="chart w-full flex-1"
        style={{ height }}
      />
    </div>
  );
};

export default CandlestickChart;
