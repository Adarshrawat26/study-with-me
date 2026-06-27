import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
    newUser: "/dashboard",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const protectedRoutes = [
        "/dashboard",
        "/labels",
        "/habits",
        "/goals",
        "/groups",
        "/leaderboard",
        "/ai-helper",
        "/study-plant",
        "/settings",
      ];
      const isProtected = protectedRoutes.some(
        (route) =>
          nextUrl.pathname === route ||
          nextUrl.pathname.startsWith(`${route}/`)
      );
      if (isProtected) return !!auth;
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) token.id = user.id;
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isPremium = token.isPremium as boolean;
        session.user.currentStreak = token.currentStreak as number;
        session.user.totalHours = token.totalHours as number;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
