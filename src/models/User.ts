import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    isVerified: boolean;
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
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, "Please enter a valid email address"],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    verifyCode: {
        type: String
    },
    verifyCodeExpiry: {
        type: Date
    },
    isVerified:{
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const UserModel =
    models.User || model<IUser>("User", UserSchema);

export default UserModel;