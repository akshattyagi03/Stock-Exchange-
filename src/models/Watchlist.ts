import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IWatchlistItem {
  instrumentKey: string;
  symbol: string;
  addedAt: Date;
}

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  stocks: IWatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistItemSchema = new Schema<IWatchlistItem>({
  instrumentKey: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one watchlist per user
    },

    stocks: [WatchlistItemSchema],
  },
  { timestamps: true }
);

export const Watchlist =
  models.Watchlist || model<IWatchlist>("Watchlist", WatchlistSchema);