import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { backendLogin } from "@/server/medistore-api";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  accessToken: string;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const res = await backendLogin(email, password);
        const { user, accessToken } = res.data;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user as AppUser;
      return token;
    },
    async session({ session, token }) {
      (session as any).user = token.user as AppUser | undefined;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
