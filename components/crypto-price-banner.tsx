"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export function CryptoPriceBanner() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false&price_change_percentage=24h"
        );
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error("Error al obtener precios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-accent/50 border-b">
        <div className="container mx-auto py-2 px-4">
          <div className="animate-pulse flex gap-6 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-6 bg-accent/30 rounded w-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!prices.length) return null;

  return (
    <div className="bg-accent/50 border-b w-full">
      <div className="w-full">
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-6 py-2 px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 30,
              ease: "linear",
            }}
          >
            {[...prices, ...prices].map((crypto, index) => (
              <div
                key={`${crypto.id}-${index}`}
                className="flex items-center gap-2 whitespace-nowrap hover:bg-accent/30 px-2 py-1 rounded transition-colors"
              >
                <span className="font-semibold text-sm">{crypto.symbol.toUpperCase()}</span>
                <span className="font-mono text-sm">${crypto.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
                <span className={`flex items-center gap-1 text-sm ${
                  crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </span>
              </div>
            ))}
          </motion.div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-accent/50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
} 