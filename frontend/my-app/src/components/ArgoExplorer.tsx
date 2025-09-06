import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ArgoExplorer = () => {
  return (
    <section className="py-16 bg-gradient-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary-deep mb-4">ARGO Data Explorer</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Interactive visualization and analysis tools for oceanographic data from autonomous ARGO floats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Map Visualization */}
          <div className="lg:col-span-2">
            <Card className="h-[500px] shadow-ocean">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Global ARGO Float Distribution
                  <Badge variant="secondary" className="bg-primary-light text-primary-deep">
                    Real-time
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Interactive map showing active ARGO floats and their latest data collection points
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="w-full h-full bg-gradient-to-br from-primary-light to-accent/20 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/30">
                  <div className="text-center space-y-4">
                    <div className="text-6xl ocean-wave">🗺️</div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary-deep">Interactive Ocean Map</h3>
                      <p className="text-muted-foreground">Real-time ARGO float positions and data</p>
                      <Button variant="ocean" className="mt-4">Launch Map Viewer</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Controls */}
          <div className="space-y-6">
            {/* Search & Filters */}
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle>Data Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Region</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" size="sm">Indian Ocean</Button>
                    <Button variant="outline" size="sm">Arabian Sea</Button>
                    <Button variant="outline" size="sm">Bay of Bengal</Button>
                    <Button variant="outline" size="sm">Global</Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parameters</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-chart-temperature text-white">Temperature</Badge>
                    <Badge className="bg-chart-salinity text-white">Salinity</Badge>
                    <Badge className="bg-chart-depth text-white">Depth</Badge>
                    <Badge className="bg-chart-bgc text-white">BGC</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Data */}
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle>Latest Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "2901234", location: "Arabian Sea", time: "2h ago", temp: "24.5°C" },
                    { id: "2901235", location: "Bay of Bengal", time: "4h ago", temp: "26.2°C" },
                    { id: "2901236", location: "Indian Ocean", time: "6h ago", temp: "23.1°C" }
                  ].map((profile) => (
                    <div key={profile.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{profile.id}</div>
                        <div className="text-xs text-muted-foreground">{profile.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{profile.temp}</div>
                        <div className="text-xs text-muted-foreground">{profile.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">View All Profiles</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Visualization Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card className="shadow-subtle data-float">
            <CardHeader>
              <CardTitle>Temperature Profiles</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <div className="w-full h-full bg-gradient-to-b from-chart-temperature/20 to-chart-temperature/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl">📊</div>
                  <p className="text-sm text-muted-foreground mt-2">Temperature vs Depth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-subtle data-float">
            <CardHeader>
              <CardTitle>Salinity Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <div className="w-full h-full bg-gradient-to-b from-chart-salinity/20 to-chart-salinity/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl">🧂</div>
                  <p className="text-sm text-muted-foreground mt-2">Salinity Measurements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-subtle data-float">
            <CardHeader>
              <CardTitle>BGC Parameters</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <div className="w-full h-full bg-gradient-to-b from-chart-bgc/20 to-chart-bgc/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl">🔬</div>
                  <p className="text-sm text-muted-foreground mt-2">Bio-Geo-Chemical Data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};