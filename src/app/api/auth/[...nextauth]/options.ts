import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import GoogleProvider from "next-auth/providers/google";
export const AuthOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any, req): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials?.identifier },
                            { username: credentials?.identifier }
                        ]
                    });
                    if (!user) {
                        throw new Error("No user found with this email.");
                    }
                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login.");
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("Incorrect Password");
                    }
                } catch (err: any) {
                    throw new Error("");
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    callbacks: {

        async signIn({ user, account }) {
            if (account?.provider === "google") {

                await dbConnect();

                const existingUser = await UserModel.findOne({
                    email: user.email,
                });

                if (!existingUser) {
                    await UserModel.create({
                        email: user.email,
                        username: user.name,
                        image: user.image,
                        authProvider: "google",
                        isVerified: true,
                        walletBalance: 0,
                        holdings: [],
                    });
                }
            }

            return true;
        },

        async jwt({ token, user }) {

            await dbConnect();
            if (user?.email) {
                const dbUser = await UserModel.findOne({
                    email: user.email,
                });

                if (dbUser) {
                    token._id = dbUser._id.toString();
                    token.isVerified = dbUser.isVerified;
                    token.username = dbUser.username;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.username = token.username;
            }
            return session;
        }
    },
    pages: {
        signIn: '/sign-in',
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}