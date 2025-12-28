"use client";

import { useEffect, useState, useRef } from "react";
import CandlestickChart from "@/components/CandlestickChart";
import {
  ArrowUp,
  ArrowDown,
  Activity,
  Layers,
  Signal,
  Maximize2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

// --- Types ---
type OHLCData = [number, number, number, number, number]; // [time, open, high, low, close]
type Timeframe = "1H" | "1D" | "1W";

// --- 1. Generator for Initial History (Simulated) ---
const GENERATE_HISTORY = (count: number): OHLCData[] => {
  const data: OHLCData[] = [];
  let time = Date.now() - count * 60 * 1000; // Start 'count' minutes ago
  let close = 8500000; // Start at ~85 Lakh INR

  for (let i = 0; i < count; i++) {
    const open = close;
    const volatility = 2000 + Math.random() * 3000; // Random volatility
    const change = (Math.random() - 0.5) * volatility;
    close = open + change;
    const high = Math.max(open, close) + Math.random() * 1000;
    const low = Math.min(open, close) - Math.random() * 1000;

    data.push([time, open, high, low, close]);
    time += 60 * 1000; // Increment 1 minute
  }
  return data;
};

export default function LiveTradingPage() {
  // --- State ---
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");
  const [historicalData, setHistoricalData] = useState<OHLCData[]>([]);
  const [liveCandle, setLiveCandle] = useState<OHLCData | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  // Refs to maintain state inside the interval closure
  const priceRef = useRef<number>(0);
  const candleRef = useRef<OHLCData | null>(null);

  // --- 2. Initialize Data on Mount ---
  useEffect(() => {
    // Generate 100 candles of history
    const history = GENERATE_HISTORY(100);
    const lastCandle = history[history.length - 1];

    // Split history and the "active" candle
    setHistoricalData(history.slice(0, -1));
    setLiveCandle(lastCandle);
    setCurrentPrice(lastCandle[4]);
    setPriceChangePercent(0.45); // Fake 24h change

    // Sync Refs
    priceRef.current = lastCandle[4];
    candleRef.current = lastCandle;
  }, []);

  // --- 3. The "Simulation Engine" (runs every 1s) ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (!candleRef.current) return;

      // A. Simulate Price Movement (Random Walk)
      const volatility = 500;
      const delta = (Math.random() - 0.5) * volatility;
      const newPrice = priceRef.current + delta;

      // Update State & Ref
      setCurrentPrice(newPrice);
      priceRef.current = newPrice;

      // B. Update the Live Candle Logic
      setLiveCandle((prev) => {
        if (!prev) return null;
        const [time, open, high, low] = prev;

        // "Wick" logic: Update High/Low based on new price
        const newHigh = Math.max(high, newPrice);
        const newLow = Math.min(low, newPrice);

        const updated: OHLCData = [time, open, newHigh, newLow, newPrice];
        candleRef.current = updated;
        return updated;
      });

      // C. Optional: Simulate "Candle Close" every 60 ticks (minutes)
      // For this demo, we just let the current candle wiggle forever for simplicity
    }, 1000); // 1000ms tick rate

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0e11] text-slate-200 p-2 md:p-4 font-sans flex flex-col gap-4">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#15191e] border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Using a static Bitcoin image for the demo */}
            <img
              src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
              alt="BTC"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                BTC / INR{" "}
                <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                  DEMO
                </span>
              </h1>
              <p className="text-xs text-slate-500">Simulated Network</p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block" />

          {/* Live Price Display */}
          <div
            className={cn(
              "text-2xl font-mono font-bold transition-colors duration-300",
              currentPrice > (liveCandle?.[1] || 0)
                ? "text-emerald-400"
                : "text-rose-400"
            )}
          >
            {formatCurrency(currentPrice)}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-xs">24h Change</span>
            <span className="font-medium flex items-center text-emerald-400">
              <ArrowUp size={14} /> {priceChangePercent}%
            </span>
          </div>
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-slate-500 text-xs">24h High</span>
            <span className="font-medium text-slate-200">₹8,800,230</span>
          </div>
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-slate-500 text-xs">24h Low</span>
            <span className="font-medium text-slate-200">₹8,450,100</span>
          </div>
        </div>
      </header>

      {/* 2. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[600px]">
        {/* Chart Column (3/4 width) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-[#15191e] border border-slate-800 rounded-xl p-1 flex-1 flex flex-col relative overflow-hidden shadow-2xl">
            {/* Chart Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-800/50">
              <div className="flex items-center gap-1">
                {/* Timeframe buttons (Visual only for demo) */}
                {["1H", "1D", "1W"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf as Timeframe)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      timeframe === tf
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Feed
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <button className="hover:text-white transition-colors">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            {/* The Chart */}
            <div className="flex-1 w-full relative min-h-[500px]">
              {historicalData.length > 0 && (
                <CandlestickChart
                  data={historicalData}
                  liveOhlcv={liveCandle} // This prop updates the chart in real-time
                  coinId="bitcoin"
                  initialPeriod="daily"
                  height={600}
                />
              )}
            </div>
          </div>
        </div>

        {/* Data Column (1/4 width) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Order Book */}
          <div className="bg-[#15191e] border border-slate-800 rounded-xl flex flex-col flex-1 max-h-[50%] shadow-lg">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Layers size={14} /> Order Book
              </h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                Spread 0.02%
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
              {/* Asks (Sell Orders) - Red */}
              <OrderBookRow
                price={currentPrice + 200}
                amount={0.45}
                total={45000}
                type="ask"
              />
              <OrderBookRow
                price={currentPrice + 150}
                amount={1.2}
                total={120000}
                type="ask"
              />
              <OrderBookRow
                price={currentPrice + 100}
                amount={0.8}
                total={80000}
                type="ask"
              />
              <OrderBookRow
                price={currentPrice + 50}
                amount={2.1}
                total={210000}
                type="ask"
              />

              {/* Current Price Middle Bar */}
              <div
                className={cn(
                  "py-2 text-center text-lg font-bold border-y border-slate-800 my-1 bg-slate-800/30 transition-colors duration-300",
                  currentPrice > priceRef.current - 10
                    ? "text-emerald-400"
                    : "text-rose-400"
                )}
              >
                {formatCurrency(currentPrice)}
                <ArrowUp
                  className={cn(
                    "inline ml-2 w-4 h-4",
                    currentPrice > priceRef.current - 10 ? "block" : "hidden"
                  )}
                />
                <ArrowDown
                  className={cn(
                    "inline ml-2 w-4 h-4",
                    currentPrice <= priceRef.current - 10 ? "block" : "hidden"
                  )}
                />
              </div>

              {/* Bids (Buy Orders) - Green */}
              <OrderBookRow
                price={currentPrice - 50}
                amount={2.5}
                total={250000}
                type="bid"
              />
              <OrderBookRow
                price={currentPrice - 100}
                amount={0.5}
                total={50000}
                type="bid"
              />
              <OrderBookRow
                price={currentPrice - 150}
                amount={1.1}
                total={110000}
                type="bid"
              />
              <OrderBookRow
                price={currentPrice - 200}
                amount={3.2}
                total={320000}
                type="bid"
              />
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-[#15191e] border border-slate-800 rounded-xl flex flex-col flex-1 max-h-[50%] shadow-lg">
            <div className="p-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Signal size={14} /> Recent Trades
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
              <div className="grid grid-cols-3 text-slate-500 pb-2 mb-2 border-b border-slate-800/50">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Time</span>
              </div>
              {/* Generated simulated trades based on live price */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 py-1 hover:bg-slate-800/50 rounded cursor-pointer animate-in fade-in slide-in-from-right-1 duration-300"
                >
                  <span
                    className={
                      Math.random() > 0.5 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {(currentPrice + (Math.random() * 200 - 100)).toFixed(0)}
                  </span>
                  <span className="text-right text-slate-300">
                    {(Math.random() * 0.5 + 0.01).toFixed(4)}
                  </span>
                  <span className="text-right text-slate-500">
                    {new Date(Date.now() - i * 2000).toLocaleTimeString([], {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// --- Helper Component: Order Book Row ---
function OrderBookRow({
  price,
  amount,
  total,
  type,
}: {
  price: number;
  amount: number;
  total: number;
  type: "bid" | "ask";
}) {
  // Add a slight random jitter to the bars to make it feel alive
  const barWidth = Math.min(
    100,
    Math.max(10, amount * 20 + Math.random() * 10)
  );

  return (
    <div className="grid grid-cols-3 py-0.5 hover:bg-slate-800/50 cursor-pointer relative group">
      {/* Background depth bar visual */}
      <div
        className={cn(
          "absolute top-0 bottom-0 right-0 opacity-10 transition-all duration-500",
          type === "ask" ? "bg-rose-500" : "bg-emerald-500"
        )}
        style={{ width: `${barWidth}%` }}
      />

      <span
        className={cn(
          "relative z-10",
          type === "ask" ? "text-rose-400" : "text-emerald-400"
        )}
      >
        {price.toLocaleString()}
      </span>
      <span className="text-right text-slate-300 relative z-10">
        {amount.toFixed(4)}
      </span>
      <span className="text-right text-slate-500 relative z-10">
        {(total / 1000).toFixed(1)}K
      </span>
    </div>
  );
}
