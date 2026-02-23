import {z} from "zod";

export const orderSchema = z.object({
    stockName: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0.01),
    orderType: z.enum(["buy", "sell"])
});