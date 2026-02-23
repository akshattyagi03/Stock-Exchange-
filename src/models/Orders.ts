import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOrder extends Document {
  orderId: string;
  stockName: string;
  quantity: number;              
  price: number;
  orderType: "buy" | "sell";
  status: "pending" | "executed" | "cancelled";
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
      unique: true
    },

    stockName: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    orderType: {
      type: String,
      enum: ["buy", "sell"],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "executed", "cancelled"],
      default: "pending"
    },

    executedAt: {
      type: Date
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true   
  }
);


// Fast user order history lookup
OrderSchema.index({ user: 1 });

OrderSchema.index({
  stockName: 1,
  status: 1,
  orderType: 1,
  price: -1,
  createdAt: 1
});

const OrderModel =
  models.Order || model<IOrder>("Order", OrderSchema);

export default OrderModel;