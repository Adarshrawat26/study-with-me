"use client";

import { useEffect, useState } from "react";
import { MOTIVATIONAL_QUOTES } from "@/lib/utils";

/** Picks a random quote after mount to avoid SSR/client hydration mismatches. */
export function useMotivationalQuote() {
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  return quote;
}
