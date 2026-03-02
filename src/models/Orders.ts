import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOrder extends Document {
  orderId: string;
  stockName: string;
  quantity: number;             
  remainingQuantity: number;   
  executedQuantity: number;      
  price: number;                 
  executedPrice?: number;        
  orderType: "buy" | "sell";
  status: "pending" | "partially_executed" | "executed" | "cancelled";
  executedAt?: Date;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    stockName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    remainingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    executedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    executedPrice: {
      type: Number,
    },

    orderType: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "partially_executed",
        "executed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    executedAt: {
      type: Date,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ user: 1, createdAt: -1 });

OrderSchema.index({
  stockName: 1,
  status: 1,
  orderType: 1,
  price: 1,
  createdAt: 1,
});

const OrderModel =
  models.Order || model<IOrder>("Order", OrderSchema);

export default OrderModel;