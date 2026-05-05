import OrderTicket from "@/components/order-ticket"
import StockChart from "@/components/stock-charts"
import StockInfo from "@/components/stock-info"
import StockPriceMetrics from "@/components/stock-price-metrics"
import Image from "next/image"

async function getStockProfile(symbol: string) {
  try {
    const apiKey = process.env.FMP_API_KEY
    if (!apiKey) return null

    const res = await fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`, {
      next: { revalidate: 3600 }
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    return data && data.length > 0 ? data[0] : null
  } catch (err) {
    console.error("FMP fetch error:", err)
    return null
  }
}

async function getStockPrice(symbol: string): Promise<number | undefined> {
  try {
    const apiKey = process.env.FMP_API_KEY
    if (!apiKey) return undefined
    const res = await fetch(`https://financialmodelingprep.com/stable/quote?symbol=${symbol}.NS&apikey=${apiKey}`, {
      next: { revalidate: 30 }
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data[0]?.price : undefined
  } catch {
    return undefined
  }
}

export default async function StockPage({
  params,
}: {
  params: Promise<{ stock: string }>
}) {
  const { stock } = await params
  
  // FMP usually expects Indian stocks with .NS or .BO suffix, so we try with .NS first if there is no suffix,
  // then fallback to the exact symbol provided just in case.
  let profile = await getStockProfile(`${stock}.NS`);
  if (!profile) {
    profile = await getStockProfile(stock);
  }

  const currentPrice = await getStockPrice(stock)

  return (
    <div className="p-6" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Stock name heading */}
      <div className="flex items-center gap-4">
        {profile?.image && (
          <div className="relative size-12 overflow-hidden rounded-lg bg-white p-1">
            <Image 
              src={profile.image} 
              alt={`${stock} logo`} 
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.companyName || stock}
        </h1>
      </div>

      {/* Chart + Order ticket side by side */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "20px",
        alignItems: "stretch",
      }}>
        {/* Chart col — constrained so it doesn't bleed */}
        <div style={{ minWidth: 0, width: "100%", height: "100%" }}>
          <StockChart symbol={stock} />
        </div>

        {/* Order ticket col — aligns to top, does not stretch */}
        <div style={{ width: "300px", flexShrink: 0, height: "100%" }}>
          <OrderTicket stockName={stock} defaultPrice={currentPrice} />
        </div>
      </div>

      {/* Price metrics — full width */}
      <StockPriceMetrics symbol={stock} />

      {/* Company info — full width */}
      <StockInfo symbol={stock} />

    </div>
  )
}