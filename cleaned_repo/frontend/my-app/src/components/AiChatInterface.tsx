"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {useRouter} from 'next/navigation'

export const AiChatInterface = () => {
    const router = useRouter();
  const exampleQueries = [
    "Show me salinity profiles near the equator in March 2023",
    "Compare BGC parameters in the Arabian Sea for the last 6 months", 
    "What are the nearest ARGO floats to coordinates 15°N, 68°E?",
    "Display temperature anomalies in the Bay of Bengal this year"
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-deep mb-4">AI-Powered Ocean Data Assistant</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ask questions in natural language and get instant insights from ARGO oceanographic data
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] shadow-ocean">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center ocean-pulse">
                      <span className="text-sm text-white">🤖</span>
                    </div>
                    Ocean Data AI Assistant
                    <Badge className="bg-accent text-accent-foreground">Beta</Badge>
                  </CardTitle>
                  <CardDescription>
                    Powered by advanced LLMs with Retrieval-Augmented Generation (RAG)
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] flex flex-col">
                  {/* Chat Messages Area */}
                  <div className="flex-1 bg-secondary/30 rounded-lg p-4 mb-4 overflow-y-auto">
                    <div className="space-y-4">
                      {/* AI Welcome Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-white">🤖</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-subtle max-w-md">
                          <p className="text-sm">
                            Hello! I'm your Ocean Data AI Assistant. I can help you explore ARGO float data using natural language queries. 
                            What would you like to discover about our oceans today?
                          </p>
                        </div>
                      </div>
                      
                      {/* Sample User Query */}
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-subtle max-w-md">
                          <p className="text-sm">
                            Show me temperature profiles in the Arabian Sea from the last month
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">👤</span>
                        </div>
                      </div>
                      
                      {/* AI Response with Data */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-ocean rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-white">🤖</span>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-subtle max-w-lg">
                          <p className="text-sm mb-3">
                            I found 47 temperature profiles from 12 active ARGO floats in the Arabian Sea from the past month. 
                            Here&#39;s what the data shows:
                          </p>
                          <div className="bg-gradient-to-r from-chart-temperature/20 to-chart-temperature/5 p-3 rounded border-l-4 border-chart-temperature">
                            <p className="text-xs font-medium">Key Findings:</p>
                            <p className="text-xs">• Average surface temp: 26.8°C</p>
                            <p className="text-xs">• Thermocline depth: ~75m</p>
                            <p className="text-xs">• Temperature range: 14.2°C - 28.1°C</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="flex gap-2 ">
                    {/*<div className="flex-1 bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">*/}


                    {/*</div>*/}

                          <input
                          placeholder=' Type your ocean data question here...'
                          type='text'
                          className='w-[650px]'
                      />


                      <Button onClick={() => { router.push('/chatbot')}} variant="ocean">Send</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Features & Examples */}
            <div className="space-y-6">
              {/* AI Capabilities */}
              <Card className="shadow-subtle">
                <CardHeader>
                  <CardTitle className="text-lg">AI Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="w-2 h-2 p-0 bg-chart-temperature"></Badge>
                    Natural Language Processing
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="w-2 h-2 p-0 bg-chart-salinity"></Badge>
                    Geospatial Query Understanding
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="w-2 h-2 p-0 bg-chart-depth"></Badge>
                    Temporal Analysis
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="w-2 h-2 p-0 bg-chart-bgc"></Badge>
                    Statistical Insights
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="w-2 h-2 p-0 bg-accent"></Badge>
                    Data Visualization
                  </div>
                </CardContent>
              </Card>

              {/* Example Queries */}
              <Card className="shadow-subtle">
                <CardHeader>
                  <CardTitle className="text-lg">Try These Questions</CardTitle>
                  <CardDescription>Click any example to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {exampleQueries.map((query, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full text-left justify-start h-auto p-3 text-wrap text-sm hover:bg-primary-light/20"
                    >
                      "{query}"
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-subtle">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    📍 Find Nearby Floats
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📊 Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    💾 Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🔄 Compare Profiles
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};