import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IHolding extends Document {
  user: mongoose.Types.ObjectId;
  stockName: string;
  availableQuantity: number;
  frozenQuantity: number;
  averageBuyPrice: number;
}

const HoldingSchema = new Schema<IHolding>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stockName: {
      type: String,
      required: true,
      trim: true,
    },
    availableQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    frozenQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageBuyPrice: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

HoldingSchema.index({ user: 1, stockName: 1 }, { unique: true });

const HoldingModel =
  models.Holding || model<IHolding>("Holding", HoldingSchema);

export default HoldingModel;