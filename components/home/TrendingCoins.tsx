
import Image from "next/image";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import DataTable from "@/components/DataTable";
import { cn, formatCurrency } from "@/lib/utils";
import { fetcher } from "@/lib/coingecko.actions"; // Assuming fetcher is defined elsewhere

const TrendingCoins = async () => {
  const trendingCoins = await fetcher<{ coins: TrendingCoin[] }>(
    "/search/trending",
    undefined, // No options needed for this endpoint
    300
  );
  type TrendingCoin = {
    item: {
      id: string;
      name: string;
      large: string;
      data: {
        price_change_percentage_24h: { usd: number };
        price: string;
      };
    };
  };
  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: "Name",
      cellClassName: "name-cell",
      cell: (coin) => {
        const item = coin.item;
        return (
          <Link href={`/coins/${item.id}`}>
            <Image src={item.large} alt={item.name} width={32} height={32} />
            <p>{item.name}</p>
          </Link>
        );
      },
    },
    {
      header: "24h Change",
      cellClassName: "change-cell",
      cell: (coin) => {
        const item = coin.item;
        const change = item.data.price_change_percentage_24h.usd;

        const isTrendingUp = change > 0;
        return (
          <div
            className={cn(
              "price-change",
              isTrendingUp ? "text-green-500" : "text-red-500"
            )}
          >
            {isTrendingUp ? (
              <TrendingUp width={16} height={16} />
            ) : (
              <TrendingDown width={16} height={16} />
            )}
            <span>{Math.abs(change).toFixed(2)}%</span>
          </div>
        );
      },
    },
    {
      header: "Price",
      cellClassName: "price-cell",
      cell: (coin) => formatCurrency(coin.item.data.price), // or format as string
    },
  ];
  return (
    <div id="trending-coins">
      <h4>Trending Coins</h4>
      <div id="trending-coins">
        <DataTable<TrendingCoin>
          data={trendingCoins.coins.slice(0, 10) || []}
          columns={columns}
          rowKey={(row) => row.item.id}
          tableClassName="trending-coins-table"
          headerCellClassName="py-3!"
          bodyCellClassName="py-2!"
        />
      </div>
    </div>
  );
};

export default TrendingCoins;
