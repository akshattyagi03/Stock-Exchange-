import { Queue } from "bullmq"
import IORedis from "ioredis"

export const ORDER_EXECUTION_QUEUE_NAME = "order-execution"

export function createRedisConnection() {
  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    return new IORedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: "default",
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }

  if (process.env.REDIS_URL) {
    return new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }

  return new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })
}

const globalForBullMQ = global as unknown as {
  orderExecutionQueue: Queue | undefined
}

export const orderExecutionQueue: Queue =
  globalForBullMQ.orderExecutionQueue ??
  new Queue(ORDER_EXECUTION_QUEUE_NAME, {
    connection: createRedisConnection(),
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
    },
  })

if (!globalForBullMQ.orderExecutionQueue) {
  globalForBullMQ.orderExecutionQueue = orderExecutionQueue
}
