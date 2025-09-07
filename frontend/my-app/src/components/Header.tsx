"use client";

import { Button } from "@/components/ui/button";
import { Navigation } from "./Navigation";
import { useState } from "react";
import { Menu, X, Globe, Search, User, Database, BarChart3 } from "lucide-react";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-surface border-b border-border/50 shadow-subtle sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Government Top Bar */}
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Government of India</span>
            </span>
            <span className="text-border">|</span>
            <span>Ministry of Earth Sciences (MoES)</span>
            <span className="text-border">|</span>
            <span>INCOIS</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Button variant="ghost" size="sm" className="text-xs">हिन्दी</Button> 
            {/* toggle button  */}
         
          </div>
        </div>
        
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center ocean-wave shadow-ocean">
                <div className="text-2xl text-primary-foreground font-bold">🌊</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-deep">INCOIS ARGO</h1>
                 </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <Navigation />
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>Data</span>
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </Button>
            {/* <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Button> */}
            <Button className="btn-ocean hidden md:flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>Data Access</span>
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border/30 py-4">
            <Navigation />
            <div className="flex flex-col space-y-2 mt-4">
              <Button variant="ghost" size="sm" className="justify-start">
                <Search className="w-4 h-4 mr-2" />
                Search Data
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <Database className="w-4 h-4 mr-2" />
                Data Explorer
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button className="btn-ocean justify-start">
                <Database className="w-4 h-4 mr-2" />
                Data Access
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};