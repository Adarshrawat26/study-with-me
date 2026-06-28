import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
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
  },
} satisfies NextAuthConfig;
