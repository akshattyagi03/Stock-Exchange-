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