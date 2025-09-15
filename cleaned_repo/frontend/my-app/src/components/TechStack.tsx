import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const TechStack = () => {
  const technologies = [
    {
      category: "AI & Machine Learning",
      items: [
        { name: "GPT-4 & LLaMA", description: "Large Language Models for natural language processing" },
        { name: "RAG Pipeline", description: "Retrieval-Augmented Generation for accurate responses" },
        { name: "Vector Database", description: "FAISS/Chroma for semantic search" },
        { name: "Model Context Protocol", description: "MCP for structured AI interactions" }
      ],
      color: "bg-chart-temperature"
    },
    {
      category: "Data Processing",
      items: [
        { name: "NetCDF Processing", description: "Automated ingestion of ARGO float data" },
        { name: "PostgreSQL", description: "Structured storage for oceanographic data" },
        { name: "Parquet Format", description: "Optimized columnar data storage" },
        { name: "Real-time ETL", description: "Continuous data pipeline processing" }
      ],
      color: "bg-chart-salinity"
    },
    {
      category: "Visualization",
      items: [
        { name: "Interactive Maps", description: "Plotly & Leaflet for geospatial visualization" },
        { name: "Ocean Profiles", description: "Depth-time plots and profile comparisons" },
        { name: "Statistical Charts", description: "Advanced data analysis visualizations" },
        { name: "Real-time Updates", description: "Live data streaming and updates" }
      ],
      color: "bg-chart-depth"
    },
    {
      category: "Infrastructure",
      items: [
        { name: "Scalable Backend", description: "High-performance data processing" },
        { name: "API Gateway", description: "Secure and efficient data access" },
        { name: "Cloud Storage", description: "Distributed data storage system" },
        { name: "Load Balancing", description: "Optimized for concurrent users" }
      ],
      color: "bg-chart-bgc"
    }
  ];

  return (
    <section className="py-16 bg-gradient-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-deep mb-4">Technology Stack</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built with cutting-edge AI and data processing technologies for robust oceanographic research
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {technologies.map((tech, index) => (
            <Card key={index} className="shadow-ocean data-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${tech.color}`}></div>
                  {tech.category}
                </CardTitle>
                <CardDescription>
                  Advanced technologies powering our ocean data platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tech.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-4 border-primary-light pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-primary-deep">{item.name}</h4>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Architecture Overview */}
        <Card className="mt-12 shadow-depth">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">System Architecture</CardTitle>
            <CardDescription>
              End-to-end pipeline from ARGO data ingestion to AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center items-center gap-4 py-8">
              {[
                "NetCDF Data → Processing Pipeline → PostgreSQL/Vector DB → AI Models → Web Interface",
              ].map((flow, index) => (
                <div key={index} className="bg-gradient-ocean text-primary-foreground px-6 py-3 rounded-full text-sm font-medium">
                  {flow}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl mb-2">📡</div>
                <h4 className="font-semibold">Data Ingestion</h4>
                <p className="text-sm text-muted-foreground">ARGO NetCDF files</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-semibold">Processing</h4>
                <p className="text-sm text-muted-foreground">ETL & Validation</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-semibold">AI Analysis</h4>
                <p className="text-sm text-muted-foreground">LLM + RAG</p>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold">Visualization</h4>
                <p className="text-sm text-muted-foreground">Interactive UI</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};