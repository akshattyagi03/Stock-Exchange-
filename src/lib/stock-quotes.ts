import { getStockQuote as getFmpStockQuote, type StockQuote } from "@/lib/fmp"
import { getInstrumentKeyBySymbol } from "@/lib/instruments"
import { getStockQuote as getUpstoxStockQuote } from "@/lib/upstox"

type UpstoxQuote = {
  last_price?: number
  net_change?: number
}

function normalizeUpstoxQuote(quote: UpstoxQuote | null): StockQuote | null {
  const price = quote?.last_price
  const netChange = quote?.net_change

  if (typeof price !== "number" || price <= 0) return null

  return {
    price,
    previousClose:
      typeof netChange === "number" ? Number((price - netChange).toFixed(2)) : null,
  }
}

export async function getCurrentStockQuote(symbol: string) {
  const accessToken = process.env.UPSTOX_ACCESS_TOKEN
  const instrumentKey = getInstrumentKeyBySymbol(symbol)

  if (accessToken && instrumentKey) {
    try {
      const upstoxQuote = await getUpstoxStockQuote(instrumentKey, accessToken)
      const normalizedQuote = normalizeUpstoxQuote(upstoxQuote)

      if (normalizedQuote) return normalizedQuote
    } catch (error) {
      console.error(`Failed to fetch Upstox quote for ${symbol}:`, error)
    }
  }

  return getFmpStockQuote(symbol)
}
