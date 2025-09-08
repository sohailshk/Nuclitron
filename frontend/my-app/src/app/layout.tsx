import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INCOIS ARGO - AI-Powered Ocean Data Platform",
  description: "Advanced AI-powered platform for accessing, analyzing, and visualizing ARGO oceanographic data through natural language queries and interactive dashboards. Official platform of Indian National Centre for Ocean Information Services.",
  keywords: "ARGO, ocean data, oceanography, INCOIS, AI, data visualization, ocean research, temperature, salinity, ocean monitoring",
  authors: [{ name: "INCOIS - Indian National Centre for Ocean Information Services" }],
  openGraph: {
    title: "INCOIS ARGO - AI-Powered Ocean Data Platform",
    description: "Advanced AI-powered platform for accessing, analyzing, and visualizing ARGO oceanographic data",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      {/*<header className="flex justify-end items-center p-4 gap-4 h-16">*/}
      {/*<SignedOut>*/}
      {/*  <SignInButton />*/}
      {/*  <SignUpButton>*/}
      {/*    <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">*/}
      {/*      Sign Up*/}
      {/*    </button>*/}
      {/*  </SignUpButton>*/}
      {/*</SignedOut>*/}
      {/*<SignedIn>*/}
      {/*  <UserButton />*/}
      {/*</SignedIn>*/}
    {/*</header>*/}
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
