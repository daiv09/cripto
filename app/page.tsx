
import TrendingCoins from "@/components/home/TrendingCoins";
import CoinOverview from "@/components/home/CoinOverview";
import { Suspense } from "react";
import {
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from "@/components/home/fallback";

// Adjust type imports to your actual project
// import type { TrendingCoin, CoinDetailsData } from "@/types";

export default async function Home() {
  return (
    <main className="main-container">
      <section className="home-grid">
        <Suspense fallback={<CoinOverviewFallback />}>
          <CoinOverview />
        </Suspense>
        <Suspense fallback={<TrendingCoinsFallback />}>
          <TrendingCoins />
        </Suspense>
      </section>

      <section className="w-full mt-7 space-y-6">
        <p>Categories</p>
      </section>
    </main>
  );
}
