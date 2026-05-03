import "dotenv/config"

import mongoose from "mongoose"

import { cancelAllExpiredOrders } from "@/workers/orderEngine"

async function main() {
  console.log("[cancel-expired] Connecting to MongoDB...")
  await mongoose.connect(process.env.MONGODB_URI!)

  try {
    const result = await cancelAllExpiredOrders()
    console.log(
      `[cancel-expired] Completed market-close sweep. Cancelled ${result.cancelledCount} order(s).`
    )
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((error) => {
  console.error("[cancel-expired] Fatal error:", error)
  process.exit(1)
})
