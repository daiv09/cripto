"use client";

export default function SupplyProgressBar({
  circulating,
  max,
  symbol,
}: {
  circulating: number;
  max: number;
  symbol: string;
}) {
  const percentage = max ? (circulating / max) * 100 : 0;

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase">
            Circulating Supply
          </p>
          <p className="text-sm font-mono text-slate-200">
            {circulating.toLocaleString()}{" "}
            <span className="text-slate-500">{symbol.toUpperCase()}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-bold uppercase">
            Max Supply
          </p>
          <p className="text-sm font-mono text-slate-200">
            {max ? max.toLocaleString() : "∞"}
          </p>
        </div>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
        <div
          style={{ width: `${percentage}%` }}
          className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
        />
      </div>

      <div className="text-center text-xs text-slate-500">
        {percentage.toFixed(1)}% Mined
      </div>
    </div>
  );
}
