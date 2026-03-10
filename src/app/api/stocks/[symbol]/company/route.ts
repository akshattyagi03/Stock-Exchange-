import { NextResponse } from "next/server"
import { getCompanyProfile } from "@/lib/fmp"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  const profile = await getCompanyProfile(symbol)

  if (!profile) {
    return NextResponse.json(
      { error: "Company data not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    name: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    marketCap: profile.marketCap,
    description: profile.description,
    ceo: profile.ceo
  })
}