const UPSTOX_BASE_URL = "https://api.upstox.com/v2";

export async function fetchMarketQuote(symbol: string, accessToken: string) {
  const response = await fetch(
    `${UPSTOX_BASE_URL}/market-quote/ltp?symbol=${symbol}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch market quote");
  }

  return response.json();
}

export async function placeOrder(orderData: any, accessToken: string) {
  const response = await fetch(
    `${UPSTOX_BASE_URL}/order/place`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    }
  );

  if (!response.ok) {
    throw new Error("Order placement failed");
  }

  return response.json();
}