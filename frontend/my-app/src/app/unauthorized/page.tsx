"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <div className="mb-8">
              <Shield className="w-24 h-24 mx-auto text-red-500 mb-6" />
              <h1 className="text-4xl font-bold text-primary-deep mb-4">
                Access Denied
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                If you believe this is an error, please contact your administrator.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/')}
                className="btn-ocean flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
