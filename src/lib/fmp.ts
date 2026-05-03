const FMP_BASE_URL = "https://financialmodelingprep.com/stable"

export async function getCompanyProfile(symbol: string) {
  const apiKey = process.env.FMP_API_KEY

  const res = await fetch(
    `${FMP_BASE_URL}/profile?symbol=${symbol}.NS&apikey=${apiKey}`
  )

  const data = await res.json()

  if (!data || data.length === 0) return null

  return data[0]
}

/**
 * Fetches the current market price for a given NSE symbol via FMP.
 * Returns null if the symbol is not found or the API call fails.
 *
 * Used by the order execution worker to simulate limit-order matching
 * without placing real trades through Upstox.
 *
 * @param symbol  NSE trading symbol, e.g. "RELIANCE", "INFY"
 */
export async function getStockPrice(symbol: string): Promise<number | null> {
  try {
    const apiKey = process.env.FMP_API_KEY
    const res = await fetch(
      `${FMP_BASE_URL}/quote?symbol=${symbol}.NS&apikey=${apiKey}`
    )

    if (!res.ok) return null

    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) return null

    const price = data[0]?.price
    return typeof price === "number" && price > 0 ? price : null
  } catch {
    return null
  }
}

export type StockQuote = {
  price: number
  previousClose: number | null
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const apiKey = process.env.FMP_API_KEY
    const res = await fetch(
      `${FMP_BASE_URL}/quote?symbol=${symbol}.NS&apikey=${apiKey}`
    )

    if (!res.ok) return null

    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) return null

    const quote = data[0]
    const price = quote?.price
    const previousClose = quote?.previousClose
    const change = quote?.change

    if (typeof price !== "number" || price <= 0) return null

    return {
      price,
      previousClose:
        typeof previousClose === "number" && previousClose > 0
          ? previousClose
          : typeof change === "number"
          ? price - change
          : null,
    }
  } catch {
    return null
  }
}
