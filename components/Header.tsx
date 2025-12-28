"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Search } from "lucide-react"; // Import Icons
import SearchCommand from "@/components/home/Search"; // Import the component we just made

const Header = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toggle search with Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="main-container inner flex items-center justify-between h-16">
          <Link href="/" className="inline-flex items-center">
            <span className="text-xl font-semibold tracking-[0.5em] text-slate-100/90">
              CRIPTO
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={cn(
                  "nav-link text-sm font-medium transition-colors hover:text-white",
                  {
                    "text-white": pathname == "/",
                    "text-slate-400": pathname != "/",
                  }
                )}
              >
                Home
              </Link>
              
              {/* Spotlight Trigger Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all rounded-full px-4 py-1.5 text-sm text-slate-400"
              >
                <Search className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100 ml-2">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
              
              <Link
                href="/coins"
                className={cn(
                  "nav-link text-sm font-medium transition-colors hover:text-white",
                  {
                    "text-white": pathname == "/coins",
                    "text-slate-400": pathname != "/coins",
                  }
                )}
              >
                All Coins
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* The Search Modal */}
      <SearchCommand
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Header;
