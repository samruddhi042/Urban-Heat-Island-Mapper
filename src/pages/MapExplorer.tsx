import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, Polygon } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Heart, Leaf, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const API_BASE = "http://127.0.0.1:8000";

const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 19.0,
  lng: 76.0,
};

const MapExplorer = () => {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    uhi: true,
    health: true,
    vegetation: true,
  });
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch clusters from API
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await fetch(`${API_BASE}/map/clusters`);
        if (!response.ok) throw new Error("Failed to fetch clusters");
        const data = await response.json();
        setClusters(data);
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load cluster data. Using default data.",
          variant: "destructive",
        });
        // Fallback to default clusters
        setClusters([
          {
            name: "Mumbai",
            coords: { lat: 19.076, lng: 72.8777 },
            uhiScore: 8.5,
            healthRisk: 7.2,
            vegetation: 22,
            zone: "hot",
            boundary: [
              { lat: 19.5, lng: 72.5 },
              { lat: 19.5, lng: 73.5 },
              { lat: 18.6, lng: 73.5 },
              { lat: 18.6, lng: 72.5 },
            ],
          },
          {
            name: "Pune",
            coords: { lat: 18.5204, lng: 73.8567 },
            uhiScore: 7.8,
            healthRisk: 6.5,
            vegetation: 28,
            zone: "moderately-hot",
            boundary: [
              { lat: 19.0, lng: 73.4 },
              { lat: 19.0, lng: 74.6 },
              { lat: 18.0, lng: 74.6 },
              { lat: 18.0, lng: 73.4 },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, [toast]);

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case "hot":
        return "#dc2626"; // red-600
      case "moderately-hot":
        return "#f97316"; // orange-500
      case "warm":
        return "#facc15"; // yellow-400
      case "cold":
        return "#22c55e"; // green-500
      default:
        return "#3b82f6"; // blue-500
    }
  };

  const getMarkerColor = (zone: string) => {
    switch (zone) {
      case "hot":
        return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
      case "moderately-hot":
        return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
      case "warm":
        return "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
      case "cold":
        return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
      default:
        return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    }
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleClusterSelect = (clusterName: string) => {
    setSelectedCluster(clusterName);
    setActiveMarker(clusterName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center animate-scale-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent animate-pulse-glow">
            Interactive Heat Map Explorer
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore Urban Heat Island patterns across Maharashtra with real-time data visualization
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm">Hot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-sm">Moderately Hot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-sm">Warm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm">Cold</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with cluster list */}
          <Card className="lg:col-span-1 hover:shadow-lg transition-all duration-300 animate-slide-in-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary animate-bounce" />
                Regional Clusters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {clusters.map((cluster, index) => (
                <Button
                  key={cluster.name}
                  variant={selectedCluster === cluster.name ? "default" : "outline"}
                  className="w-full justify-start transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleClusterSelect(cluster.name)}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      cluster.zone === "hot"
                        ? "bg-red-500"
                        : cluster.zone === "moderately-hot"
                        ? "bg-orange-500"
                        : cluster.zone === "warm"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    } animate-pulse`}
                  ></div>
                  {cluster.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Main map container */}
          <div className="lg:col-span-3 space-y-4 animate-slide-in-right">
            {/* Layer controls */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant={activeLayers.uhi ? "default" : "outline"}
                    onClick={() => toggleLayer("uhi")}
                    className="flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Flame className={`h-4 w-4 ${activeLayers.uhi ? "animate-pulse" : ""}`} />
                    UHI Intensity
                  </Button>
                  <Button
                    variant={activeLayers.health ? "default" : "outline"}
                    onClick={() => toggleLayer("health")}
                    className="flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Heart className={`h-4 w-4 ${activeLayers.health ? "animate-pulse" : ""}`} />
                    Health Risk
                  </Button>
                  <Button
                    variant={activeLayers.vegetation ? "default" : "outline"}
                    onClick={() => toggleLayer("vegetation")}
                    className="flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Leaf className={`h-4 w-4 ${activeLayers.vegetation ? "animate-pulse" : ""}`} />
                    Vegetation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={7}
                  options={{
                    restriction: {
                      latLngBounds: {
                        north: 22.0,
                        south: 15.6,
                        west: 72.6,
                        east: 80.9,
                      },
                      strictBounds: false,
                    },
                    styles: [
                      {
                        featureType: "all",
                        elementType: "geometry",
                        stylers: [{ color: "#1a1a2e" }],
                      },
                      {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#0f172a" }],
                      },
                      {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#374151" }],
                      },
                    ],
                  }}
                >
                  {/* Heat Zone Polygons */}
                  {clusters.map((cluster) => (
                    <React.Fragment key={`${cluster.name}-zone`}>
                      <Polygon
                        paths={cluster.boundary}
                        options={{
                          fillColor: getZoneColor(cluster.zone),
                          fillOpacity: activeLayers.uhi ? 0.4 : 0.2,
                          strokeColor: getZoneColor(cluster.zone),
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                        }}
                        onClick={() => handleClusterSelect(cluster.name)}
                      />
                    </React.Fragment>
                  ))}

                  {/* Markers */}
                  {clusters.map((cluster) => (
                    <Marker
                      key={cluster.name}
                      position={cluster.coords}
                      onClick={() => handleClusterSelect(cluster.name)}
                      icon={
                        typeof google !== 'undefined'
                          ? {
                              url: getMarkerColor(cluster.zone),
                              scaledSize: new google.maps.Size(40, 40),
                            }
                          : undefined
                      }
                      animation={
                        activeMarker === cluster.name && typeof google !== 'undefined'
                          ? google.maps.Animation.BOUNCE
                          : undefined
                      }
                    >
                      {activeMarker === cluster.name && (
                        <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                          <div className="p-2">
                            <h3 className="font-bold text-lg mb-2">{cluster.name}</h3>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-semibold">Zone:</span>{" "}
                                <span className="capitalize">{cluster.zone.replace("-", " ")}</span>
                              </p>
                              <p>
                                <span className="font-semibold">UHI Score:</span>{" "}
                                {cluster.uhiScore}/10
                              </p>
                              <p>
                                <span className="font-semibold">Health Risk:</span>{" "}
                                {cluster.healthRisk}/10
                              </p>
                              <p>
                                <span className="font-semibold">Vegetation:</span>{" "}
                                {cluster.vegetation}%
                              </p>
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  ))}

                </GoogleMap>
              </LoadScript>
            </Card>

            {/* Cluster insights panel */}
            {selectedCluster && (
              <Card className="border-primary/20 hover:shadow-xl transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary animate-pulse" />
                    Cluster Insights: {selectedCluster}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 p-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center gap-2 text-destructive">
                        <Flame className="h-5 w-5 animate-pulse" />
                        <span className="font-semibold">UHI Score</span>
                      </div>
                      <p className="text-3xl font-bold">
                        {clusters.find((c) => c.name === selectedCluster)?.uhiScore}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center gap-2 text-orange-500">
                        <Heart className="h-5 w-5 animate-pulse" />
                        <span className="font-semibold">Health Risk</span>
                      </div>
                      <p className="text-3xl font-bold">
                        {clusters.find((c) => c.name === selectedCluster)?.healthRisk}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center gap-2 text-green-500">
                        <Leaf className="h-5 w-5 animate-pulse" />
                        <span className="font-semibold">Vegetation %</span>
                      </div>
                      <p className="text-3xl font-bold">
                        {clusters.find((c) => c.name === selectedCluster)?.vegetation}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
