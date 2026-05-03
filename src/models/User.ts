import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    password: string;
    role: "user" | "admin";
    tier: "standard" | "premium";
    availableBalance: number;
    frozenBalance: number;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    isVerified: boolean;
    authProvider: "credentials" | "google";
    // Trading Preferences
    defaultOrderType: "market" | "limit";
    defaultQuantity: number;
    defaultExchange: "NSE" | "BSE";
    // Notifications
    orderExecutionAlerts: boolean;
    priceAlerts: boolean;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
            "Please enter a valid email address"
        ],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function (this: IUser): boolean {
            return this.authProvider === "credentials";
        }
    },
    authProvider: {
        type: String,
        enum: ["credentials", "google"],
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        index: true
    },
    tier: {
        type: String,
        enum: ["standard", "premium"],
        default: "standard",
        index: true
    },
    availableBalance: {
        type: Number,
        default: 999999,
        min: 0
    },
    frozenBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    verifyCode: {
        type: String
    },
    verifyCodeExpiry: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Trading Preferences
    defaultOrderType: {
        type: String,
        enum: ["market", "limit"],
        default: "market"
    },
    defaultQuantity: {
        type: Number,
        default: 1,
        min: 1
    },
    defaultExchange: {
        type: String,
        enum: ["NSE", "BSE"],
        default: "NSE"
    },
    // Notifications
    orderExecutionAlerts: {
        type: Boolean,
        default: false
    },
    priceAlerts: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const UserModel =
    models.User || model<IUser>("User", UserSchema);

export default UserModel;