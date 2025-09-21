import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import FloatingChatIcon from "@/components/FloatingChatIcon";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INCOIS ARGO - AI-Powered Ocean Data Platform",
  description: "AI-powered ARGO oceanographic data visualization platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
        {children}
        <FloatingChatIcon />
      </body>
    </html>
    </ClerkProvider>
  );
}