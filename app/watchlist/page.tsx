// app/watchlist/page.tsx
import Image from "next/image";
import Link from "next/link";
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency, formatPercentage } from "@/lib/utils";

type WatchlistCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_1h_in_currency?: number;
};

type PageProps = {
  searchParams: Promise<{
    ids?: string;
  }>;
};

export default async function WatchlistPage({ searchParams }: PageProps) {
  const { ids } = await searchParams;
  const idList = ids
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let coins: WatchlistCoin[] = [];

  if (idList && idList.length > 0) {
    coins = await fetcher<WatchlistCoin[]>("/coins/markets", {
      vs_currency: "inr",
      ids: idList.join(","), // official recommended way to fetch specific coins
      price_change_percentage: "1h,24h",
      precision: "full",
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <nav className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Watchlist
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Your pinned markets from CoinGecko. Pass{" "}
              <code className="text-xs bg-slate-900 px-1.5 py-0.5 rounded">
                ?ids=bitcoin,ethereum,solana
              </code>{" "}
              to test.
            </p>
          </div>
          <div className="text-xs text-slate-500 md:text-right">
            <p>vs_currency: INR · source: /coins/markets (ids lookup)</p>
          </div>
        </nav>

        {/* Empty state */}
        {!idList || idList.length === 0 || coins.length === 0 ? (
          <div className="border border-slate-800/80 rounded-2xl bg-slate-950/60 p-6 text-sm text-slate-400">
            <p className="mb-2">
              No coins in your watchlist yet. To see data here, add a
              comma‑separated list of CoinGecko IDs in the URL:
            </p>
            <code className="block text-xs bg-slate-900 px-2 py-1 rounded-md text-slate-300">
              /watchlist?ids=bitcoin,ethereum,solana
            </code>
            <p className="mt-3">
              You can get valid IDs from the <code>/coins/list</code> endpoint
              or CoinGecko UI.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {coins.map((coin) => {
              const change1h = coin.price_change_percentage_1h_in_currency ?? 0;
              const change24h = coin.price_change_percentage_24h ?? 0;
              const isUp1h = change1h >= 0;
              const isUp24h = change24h >= 0;

              return (
                <Link
                  key={coin.id}
                  href={`/coins/${coin.id}`}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-4 flex flex-col gap-4 hover:border-slate-600/70 hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-50">
                          {coin.name}
                        </span>
                        <span className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                          {coin.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-50">
                        {formatCurrency(coin.current_price)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        MCap rank #{coin.market_cap_rank}
                      </div>
                    </div>
                  </div>

                  {/* Change row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-500 mb-0.5">1h</span>
                      <span
                        className={
                          isUp1h ? "text-emerald-400/90" : "text-rose-400/90"
                        }
                      >
                        {formatPercentage(change1h)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 mb-0.5">24h</span>
                      <span
                        className={
                          isUp24h ? "text-emerald-400" : "text-rose-400"
                        }
                      >
                        {formatPercentage(change24h)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500 mb-0.5">Market Cap</span>
                      <span className="text-[11px] text-slate-200">
                        {formatCurrency(coin.market_cap)}
                      </span>
                    </div>
                  </div>

                  {/* Placeholder mini chart / extra info */}
                  <div className="h-10 w-full rounded-full bg-slate-900/80 flex items-center justify-between px-3 text-[11px] text-slate-500">
                    <span>Volume 24h</span>
                    <span className="text-slate-300">
                      {formatCurrency(coin.total_volume)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
