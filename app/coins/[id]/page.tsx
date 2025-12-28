import Image from "next/image";
import { notFound } from "next/navigation";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import CandlestickChart from "@/components/CandlestickChart";
import {
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Github,
  TrendingUp,
  Database,
  Layers,
  Code2,
  GitFork,
  Star,
  AlertCircle,
} from "lucide-react";

// --- Visual Components ---
import MarketPerformanceChart from "@/components/visuals/MarketPerformanceChart";
import {SentimentMeter} from "@/components/visuals/SentimentMeter";
import SupplyProgressBar from "@/components/visuals/SupplyProgressBar";

type PageProps = {
  params: { id: string };
};

export default async function CoinDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Initialize variables with correct types or null
  let coin: CoinDetailsData | null = null;
  let ohlc: OHLCData[] | null = null;

  try {
    const result = await Promise.allSettled([
      // FIX 1: Explicitly pass <CoinDetailsData> to the first fetcher
      fetcher<CoinDetailsData>(`/coins/${id}`, {
        localization: false,
        tickers: false,
        community_data: false,
        developer_data: true,
        sparkline: true,
      }),
      // FIX 2: Explicitly pass <OHLCData[]> to the second fetcher
      // This tells TS the API returns the specific 5-number tuple it expects
      fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
        vs_currency: "inr",
        days: 1,
        precision: "full",
      }),
    ]);

    if (result[0].status === "fulfilled") coin = result[0].value;
    if (result[1].status === "fulfilled") ohlc = result[1].value;
  } catch (e) {
    console.error("Error fetching data:", e);
  }

  if (!coin) return notFound();

  // Extract key data
  const currentPrice = coin.market_data.current_price.inr;
  const priceChange24h = coin.market_data.price_change_percentage_24h;
  const isPositive = priceChange24h >= 0;

  const performanceData = [
    {
      name: "1h",
      value: coin.market_data.price_change_percentage_1h_in_currency.inr,
    },
    { name: "24h", value: coin.market_data.price_change_percentage_24h },
    { name: "7d", value: coin.market_data.price_change_percentage_7d },
    { name: "30d", value: coin.market_data.price_change_percentage_30d },
    { name: "1y", value: coin.market_data.price_change_percentage_1y },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HERO SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-4">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={80}
              height={80}
              className="rounded-full shadow-lg shadow-purple-500/20"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                {coin.name}
                <span className="text-slate-500 text-2xl font-medium">
                  {coin.symbol.toUpperCase()}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                  Rank #{coin.market_cap_rank}
                </span>
                <span className="bg-purple-900/30 text-purple-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                  {coin.hashing_algorithm || "Crypto"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <div className="text-4xl md:text-5xl font-bold tracking-tight">
              {formatCurrency(currentPrice)}
            </div>
            <div
              className={cn(
                "flex items-center md:justify-end gap-1 mt-2 text-lg font-medium",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {isPositive ? (
                <ArrowUpRight size={24} />
              ) : (
                <ArrowDownRight size={24} />
              )}
              {formatPercentage(priceChange24h)}
              <span className="text-sm text-slate-500 font-normal ml-1">
                (24h)
              </span>
            </div>
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (Charts & Deep Data) - Spans 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* --- CANDLESTICK CHART --- */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="text-purple-400 size-5" />
                  Price Action (24h)
                </h3>
              </div>
              <div className="flex-1 w-full">
                {ohlc && ohlc.length > 0 ? (
                  <CandlestickChart data={ohlc} coinId={id} />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No chart data available for this period.
                  </div>
                )}
              </div>
            </section>

            {/* --- ROI PERFORMANCE CHART --- */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-300">
                ROI Performance
              </h3>
              <div className="h-[250px] w-full">
                <MarketPerformanceChart data={performanceData} />
              </div>
            </section>

            {/* --- DEVELOPER STATS --- */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox
                icon={<GitFork size={20} />}
                label="Forks"
                value={coin.developer_data.forks}
              />
              <StatBox
                icon={<Star size={20} />}
                label="Stars"
                value={coin.developer_data.stars}
              />
              <StatBox
                icon={<AlertCircle size={20} />}
                label="Issues"
                value={coin.developer_data.total_issues}
              />
              <StatBox
                icon={<Code2 size={20} />}
                label="Contributors"
                value={coin.developer_data.pull_request_contributors}
              />
            </section>
          </div>

          {/* RIGHT COLUMN (Stats & Summaries) - Spans 1 col */}
          <div className="space-y-6">
            {/* --- MARKET CAP & VOLUME --- */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-slate-100">
                Market Data
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Market Cap</span>
                  <span>{formatCurrency(coin.market_data.market_cap.inr)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-full opacity-80" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>24h Volume</span>
                  <span>
                    {formatCurrency(coin.market_data.total_volume.inr)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[60%]" />
                </div>
              </div>
            </div>

            {/* --- SENTIMENT METER --- */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">
                Community Sentiment
              </h3>
              <SentimentMeter
                up={coin.sentiment_votes_up_percentage}
                down={coin.sentiment_votes_down_percentage}
              />
            </div>

            {/* --- SUPPLY METER --- */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">
                Supply Saturation
              </h3>
              <SupplyProgressBar
                circulating={coin.market_data.circulating_supply}
                max={
                  coin.market_data.max_supply ||
                  coin.market_data.total_supply ||
                  0
                }
                symbol={coin.symbol}
              />
            </div>

            {/* --- ATH / ATL STATS --- */}
            <div className="grid grid-cols-1 gap-4">
              {/* All Time High */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    All Time High
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(coin.market_data.ath.inr)}
                  </p>
                  <p className="text-xs text-rose-400">
                    {coin.market_data.ath_change_percentage.inr.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">
                    {new Date(
                      coin.market_data.ath_date.inr
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* All Time Low */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    All Time Low
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(coin.market_data.atl.inr)}
                  </p>
                  <p className="text-xs text-emerald-400">
                    +{coin.market_data.atl_change_percentage.inr.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">
                    {new Date(
                      coin.market_data.atl_date.inr
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* --- LINKS --- */}
            <div className="flex gap-2 flex-wrap">
              {coin.links.homepage[0] && (
                <LinkButton
                  href={coin.links.homepage[0]}
                  icon={<Globe size={14} />}
                >
                  Website
                </LinkButton>
              )}
              {coin.links.repos_url?.github?.[0] && (
                <LinkButton
                  href={coin.links.repos_url.github[0]}
                  icon={<Github size={14} />}
                >
                  GitHub
                </LinkButton>
              )}
              {coin.links.blockchain_site[0] && (
                <LinkButton
                  href={coin.links.blockchain_site[0]}
                  icon={<Database size={14} />}
                >
                  Explorer
                </LinkButton>
              )}
            </div>
          </div>
        </div>

        {/* --- DESCRIPTION --- */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 mt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Layers className="size-5 text-slate-400" /> About {coin.name}
          </h3>
          <div
            className="prose prose-invert prose-sm max-w-none text-slate-400 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: coin.description.en || "No description available.",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-2 transition-all hover:bg-slate-800/50">
      <div className="text-slate-500">{icon}</div>
      <div className="text-2xl font-bold text-slate-200">
        {value ? value.toLocaleString() : "N/A"}
      </div>
      <div className="text-xs text-slate-500 font-medium uppercase">
        {label}
      </div>
    </div>
  );
}

function LinkButton({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors text-slate-300"
    >
      {icon} {children}
    </a>
  );
}
