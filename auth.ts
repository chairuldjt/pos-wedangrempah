import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                try {
                    const [rows]: any = await pool.query(
                        "SELECT * FROM users WHERE username = ? AND is_active = true",
                        [credentials.username]
                    );

                    const user = rows[0];

                    if (user && (await bcrypt.compare(credentials.password as string, user.password))) {
                        return {
                            id: user.id.toString(),
                            name: user.full_name,
                            email: user.email,
                            role: user.role,
                            username: user.username,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
});

