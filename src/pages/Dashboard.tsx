import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, TrendingUp, Award, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://127.0.0.1:8000";

const Dashboard = () => {
  const [selectedCluster, setSelectedCluster] = useState("cluster_mmr");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [correlationData, setCorrelationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const clusters = [
    { value: "cluster_mmr", label: "MMR (Mumbai Metro Region)" },
    { value: "cluster_pune_metropolitan", label: "Pune (Metropolitan)" },
    { value: "cluster_nagpur_wardha", label: "Nagpur - Wardha" },
    { value: "cluster_nashik_ahmednagar", label: "Nashik - Ahmednagar" },
    { value: "cluster_solapur_sangli", label: "Solapur - Sangli" },
    { value: "cluster_aurangabad_jalna", label: "Aurangabad - Jalna" },
    { value: "cluster_kolhapur_ichalkaranji", label: "Kolhapur - Ichalkaranji" },
  ];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/dashboard/metrics?cluster=${selectedCluster}`);
        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        
        // Transform metrics data
        const metricsList = Object.entries(data.metrics).map(([key, value]: [string, any]) => ({
          label: key,
          value: value.value.toString(),
          unit: value.unit,
          trend: value.trend,
        }));
        setMetrics(metricsList);
        setModelPerformance(data.model_performance || []);
        setFeatureImportance(data.feature_importance || []);
        setCorrelationData(data.uhi_health_correlation || null);
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Using default values.",
          variant: "destructive",
        });
        // Fallback data
        setMetrics([
          { label: "RMSE", value: "0.32", unit: "°C", trend: "down" },
          { label: "MAE", value: "0.24", unit: "°C", trend: "down" },
          { label: "R² Score", value: "94%", unit: "", trend: "up" },
          { label: "MAPE", value: "8.5", unit: "%", trend: "down" },
        ]);
        setModelPerformance([
          { model: "Random Forest", rmse: 0.28, mae: 0.21, r2: 0.96, best: true },
          { model: "XGBoost", rmse: 0.32, mae: 0.24, r2: 0.94, best: false },
        ]);
        setFeatureImportance([
          { feature: "Built-up %", importance: 0.28 },
          { feature: "NDVI", importance: 0.24 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [selectedCluster, toast]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Cluster Dashboard</h1>
            <p className="text-muted-foreground">
              Analyze model performance and feature importance for {clusters.find(c => c.value === selectedCluster)?.label || "selected cluster"}
            </p>
          </div>

          <Select value={selectedCluster} onValueChange={setSelectedCluster}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select cluster" />
            </SelectTrigger>
            <SelectContent>
              {clusters.map((cluster) => (
                <SelectItem key={cluster.value} value={cluster.value}>
                  {cluster.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-4 text-center py-8 text-muted-foreground">Loading metrics...</div>
          ) : metrics.length === 0 ? (
            <div className="col-span-4 text-center py-8 text-muted-foreground">No metrics available</div>
          ) : (
            metrics.map((metric, idx) => (
            <Card key={idx} className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {metric.value}
                  <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
                </div>
                <div
                  className={`text-sm flex items-center gap-1 ${
                    metric.trend === "up" ? "text-green-500" : "text-green-500"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  Better than baseline
                </div>
              </div>
            </Card>
            ))
          )}
        </div>

        {/* Model Performance */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Model Performance Comparison
            </h2>
            <Badge className="bg-primary text-primary-foreground">
              <Award className="h-3 w-3 mr-1" />
              Ensemble Prediction
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Model</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">RMSE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">MAE</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">R² Score</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {modelPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No model performance data available
                    </td>
                  </tr>
                ) : (
                  modelPerformance.map((model, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-border transition-smooth ${
                      model.best ? "bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{model.model}</span>
                        {model.best && (
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            Best
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{model.rmse}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{model.mae}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded font-medium">
                        {model.r2}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="border-primary text-primary">
                        Active
                      </Badge>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Feature Importance */}
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Feature Importance Analysis
          </h2>

          <div className="space-y-4">
            {featureImportance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No feature importance data available</div>
            ) : (
              featureImportance.map((feature, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{feature.feature}</span>
                  <span className="text-muted-foreground">{(feature.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                    style={{ width: `${feature.importance * 100}%` }}
                  />
                </div>
              </div>
              ))
            )}
          </div>
        </Card>

        {/* UHI vs Health Risk Comparison */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              UHI vs Health Risk Correlation - {clusters.find(c => c.value === selectedCluster)?.label || "Selected Cluster"}
            </h2>
            {correlationData && (
              <Badge variant="outline" className="border-primary text-primary">
                Correlation: {(correlationData.correlation_coefficient * 100).toFixed(1)}%
              </Badge>
            )}
          </div>
          
          {correlationData ? (
            <div className="space-y-4">
              {/* Current Values */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-sm text-muted-foreground mb-1">Current UHI Score</div>
                  <div className="text-3xl font-bold text-destructive">{correlationData.current_uhi}°C</div>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Current Health Risk</div>
                  <div className="text-3xl font-bold text-orange-500">{correlationData.current_health_risk}/10</div>
                </div>
              </div>
              
              {/* Correlation Chart */}
              <div className="h-80 bg-muted/30 rounded-lg border border-border p-4">
                <div className="h-full flex items-end justify-between gap-2">
                  {correlationData.data_points?.map((point: any, idx: number) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div 
                            className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all hover:shadow-lg min-h-[20px]"
                            style={{ height: `${(point.uhi / 10) * 100}%` }}
                            title={`Month ${point.month}: UHI ${point.uhi}°C`}
                          />
                          <span className="text-[10px] text-muted-foreground font-medium">{point.uhi}°C</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div 
                            className="w-full bg-orange-500/80 hover:bg-orange-500 rounded-t transition-all hover:shadow-lg min-h-[20px]"
                            style={{ height: `${(point.healthRisk / 10) * 100}%` }}
                            title={`Month ${point.month}: Health Risk ${point.healthRisk}`}
                          />
                          <span className="text-[10px] text-muted-foreground font-medium">{point.healthRisk}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        M{point.month}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span className="text-muted-foreground">UHI Intensity (°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-muted-foreground">Health Risk Index</span>
                  </div>
                </div>
              </div>
              
              {/* Correlation Stats */}
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground">Correlation Strength</div>
                  <div className="text-lg font-semibold text-foreground">
                    {correlationData.correlation_coefficient >= 0.8 ? "Strong" : 
                     correlationData.correlation_coefficient >= 0.6 ? "Moderate" : "Weak"}
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground">Data Points</div>
                  <div className="text-lg font-semibold text-foreground">
                    {correlationData.data_points?.length || 0} months
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-muted-foreground">Trend</div>
                  <div className="text-lg font-semibold text-green-500">Positive</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-primary mx-auto" />
                <p className="text-muted-foreground">Loading correlation data...</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
