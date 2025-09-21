"use client";

import { SignInButton, SignUpButton, SignOutButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Globe, Database } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hero } from "@/components/Hero";
import { FeaturesShowcase } from "@/components/FeaturesShowcase";
import { ArgoExplorer } from "@/components/ArgoExplorer";
import { AiChatInterface } from "@/components/AiChatInterface";
import { TechStack } from "@/components/TechStack";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";
import { DataOverview } from "@/components/DataOverview";
import { StatsSection } from "@/components/StatsSection";
 

export default function Home() {
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    // This will be handled by Clerk's authentication state
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Government Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Government of India</span>
              </span>
              <span className="text-gray-300">|</span>
              <span>Ministry of Earth Sciences (MoES)</span>
              <span className="text-gray-300">|</span>
              <span>INCOIS</span>
            </div>
            <div className="flex items-center space-x-3">
              <SignedOut>
                <SignInButton>
                  <button className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    Go to Dashboard
                  </Button>
                  <SignOutButton>
                    <Button 
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Sign out
                    </Button>
                  </SignOutButton>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      <main>
        <Hero />
        <FeaturesShowcase />
        <StatsSection />
        <Features />
        <DataOverview />
        <ArgoExplorer />
        <AiChatInterface />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
}
