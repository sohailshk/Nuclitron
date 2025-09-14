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
  Lightbulb,
  Image,
  AlertCircle
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant for ARGO oceanographic data. I can help you explore temperature profiles, salinity data, float locations, and generate high-quality visualizations using FLUX.1. What would you like to know?',
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        'Show me temperature profiles in the Arabian Sea',
        'Create an ocean temperature visualization',
        'Generate an image of ARGO float deployment',
        'What are the salinity levels near the equator?'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('hf_api_key') || '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';
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
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
      const enhancedPrompt = `${prompt}`;
      
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
            num_inference_steps: 50,
            width: 1024,
            height: 1024
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const needsImage = shouldGenerateImage(currentInput);
      
      if (needsImage) {
        // Call FLUX image generation API
        const { text, imageData } = await callHuggingFaceImageAPI(currentInput);
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: text || 'I\'ve generated a high-quality visualization using FLUX.1 based on your request.',
          timestamp: new Date().toLocaleTimeString(),
          imageData: imageData,
          hasImage: !!imageData,
          suggestions: [
            'Create another visualization',
            'Modify this image style',
            'Generate a different perspective',
            'Export this image'
          ]
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Call text API
        const aiResponse = await callHuggingFaceTextAPI(currentInput);
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString(),
          suggestions: generateSuggestions(currentInput)
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your API configuration.`,
        timestamp: new Date().toLocaleTimeString(),
        error: true,
        suggestions: [
          'Try rephrasing your question',
          'Check API key configuration',
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

  const quickActions = [
    { icon: Database, label: 'Data Query', action: 'Show me recent ARGO data' },
    { icon: Map, label: 'Map View', action: 'Create a map showing ARGO float locations' },
    { icon: BarChart3, label: 'Analytics', action: 'Analyze ocean temperature trends' },
    { icon: Image, label: 'Visualize', action: 'Create a temperature depth profile chart' },
    { icon: Download, label: 'Export', action: 'Export current data' }
  ];

  const sampleImageQueries = [
    'Create a temperature depth profile visualization',
    'Generate an ocean salinity distribution map',
    'Make a scientific chart showing ARGO float locations',
    'Visualize seasonal temperature variations in the ocean'
  ];

  return (
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
              Ask questions about ARGO data and generate high-quality visualizations powered by FLUX.1
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
                        <p className="text-sm text-muted-foreground">
                          {apiKey ? 'Online • Powered by FLUX.1-dev' : 'Offline • HF API key needed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const key = prompt('Enter your Hugging Face API key:', apiKey);
                          if (key) {
                            setApiKey(key);
                            localStorage.setItem('hf_api_key', key);
                          }
                        }}
                      >
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
                            : message.error
                            ? 'bg-red-500 text-white'
                            : 'bg-gradient-ocean text-white'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : message.error ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div className={`rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.error
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-muted'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          
                          {/* Generated Image */}
                          {message.hasImage && message.imageData && (
                            <div className="mt-3">
                              <img 
                                src={`data:image/png;base64,${message.imageData}`}
                                alt="FLUX.1 generated visualization"
                                className="max-w-full h-auto rounded-lg border shadow-lg"
                              />
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">Generated with FLUX.1-dev</p>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => downloadImage(message.imageData!, message.id)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp}
                            </span>
                            {message.type === 'bot' && !message.error && (
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => navigator.clipboard.writeText(message.content)}
                                >
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
                            <span className="text-sm">FLUX.1 is generating your response...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex space-x-2"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about ARGO data or request high-quality visualizations with FLUX.1..."
                      className="flex-1"
                      disabled={isLoading || !apiKey}
                    />
                    <Button 
                      type="submit"
                      disabled={!inputValue.trim() || isLoading || !apiKey}
                      className="btn-ocean"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                  {!apiKey && (
                    <p className="text-xs text-red-500 mt-2">
                      Hugging Face API key required. Click the settings icon to configure.
                    </p>
                  )}
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
                          disabled={!apiKey}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Sample Image Queries */}
              <Card className="card-ocean">
                <div className="p-4">
                  <h3 className="font-semibold text-primary-deep mb-4 flex items-center space-x-2">
                    <Image className="w-4 h-4" />
                    <span>FLUX.1 Generation</span>
                  </h3>
                  <div className="space-y-2">
                    {sampleImageQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleSuggestionClick(query)}
                        disabled={!apiKey}
                      >
                        <span className="text-xs">{query}</span>
                      </Button>
                    ))}
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
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>FLUX.1 Image AI</span>
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
  );
}