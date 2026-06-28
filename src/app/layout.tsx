import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { OnlineCounter } from "@/components/layout/OnlineCounter";
import { PageTransition } from "@/components/layout/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Study with me — your cute little pomodoro timer",
  description:
    "A soft pink pomodoro timer for cozy focus sessions. Start a timer, take breaks, track your streak, and grow your tiny study plant.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Study with me — your cute little pomodoro timer",
    description:
      "A soft pink pomodoro timer for cozy focus sessions. Start a timer, take breaks, track your streak, and grow your tiny study plant.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Study with me — your cute little pomodoro timer",
    description:
      "A soft pink pomodoro timer for cozy focus sessions. Start a timer, take breaks, track your streak, and grow your tiny study plant.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} antialiased`}>
        <Providers>
          <Navbar />
          <main className="relative z-10 min-h-[calc(100vh-4rem)]">
            <PageTransition>{children}</PageTransition>
          </main>
          <OnlineCounter />
        </Providers>
      </body>
    </html>
  );
}
