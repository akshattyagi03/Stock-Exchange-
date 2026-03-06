import StockChart from "@/components/stock-charts"

export default async function StockPage({ params }: any) {
  const { stock } = await params

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{stock}</h1>

      <StockChart symbol={stock}/>
    </div>
  )
}