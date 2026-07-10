import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper"; // Fixed relative import path

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindSprint AI",
  description: "Dynamic AI Assessment & Competitive Leaderboard Engine",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MindSprint AI",
  },
  icons: {
    apple: "/icon-512.png", // Crisp high-res splash icon target for Apple device home screens
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50/60 transition-colors duration-200">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased text-slate-900 dark:text-slate-100 dark:bg-slate-950 selection:bg-indigo-500/10 flex flex-col`}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}