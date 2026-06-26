import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPremium?: boolean;
      currentStreak?: number;
      totalHours?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isPremium?: boolean;
    currentStreak?: number;
    totalHours?: number;
  }
}
