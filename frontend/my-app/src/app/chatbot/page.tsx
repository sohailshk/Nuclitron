"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatApi } from "@/services/chatApi";
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
  Lightbulb,
  Image,
  AlertCircle,
  Sparkles,
  Activity,
  Globe,
  TrendingUp,
  Waves,
  Zap,
  Plus,
  MessageSquare
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { languageService } from "@/services/languageService";
import { translationService as translator } from "@/services/translationService";
import LanguageSelector from "@/components/LanguageSelector";
import { generateReport, ReportPreview, ReportData } from "@/components/ReportGenerator";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  suggestions?: string[];
  data?: any;
  error?: boolean;
  imageData?: string;
  hasImage?: boolean;
  reportData?: ReportData;
  showReport?: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant powered by our RAG system for ARGO oceanographic data. I can help you explore temperature profiles, salinity data, float locations, and generate high-quality visualizations using FLUX.1. Ask me anything about ocean data or request custom visualizations!',
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        'What is the current temperature in the Bay of Bengal?',
        'Explain the salinity patterns in the Indian Ocean',
        'How do ARGO floats collect oceanographic data?',
        'What are the latest observations from the Arabian Sea?',
        'Show me depth profiles for the South China Sea',
        'What critical advisories are active right now?',
        'Compare temperature trends across different regions',
        'Generate a report on recent ocean conditions'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('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'); // Hardcoded HF API key
  const [systemStatus, setSystemStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showSuggestedQueries, setShowSuggestedQueries] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize API key and language from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('hf_api_key') || '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';
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // Initialize language
    const currentLang = languageService.getCurrentLanguage();
    setCurrentLanguage(currentLang);
    
    // Update welcome message in user's language
    const welcomeMessage = languageService.translate('welcome', currentLang);
    const multilingualSuggestions = languageService.getMultilingualSuggestions('visualization');
    
    setMessages([{
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date().toLocaleTimeString(),
      suggestions: multilingualSuggestions
    }]);
  }, []);

  // Check system status
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const isConnected = await chatApi.testConnection();
        setSystemStatus(isConnected ? 'online' : 'offline');
      } catch (error) {
        setSystemStatus('offline');
      }
    };
    
    checkSystemStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const shouldGenerateImage = (prompt: string): boolean => {
    const imageKeywords = [
      'create', 'generate', 'make', 'draw', 'show', 'visualize', 'image', 
      'picture', 'chart', 'graph', 'map', 'diagram', 'illustration', 'plot'
    ];
    const lowerPrompt = prompt.toLowerCase();
    return imageKeywords.some(keyword => lowerPrompt.includes(keyword)) &&
           (lowerPrompt.includes('image') || lowerPrompt.includes('picture') || 
            lowerPrompt.includes('chart') || lowerPrompt.includes('visualization') ||
            lowerPrompt.includes('map') || lowerPrompt.includes('diagram'));
  };

  const callHuggingFaceImageAPI = async (prompt: string): Promise<{ text?: string, imageData?: string }> => {
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured. Please set your API key.');
    }

    try {
      // Enhance prompt for oceanographic visualizations
      const enhancedPrompt = `High-quality scientific visualization: ${prompt}. Professional oceanographic data visualization, clean scientific style, detailed charts and graphs, ocean research quality, ARGO float data visualization, marine science illustration, high resolution, professional scientific publication quality`;
      
      const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 30,
            width: 1024,
            height: 768
          }
        })
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Model is loading. Please try again in a few moments.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Hugging Face API key.');
        } else {
          const errorData = await response.text();
          throw new Error(`API Error: ${response.statusText} - ${errorData}`);
        }
      }

      const imageBlob = await response.blob();
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.readAsDataURL(imageBlob);
      });

      return { 
        text: `I've generated a high-quality visualization using FLUX.1 based on your request: "${prompt}"`,
        imageData: imageBase64 
      };
    } catch (error) {
      console.error('Hugging Face API Error:', error);
      throw error;
    }
  };

  const callHuggingFaceTextAPI = async (prompt: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured. Please set your API key.');
    }

    try {
      // Using a text generation model for oceanographic queries
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `You are an AI assistant specialized in ARGO oceanographic data analysis. You can help with temperature profiles, salinity measurements, ocean currents, climate patterns, and data visualization. Please respond to the following query in a helpful and informative way:

${prompt}

Provide detailed, accurate information about oceanographic data and concepts.`,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Text model is loading. Please try again in a few moments.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Hugging Face API key.');
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        return data[0].generated_text;
      } else {
        // Fallback response if the model format is different
        return `I can help you with ARGO oceanographic data analysis. Here's some information about your query "${prompt}":

ARGO floats are autonomous profiling floats that collect temperature and salinity data from the world's oceans. They provide crucial data for climate research and ocean monitoring.

For specific data analysis, I recommend:
1. Checking recent ARGO datasets
2. Analyzing temperature/salinity profiles
3. Comparing regional variations
4. Creating visualizations of the data

Would you like me to generate a visualization or provide more specific information about any aspect of oceanographic data?`;
      }
    } catch (error) {
      console.error('Hugging Face Text API Error:', error);
      throw error;
    }
  };

  // Helper function to format structured responses
  const formatResponseContent = (content: string) => {
    // Check if content contains structured formatting
    if (content.includes('**') || content.includes('📊') || content.includes('|')) {
      return (
        <div className="space-y-3">
          {content.split('\n').map((line, index) => {
            // Handle headers with **
            if (line.includes('**') && line.includes('**')) {
              const headerMatch = line.match(/\*\*(.*?)\*\*/);
              if (headerMatch) {
                return (
                  <div key={index} className="font-semibold text-gray-900 mt-4 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-base">{headerMatch[1]}</span>
                  </div>
                );
              }
            }
            
            // Handle emoji bullets and structured data
            if (line.includes('📊') || line.includes('🌡️') || line.includes('🧂') || line.includes('📍') || line.includes('🔬')) {
              return (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 my-3">
                  <span className="font-medium text-blue-800">{line}</span>
                </div>
              );
            }
            
            // Handle table-like data with |
            if (line.includes('|') && line.includes('----')) {
              return null; // Skip table separator lines
            }
            if (line.includes('|') && !line.includes('----')) {
              const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
              if (cells.length > 1) {
                return (
                  <div key={index} className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">
                    {cells.map((cell, cellIndex) => (
                      <div key={cellIndex} className={`${cellIndex === 0 ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {cell}
                      </div>
                    ))}
                  </div>
                );
              }
            }
            
            // Handle bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return (
                <div key={index} className="ml-4 text-gray-700 flex items-start gap-3">
                  <span className="text-blue-500 mt-1.5 text-xs">●</span>
                  <span className="leading-relaxed">{line.trim().substring(1).trim()}</span>
                </div>
              );
            }
            
            // Handle code blocks
            if (line.includes('```') || line.trim().startsWith('WMO') || line.trim().match(/^\d+m\s+\|/)) {
              return (
                <div key={index} className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-gray-700">
                  {line}
                </div>
              );
            }
            
            // Handle regular lines
            if (line.trim()) {
              return (
                <div key={index} className="text-gray-700 leading-relaxed">
                  {line}
                </div>
              );
            }
            
            return <div key={index} className="h-2"></div>; // Empty line spacing
          })}
        </div>
      );
    }
    
    // Fallback to simple text
    return <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</div>;
  };

  const generateReportId = () => {
    return `INCOIS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setShowSuggestedQueries(false);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    // Detect input language and translate if needed
    const detectedLanguage = languageService.detectLanguage(currentInput);
    let translatedInput = currentInput;

    try {
      // Check if user wants image generation
      const needsImage = shouldGenerateImage(currentInput);
      
      if (needsImage) {
        // Translate input to English for image generation if needed
        if (detectedLanguage !== 'en') {
          setIsTranslating(true);
          translatedInput = await translator.translateToEnglish(currentInput, detectedLanguage);
          setIsTranslating(false);
        }
        
        // Generate image using Hugging Face FLUX.1
        const { text, imageData } = await callHuggingFaceImageAPI(translatedInput);
        
        // Translate response back to user's language
        let responseText = text || 'I\'ve generated a high-quality oceanographic visualization using FLUX.1 based on your request.';
        if (currentLanguage !== 'en') {
          responseText = await translator.translateToUserLanguage(responseText, currentLanguage);
        }
        
        // Get multilingual suggestions
        const suggestions = languageService.getMultilingualSuggestions('visualization');
        
        // Check if user wants a report
        const wantsReport = /\b(report|generate.*report|create.*report|make.*report|pdf|document)\b/i.test(currentInput);
        
        // Create report data only if report is requested
        const reportData: ReportData | undefined = wantsReport ? {
          userQuery: currentInput,
          aiResponse: responseText,
          timestamp: new Date().toISOString(),
          reportId: generateReportId(),
          analysisType: 'Visualization Generation',
          imageData: imageData
        } : undefined;
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: responseText,
          timestamp: new Date().toLocaleTimeString(),
          imageData: imageData,
          hasImage: !!imageData,
          suggestions: suggestions,
          reportData: reportData,
          showReport: wantsReport
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Translate input to English for processing if needed
        if (detectedLanguage !== 'en') {
          setIsTranslating(true);
          translatedInput = await translator.translateToEnglish(currentInput, detectedLanguage);
          setIsTranslating(false);
        }
        
        // Use our ChatAPI service to call the FastAPI backend for text responses
        const chatResponse = await chatApi.sendMessage(translatedInput);
        
        // Translate response back to user's language
        let responseText = chatResponse.response_text;
        if (currentLanguage !== 'en') {
          responseText = await translator.translateToUserLanguage(responseText, currentLanguage);
        }
        
        // Get multilingual suggestions based on the query type
        const suggestionCategory = currentInput.toLowerCase().includes('temperature') ? 'temperature' : 
                                 currentInput.toLowerCase().includes('salinity') ? 'salinity' : 'visualization';
        const suggestions = languageService.getMultilingualSuggestions(suggestionCategory);
        
        // Check if user wants a report
        const wantsReport = /\b(report|generate.*report|create.*report|make.*report|pdf|document)\b/i.test(currentInput);
        
        // Create report data for text responses only if report is requested
        const reportData: ReportData | undefined = wantsReport ? {
          userQuery: currentInput,
          aiResponse: responseText,
          timestamp: new Date().toISOString(),
          reportId: generateReportId(),
          analysisType: suggestionCategory.charAt(0).toUpperCase() + suggestionCategory.slice(1) + ' Analysis',
          dataPoints: chatResponse.data_results?.length || 0
        } : undefined;
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: responseText,
          timestamp: new Date().toLocaleTimeString(),
          suggestions: suggestions,
          data: chatResponse.data_results,
          reportData: reportData,
          showReport: wantsReport
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the API server is running on port 8000.`,
        timestamp: new Date().toLocaleTimeString(),
        error: true,
        suggestions: [
          'Try rephrasing your question',
          'Check if the API server is running',
          'Ask about ARGO data basics',
          'Request help with oceanographic terms'
        ]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('temperature')) {
      return [
        'Show temperature depth profiles',
        'Create a temperature visualization',
        'Compare temperatures across regions',
        'Analyze seasonal temperature changes'
      ];
    } else if (lowerQuery.includes('salinity')) {
      return [
        'Show salinity variations',
        'Generate a salinity map',
        'Compare with global averages',
        'Analyze salinity trends'
      ];
    } else if (lowerQuery.includes('visualization') || lowerQuery.includes('chart') || lowerQuery.includes('image')) {
      return [
        'Create another type of chart',
        'Modify visualization parameters',
        'Export this visualization',
        'Show data table'
      ];
    } else {
      return [
        'Show more details about this data',
        'Create a visualization',
        'Compare with other regions',
        'Export this data'
      ];
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestedQueries(false);
  };

  const handleLanguageChange = async (languageCode: string) => {
    setCurrentLanguage(languageCode);
    
    // Update welcome message in new language
    const welcomeMessage = languageService.translate('welcome', languageCode);
    const multilingualSuggestions = languageService.getMultilingualSuggestions('visualization');
    
    setMessages([{
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date().toLocaleTimeString(),
      suggestions: multilingualSuggestions
    }]);
  };

  const downloadImage = (imageData: string, messageId: string) => {
    try {
      const byteCharacters = atob(imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flux-ocean-visualization-${messageId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleGenerateReport = (reportData: ReportData) => {
    generateReport(
      reportData,
      (success: boolean, error?: Error) => {
        if (success) {
          console.log('Report generated successfully');
        } else {
          console.error('Report generation failed:', error);
        }
      }
    );
  };

  const suggestedQueries = [
    {
      icon: Database,
      title: "Ocean Data Analysis",
      query: "What is the current temperature in the Bay of Bengal?",
      description: "Get real-time oceanographic measurements",
    },
    {
      icon: BarChart3,
      title: "Regional Comparison",
      query: "Compare salinity levels between Arabian Sea and Indian Ocean",
      description: "Analyze differences across ocean regions",
    },
    {
      icon: Waves,
      title: "ARGO Float Info",
      query: "How do ARGO floats collect oceanographic data?",
      description: "Learn about autonomous ocean monitoring",
    },
    {
      icon: Globe,
      title: "Critical Advisories",
      query: "What are the current critical advisories for the Indian Ocean?",
      description: "Check active alerts and warnings",
    },
    {
      icon: Map,
      title: "Depth Profiles",
      query: "Show me depth profiles for the South China Sea",
      description: "Explore temperature and salinity by depth",
    },
    {
      icon: Image,
      title: "Generate Report",
      query: "Generate a comprehensive report on recent ocean conditions",
      description: "Create detailed oceanographic analysis report",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white z-10">
        <div className="p-4">
          <Button
            onClick={() => {
              setMessages([]);
              setShowSuggestedQueries(true);
            }}
            className="w-full mb-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          <div className="space-y-2">
            <div className="text-xs uppercase text-gray-400 font-medium px-3 py-2">
              Recent Chats
            </div>
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded cursor-pointer">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Temperature Analysis
              </div>
              <div className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded cursor-pointer">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Salinity Profiles
              </div>
              <div className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded cursor-pointer">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                ARGO Float Data
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const key = prompt("Enter your Hugging Face API key:", apiKey);
              if (key) {
                setApiKey(key);
                localStorage.setItem("hf_api_key", key);
              }
            }}
            className="w-full text-gray-300 hover:bg-gray-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {languageService.translate('oceanData', currentLanguage)} {languageService.translate('assistant', currentLanguage) || 'Assistant'}
                </h2>
                <p className="text-sm text-gray-500">
                  {apiKey
                    ? `${languageService.translate('online', currentLanguage)} • Powered by FLUX.1 ${isTranslating ? '• Translating...' : ''}`
                    : "Configure API key to get started"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSelector 
                onLanguageChange={handleLanguageChange}
                variant="ghost"
                size="sm"
              />
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Container - Now with bottom padding for fixed input */}
        <div className="flex-1 overflow-hidden pb-20">
          <div
            ref={messagesContainerRef}
            className="h-full overflow-y-auto px-6 py-4"
          >
            {messages.length === 1 && showSuggestedQueries ? (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    How can I help you today?
                  </h1>
                  <p className="text-gray-600">
                    Ask questions about ARGO oceanographic data or generate
                    visualizations
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {suggestedQueries.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Card
                        key={index}
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow border-gray-200 hover:border-blue-300"
                        onClick={() => handleSuggestionClick(item.query)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex space-x-4 ${
                      message.type === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.type === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`flex-1 ${
                        message.type === "user" ? "max-w-xs" : ""
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.type === "user"
                            ? "bg-blue-600 text-white ml-auto"
                            : message.error
                            ? "bg-red-50 border border-red-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="text-sm">
                          {message.type === 'user' ? message.content : formatResponseContent(message.content)}
                        </div>

                        {/* Generated Image */}
                        {message.hasImage && message.imageData && (
                          <div className="mt-3">
                            <img
                              src={`data:image/png;base64,${message.imageData}`}
                              alt="Generated visualization"
                              className="max-w-full h-auto rounded-lg border shadow-sm"
                            />
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500">
                                Generated with FLUX.1
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  downloadImage(message.imageData!, message.id)
                                }
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Report Generation */}
                        {message.showReport && message.reportData && (
                          <div className="mt-4">
                            <ReportPreview 
                              data={message.reportData}
                              onGenerateReport={() => handleGenerateReport(message.reportData!)}
                            />
                          </div>
                        )}

                        {message.type === "bot" && !message.error && (
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">
                              {message.timestamp}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  navigator.clipboard.writeText(message.content)
                                }
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" />
                              Suggestions
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8 px-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
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

                    {message.type === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex space-x-4 animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg px-4 py-3 border border-blue-100 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-blue-700 font-medium">
                          {isTranslating ? 'Translating...' : 'Analyzing oceanographic data...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-gray-200 px-6 py-4 z-20">
          <div className="max-w-4xl mx-auto">
            {/* Quick Action Buttons */}
            {apiKey && (
              <div className="flex flex-wrap gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("What's the current temperature in the Arabian Sea?")}
                  className="text-xs h-7 px-2 quick-action-btn hover:bg-blue-50 hover:border-blue-300"
                  disabled={isLoading}
                >
                  🌡️ Temperature
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("Show me salinity levels in the Bay of Bengal")}
                  className="text-xs h-7 px-2 quick-action-btn hover:bg-green-50 hover:border-green-300"
                  disabled={isLoading}
                >
                  🧂 Salinity
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("What are the current critical advisories?")}
                  className="text-xs h-7 px-2 quick-action-btn hover:bg-red-50 hover:border-red-300"
                  disabled={isLoading}
                >
                  🚨 Alerts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("Compare ocean conditions across regions")}
                  className="text-xs h-7 px-2 quick-action-btn hover:bg-purple-50 hover:border-purple-300"
                  disabled={isLoading}
                >
                  📊 Compare
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("Generate a comprehensive report on current ocean conditions")}
                  className="text-xs h-7 px-2 quick-action-btn hover:bg-orange-50 hover:border-orange-300"
                  disabled={isLoading}
                >
                  📋 Report
                </Button>
              </div>
            )}
            
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  apiKey
                    ? languageService.translate('typeMessage', currentLanguage)
                    : "Configure API key to get started..."
                }
                className="pr-12 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading || !apiKey}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="submit"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !apiKey}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {!apiKey && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Click Settings in the sidebar to configure your Hugging Face API
                key
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        
        .message-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .quick-action-btn:hover {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}