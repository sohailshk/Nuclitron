"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { languageService, supportedLanguages, type Language } from "@/services/languageService";

interface LanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
  className = "",
  variant = "ghost",
  size = "sm"
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [currentLanguageInfo, setCurrentLanguageInfo] = useState<Language | undefined>();

  useEffect(() => {
    const lang = languageService.getCurrentLanguage();
    setCurrentLanguage(lang);
    setCurrentLanguageInfo(languageService.getLanguageInfo(lang));
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    languageService.setLanguage(languageCode);
    setCurrentLanguage(languageCode);
    setCurrentLanguageInfo(languageService.getLanguageInfo(languageCode));
    
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`flex items-center space-x-2 ${className}`}>
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">
            {currentLanguageInfo?.flag} {currentLanguageInfo?.nativeName || 'English'}
          </span>
          <span className="sm:hidden">
            {currentLanguageInfo?.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 border-b border-gray-200">
          Select Language
        </div>
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-blue-50"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{language.name}</span>
                <span className="text-sm text-gray-500">{language.nativeName}</span>
              </div>
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        {/* Language Statistics */}
        <div className="border-t border-gray-200 mt-2 pt-2 px-2 py-1">
          <div className="text-xs text-gray-500 text-center">
            {supportedLanguages.length} languages supported
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
