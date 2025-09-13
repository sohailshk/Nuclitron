"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  MessageCircle,
  Database,
  Map,
  BarChart3,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Settings,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  suggestions?: string[];
  data?: any;
}


export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant for ARGO oceanographic data. I can help you explore temperature profiles, salinity data, float locations, and much more. What would you like to know?',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Show me temperature profiles in the Arabian Sea',
        'What are the salinity levels near the equator?',
        'Find ARGO floats in the Indian Ocean',
        'Compare ocean data from last month'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputValue),
        timestamp: new Date().toISOString(),
        suggestions: [
          'Show more details about this data',
          'Compare with other regions',
          'Export this data',
          'Create a visualization'
        ]
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('temperature') && lowerQuery.includes('arabian sea')) {
      return `I found temperature data for the Arabian Sea region. The current surface temperature ranges from 28-32°C, with a thermocline at approximately 50-100m depth. The deep ocean temperature (below 1000m) remains relatively stable at 2-4°C. Would you like me to show you a detailed profile or compare with other regions?`;
    } else if (lowerQuery.includes('salinity') && lowerQuery.includes('equator')) {
      return `Salinity data near the equator shows interesting patterns. Surface salinity ranges from 34-36 PSU, with lower values in areas of high precipitation. The halocline is typically found at 100-200m depth. I can provide more specific data for particular regions or time periods.`;
    } else if (lowerQuery.includes('argo float') && lowerQuery.includes('indian ocean')) {
      return `There are currently 1,200+ active ARGO floats in the Indian Ocean region. They provide continuous monitoring of temperature, salinity, and pressure profiles. The floats cycle every 10 days, collecting data from surface to 2000m depth. Would you like to see their current locations on a map?`;
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('comparison')) {
      return `I can help you compare oceanographic data across different regions, time periods, or parameters. For example, I can compare temperature profiles between the Arabian Sea and Bay of Bengal, or show seasonal variations in salinity. What specific comparison would you like to make?`;
    } else {
      return `I understand you're asking about "${query}". I can help you with various oceanographic data queries including temperature profiles, salinity measurements, ARGO float locations, ocean currents, and climate patterns. Could you be more specific about what data you're looking for?`;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stops the default scroll/submit
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: Database, label: 'Data Query', action: 'Show me recent ARGO data' },
    { icon: Map, label: 'Map View', action: 'Display ARGO float locations' },
    { icon: BarChart3, label: 'Analytics', action: 'Analyze ocean trends' },
    { icon: Download, label: 'Export', action: 'Export current data' }
  ];

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-deep mb-2">
              AI Ocean Data Assistant
            </h1>
            <p className="text-muted-foreground">
              Ask questions about ARGO data in natural language and get instant insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="card-ocean h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-ocean flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-deep">ARGO AI Assistant</h3>
                        <p className="text-sm text-muted-foreground">Online • Ready to help</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <HelpCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gradient-ocean text-white'
                        }`}>
                          {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
  {message.timestamp}
</span>

                            {message.type === 'bot' && (
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* Suggestions */}
                          {message.suggestions && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs opacity-70">Suggestions:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-ocean flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* <div ref={messagesEndRef} /> */}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                <form
  onSubmit={(e) => {
    e.preventDefault(); // stop page scroll/reload
    handleSendMessage();
  }}
  className="flex space-x-2"
>
  <Input
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    placeholder="Ask about ARGO data, ocean temperatures, salinity, or float locations..."
    className="flex-1"
    disabled={isLoading}
  />
  <Button 
    type="submit"
    disabled={!inputValue.trim() || isLoading}
    className="btn-ocean"
  >
    <Send className="w-4 h-4" />
  </Button>
</form>


                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="card-ocean">
                <div className="p-4">
                  <h3 className="font-semibold text-primary-deep mb-4 flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Quick Actions</span>
                  </h3>
                  <div className="space-y-2">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleSuggestionClick(action.action)}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Sample Queries */}
              <Card className="card-ocean ">
                <div className="p-4  ">
                  <h3 className="font-semibold text-primary-deep mb-4">Sample Queries</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleSuggestionClick('Show temperature profiles in the Arabian Sea for the last 30 days')}
                    >
                      <span className="text-xs">Temperature profiles in Arabian Sea</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleSuggestionClick('What are the salinity levels in the Bay of Bengal?')}
                    >
                      <span className="text-xs">Salinity in Bay of Bengal</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleSuggestionClick('Find all ARGO floats near the equator')}
                    >
                      <span className="text-xs">ARGO floats near equator</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleSuggestionClick('Compare ocean data between Indian and Pacific Ocean')}
                    >
                      <span className="text-xs">Compare Indian vs Pacific</span>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Data Sources */}
              <Card className="card-ocean">
                <div className="p-4">
                  <h3 className="font-semibold text-primary-deep mb-4">Data Sources</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>ARGO Float Network</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>INCOIS Database</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Real-time Updates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Historical Archives</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

          <Footer />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}