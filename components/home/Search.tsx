"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Loader2, ChevronRight } from "lucide-react";
// 1. Import the Server Actions we created
import { getTrendingCoins, searchCoins } from "@/lib/coingecko.actions";
import Image from "next/image";

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ensure these types match what your API returns
type SearchResult = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  thumb: string;
};

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Load Trending Coins using the Server Action
  useEffect(() => {
    const loadTrending = async () => {
      try {
        // Calls the server action (which uses fetcher)
        const data = await getTrendingCoins();

        // Map the response to our simple SearchResult type
        const formatted = data.coins.map((item) => ({
          id: item.item.id,
          name: item.item.name,
          symbol: item.item.symbol,
          market_cap_rank: item.item.market_cap_rank,
          thumb: item.item.thumb,
        }));
        setTrending(formatted.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch trending coins:", error);
      }
    };

    // Only fetch when the modal is first opened to save resources
    if (isOpen && trending.length === 0) {
      loadTrending();
    }
  }, [isOpen, trending.length]);

  // 3. Search Coins using the Server Action (Debounced)
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        // Calls the server action (which uses fetcher)
        const data = await searchCoins(query);
        setResults(data.coins?.slice(0, 7) || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: Wait 500ms after user stops typing before calling API
    const delayDebounceFn = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 4. Handle Selection & Navigation
  const handleSelect = (coinId: string) => {
    onClose(); // Close modal
    setQuery(""); // Clear search
    router.push(`/coins/${coinId}`); // Go to page
  };

  // 5. Close on Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop & Centering Wrapper
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="flex items-center border-b border-slate-800 px-4 py-4 bg-slate-900/50 shrink-0">
          <Search className="w-5 h-5 text-slate-500 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search for coins..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-100 placeholder:text-slate-500 font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-500 hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {isLoading ? (
            <div className="py-12 flex justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              {/* Trending Section (Only visible when query is empty) */}
              {query === "" && trending.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-2">
                    Trending Now
                  </h3>
                  {trending.map((coin) => (
                    <ResultItem
                      key={coin.id}
                      coin={coin}
                      onSelect={() => handleSelect(coin.id)}
                      isTrending
                    />
                  ))}
                </div>
              )}

              {/* Search Results Section */}
              {query !== "" && results.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-2">
                    Search Results
                  </h3>
                  {results.map((coin) => (
                    <ResultItem
                      key={coin.id}
                      coin={coin}
                      onSelect={() => handleSelect(coin.id)}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {query !== "" && results.length === 0 && !isLoading && (
                <div className="py-12 text-center text-slate-500">
                  <p>
                    No coins found for{" "}
                    <span className="text-slate-300">&quot;{query}&quot;</span>
                  </p>
                </div>
              )}
            </> 
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/50 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex gap-4">
            <span>
              <span className="font-semibold text-slate-400">Esc</span> to close
            </span>
            <span>
              <span className="font-semibold text-slate-400">↵</span> to select
            </span>
          </div>
          <span className="opacity-50">Powered by CoinGecko</span>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Individual List Items
function ResultItem({
  coin,
  onSelect,
  isTrending,
}: {
  coin: SearchResult;
  onSelect: () => void;
  isTrending?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-800 rounded-lg transition-all group text-left outline-none focus:bg-slate-800"
    >
      <Image
        src={coin.thumb}
        alt={coin.name}
        width={36}
        height={36}
        className="rounded-full bg-slate-800 object-cover"
        onError={(e) => {
          // Fallback image if source fails
          (e.target as HTMLImageElement).src =
            "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png";
        }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200 truncate">
            {coin.name}
          </span>
          <span className="text-xs text-slate-500 uppercase font-mono bg-slate-800/50 px-1.5 rounded">
            {coin.symbol}
          </span>
        </div>
      </div>

      {isTrending && (
        <div className="flex items-center gap-1 text-emerald-400/70 text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trending</span>
        </div>
      )}

      {!isTrending && coin.market_cap_rank && (
        <span className="text-xs text-slate-500 font-mono">
          #{coin.market_cap_rank}
        </span>
      )}

      <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </button>
  );
}
