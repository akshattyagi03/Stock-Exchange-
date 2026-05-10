import "dotenv/config"

import { Job, Queue, Worker } from "bullmq"
import mongoose from "mongoose"
import http from "http"

import {
  createRedisConnection,
  ORDER_EXECUTION_QUEUE_NAME,
} from "@/lib/bullmq"
import {
  cancelAllExpiredOrders,
  processExecuteOrder,
  type OrderJobData,
} from "@/workers/orderEngine"

const MARKET_CLOSE_SWEEP_JOB = "cancel-market-close"

http.createServer((_, res) => {
  res.writeHead(200)
  res.end("Worker running")
}).listen(process.env.PORT || 3001, () => {
  console.log("[worker] Keep-alive server listening")
})

async function main() {
  console.log("[worker] Connecting to MongoDB...")
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log("[worker] MongoDB connected.")

  const connection = createRedisConnection()
  const schedulerQueue = new Queue(ORDER_EXECUTION_QUEUE_NAME, { connection })

  await schedulerQueue.add(
    MARKET_CLOSE_SWEEP_JOB,
    {} as OrderJobData,
    {
      jobId: "cancel-market-close-cron",
      repeat: { pattern: "1 10 * * 1-5" },
      removeOnComplete: true,
      removeOnFail: false,
    }
  )

  const worker = new Worker<OrderJobData>(
    ORDER_EXECUTION_QUEUE_NAME,
    async (job: Job<OrderJobData>) => {
      console.log(
        `[worker] Processing job ${job.id} (${job.name}) attempt ${job.attemptsMade + 1}`
      )

      if (job.name === MARKET_CLOSE_SWEEP_JOB) {
        return cancelAllExpiredOrders()
      }

      return processExecuteOrder(job.data)
    },
    {
      connection,
      concurrency: 5,
    }
  )

  worker.on("completed", (job, result) => {
    console.log(`[worker] Job ${job.id} (${job.name}) completed:`, result)
  })

  worker.on("failed", (job, error) => {
    console.warn(
      `[worker] Job ${job?.id} (${job?.name}) attempt ${job?.attemptsMade} failed: ${error.message}`
    )
  })

  worker.on("error", (error) => {
    console.error("[worker] Worker error:", error)
  })

  console.log("[worker] Order execution worker running. Ctrl+C to stop.")

  const shutdown = async () => {
    console.log("[worker] Shutting down gracefully...")
    await worker.close()
    await schedulerQueue.close()
    await mongoose.disconnect()
    process.exit(0)
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

main().catch((error) => {
  console.error("[worker] Fatal error:", error)
  process.exit(1)
})
