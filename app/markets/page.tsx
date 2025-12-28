// app/markets/page.tsx
import Image from "next/image";
import Link from "next/link";
import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import DataTable from "@/components/DataTable";

type MarketsCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_1h_in_currency?: number;
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
};

const PER_PAGE = 50;

export default async function MarketsPage({ searchParams }: PageProps) {
  const { page = "1", category } = await searchParams;
  const currentPage = Number(page) || 1;

  const query: Record<string, string | number | boolean> = {
    vs_currency: "inr",
    order: "market_cap_desc",
    per_page: PER_PAGE,
    page: currentPage,
    price_change_percentage: "1h,24h",
    precision: "full",
  };

  if (category) {
    query.category = category;
  }

  const coins = await fetcher<MarketsCoin[]>("/coins/markets", query);

  const columns: DataTableColumn<MarketsCoin>[] = [
    {
      header: "#",
      headClassName: "w-12 text-xs text-slate-400",
      cellClassName: "text-xs text-slate-500",
      cell: (coin, index) =>
        coin.market_cap_rank ?? (currentPage - 1) * PER_PAGE + index + 1,
    },
    {
      header: "Asset",
      cellClassName: "token-cell",
      cell: (coin) => (
        <Link href={`/coins/${coin.id}`} className="flex items-center gap-3">
          <Image
            src={coin.image}
            alt={coin.name}
            width={28}
            height={28}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-slate-50 text-sm">{coin.name}</span>
            <span className="text-[11px] text-slate-500 uppercase tracking-[0.18em]">
              {coin.symbol}
            </span>
          </div>
        </Link>
      ),
    },
    {
      header: "Price",
      cellClassName: "text-slate-100",
      cell: (coin) => formatCurrency(coin.current_price),
    },
    {
      header: "1h %",
      cellClassName: "text-sm font-medium",
      cell: (coin) => {
        const v = coin.price_change_percentage_1h_in_currency ?? 0;
        const isUp = v >= 0;
        return (
          <span className={isUp ? "text-emerald-400/80" : "text-rose-400/80"}>
            {formatPercentage(v)}
          </span>
        );
      },
    },
    {
      header: "24h %",
      cellClassName: "text-sm font-medium",
      cell: (coin) => {
        const v = coin.price_change_percentage_24h ?? 0;
        const isUp = v >= 0;
        return (
          <span className={isUp ? "text-emerald-400" : "text-rose-400"}>
            {formatPercentage(v)}
          </span>
        );
      },
    },
    {
      header: "Market Cap",
      headClassName: "text-right",
      cellClassName: "text-right text-slate-100",
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <nav className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Markets
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Live prices, market caps, and volume from CoinGecko markets.
            </p>
          </div>
          <div className="text-xs text-slate-500 space-y-1 md:text-right">
            <p>
              vs_currency: INR · order: market_cap_desc · per_page: {PER_PAGE}
            </p>
            {category && (
              <p>
                Category:{" "}
                <span className="text-slate-200 font-medium">{category}</span>
              </p>
            )}
          </div>
        </nav>

        {/* Table via DataTable */}
        <section
          id="markets-table"
          className="bg-dark-500 rounded-xl overflow-hidden"
        >
          <DataTable
            data={coins}
            columns={columns}
            rowKey={(coin) => coin.id}
            tableClassName="w-full"
            headerClassName="bg-dark-500"
            headerRowClassName=""
            headerCellClassName="py-3 text-xs uppercase tracking-wide"
            bodyRowClassName=""
            bodyCellClassName="py-3"
          />
        </section>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <div>
            Page <span className="text-slate-100">{currentPage}</span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/markets?page=${Math.max(1, currentPage - 1)}${
                category ? `&category=${encodeURIComponent(category)}` : ""
              }`}
              className={cn(
                "px-3 py-1 rounded-full border border-slate-700/70 hover:bg-slate-900 transition-colors",
                currentPage === 1 && "pointer-events-none opacity-40"
              )}
            >
              Previous
            </Link>
            <Link
              href={`/markets?page=${currentPage + 1}${
                category ? `&category=${encodeURIComponent(category)}` : ""
              }`}
              className="px-3 py-1 rounded-full border border-slate-700/70 hover:bg-slate-900 transition-colors"
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
