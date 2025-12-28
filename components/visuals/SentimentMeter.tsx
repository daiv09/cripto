"use client";

// Allow up/down to be number OR null/undefined
export function SentimentMeter({
  up,
  down,
}: {
  up: number | null | undefined;
  down: number | null | undefined;
}) {
  // If data is missing, render a "No Data" state or just return null
  if (up === null || up === undefined || down === null || down === undefined) {
    return (
      <div className="w-full text-center p-4 bg-slate-900/50 rounded-lg">
        <span className="text-sm text-slate-500">
          No sentiment data available
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-sm font-medium">
        <span className="text-emerald-400">Bullish {up.toFixed(0)}%</span>
        <span className="text-rose-400">{down.toFixed(0)}% Bearish</span>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
        <div
          style={{ width: `${up}%` }}
          className="h-full bg-emerald-500 transition-all duration-1000"
        />
        <div
          style={{ width: `${down}%` }}
          className="h-full bg-rose-500 transition-all duration-1000"
        />
      </div>
    </div>
  );
}
