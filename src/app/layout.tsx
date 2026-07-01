import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Timesheet Management App",
  description: "Track tasks, log hours, and manage weekly timesheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50/50 flex flex-col font-sans">
        <NextAuthSessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
