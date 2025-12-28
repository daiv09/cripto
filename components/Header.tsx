"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Header = () => {
  const pathname = usePathname();

  return (
    <header>
      <div className="main-container inner">
        <Link href="/" className="inline-flex items-center">
          <span className="text-xl font-semibold tracking-[0.5em] text-slate-100/90">
            CRIPTO
          </span>
        </Link>

        <nav>
          <Link
            href="/"
            className={cn("nav-link", {
              "is-active": pathname == "/",
              "is-home": true,
            })}
          >
            Home
          </Link>
          <p>Search Modal</p>
          <Link
            href="/coins"
            className={cn("nav-link", {
              "is-active": pathname == "/coins",
            })}
          >
            All Coins
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
