import axios from "axios"

const UPSTOX_BASE_URL = "https://api.upstox.com/v2"

/* ---------------- CREATE HEADERS ---------------- */

function getHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  }
}

/* ---------------- GET LTP ---------------- */

export async function fetchMarketQuote(symbol: string, accessToken: string) {
  const res = await axios.get(
    `${UPSTOX_BASE_URL}/market-quote/ltp`,
    {
      params: {
        symbol: symbol,
      },
      headers: getHeaders(accessToken),
    }
  )

  return res.data
}

/* ---------------- GET FULL QUOTE ---------------- */

export async function getStockQuote(
  instrumentKey: string,
  accessToken: string
) {
  const res = await axios.get(
    `${UPSTOX_BASE_URL}/market-quote/quotes`,
    {
      params: {
        instrument_key: instrumentKey,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  )

  console.log("UPSTOX RESPONSE:", res.data)

  const data = res.data?.data

  if (!data) return null

  const firstKey = Object.keys(data)[0]

  return data[firstKey]
}

export async function getMarketDepth(
  instrumentKey: string,
  accessToken: string
) {
  const res = await axios.get(
    `${UPSTOX_BASE_URL}/market-quote/market-depth`,
    {
      params: {
        instrument_key: instrumentKey,
      },
      headers: getHeaders(accessToken),
    }
  )

  return res.data.data[instrumentKey]
}

export async function getIndexPrice(instrumentKey: string, token: string) {
  const res = await axios.get(`${UPSTOX_BASE_URL}/market-quote/ltp`, {
    params: {
      instrument_key: instrumentKey
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  })

  const data = res.data?.data

  if (!data) return null

  const firstKey = Object.keys(data)[0]

  return data[firstKey]
}