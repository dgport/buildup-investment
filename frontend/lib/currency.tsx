"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Currency = "GEL" | "USD";

/** Lari is the site's primary currency; prices are stored in USD and converted. */
const DEFAULT_CURRENCY: Currency = "GEL";
const FALLBACK_RATE = 2.7;
const RATE_URL = "https://api.exchangerate-api.com/v4/latest/USD";
const RATE_TTL_MS = 6 * 60 * 60 * 1000; // refresh at most every 6 hours
const CURRENCY_KEY = "buildup.currency";
const RATE_KEY = "buildup.usdGel";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const readCache = (): { rate: number; at: number } | null => {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { rate: number; at: number };
    return typeof parsed.rate === "number" && parsed.rate > 0 ? parsed : null;
  } catch {
    return null;
  }
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Server and first client render must agree, so the stored preference is
  // applied after mount rather than during the initial render.
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_RATE);
  const [isLoading, setIsLoading] = useState(true);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(CURRENCY_KEY, next);
    } catch {
      /* storage unavailable – the choice just won't persist */
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CURRENCY_KEY);
      if (stored === "USD" || stored === "GEL") setCurrencyState(stored);
    } catch {
      /* ignore */
    }

    // Show the last known rate immediately, then refresh if it is stale.
    const cached = readCache();
    if (cached) {
      setExchangeRate(cached.rate);
      setIsLoading(false);
      if (Date.now() - cached.at < RATE_TTL_MS) return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(RATE_URL);
        const data = (await response.json()) as { rates?: Record<string, number> };
        const rate = data.rates?.GEL;
        if (!cancelled && typeof rate === "number" && rate > 0) {
          setExchangeRate(rate);
          try {
            localStorage.setItem(RATE_KEY, JSON.stringify({ rate, at: Date.now() }));
          } catch {
            /* ignore */
          }
        }
      } catch {
        // Keep the cached or fallback rate – GEL prices stay approximate.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

/** Price as shown to visitors: lari by default, dollars on request. */
export function formatMoney(
  usd: number | null | undefined,
  currency: Currency,
  rate: number,
): string | null {
  if (usd == null) return null;
  return currency === "GEL"
    ? `${Math.round(usd * rate).toLocaleString("en-US")} ₾`
    : `$${Math.round(usd).toLocaleString("en-US")}`;
}
