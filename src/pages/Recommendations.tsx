import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Download, Leaf, Building2, CloudRain, Droplets, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://127.0.0.1:8000";

const Recommendations = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`${API_BASE}/recommendations/strategies`);
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setSummary(data.summary || null);
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load recommendations. Using default data.",
          variant: "destructive",
        });
        // Fallback data
        setRecommendations([
    {
      icon: "Leaf",
      category: "Green Infrastructure",
      priority: "High",
      title: "Increase Urban Vegetation Coverage",
      description:
        "Expand green spaces by planting native trees and creating urban forests. Target a 25% increase in NDVI across high-risk clusters. Focus on heat-absorbing concrete areas with green corridors and pocket parks.",
      impact: "Expected UHI reduction: 1.2°C",
      actions: [
        "Plant 10,000 native trees in Mumbai cluster",
        "Create 15 new pocket parks in dense areas",
        "Establish green corridors along major roads",
        "Implement rooftop gardens on public buildings",
      ],
    },
    {
      icon: "Building2",
      category: "Urban Planning",
      priority: "High",
      title: "Cool Roofs & Reflective Surfaces",
      description:
        "Mandate cool roof installations for new constructions and incentivize retrofits for existing buildings. Use high-albedo materials to reflect solar radiation and reduce surface temperatures.",
      impact: "Expected UHI reduction: 0.8°C",
      actions: [
        "Mandate cool roofs for all new buildings",
        "Provide subsidies for cool roof retrofits",
        "Use reflective pavements in parking areas",
        "Paint building exteriors with reflective coatings",
      ],
    },
    {
      icon: "CloudRain",
      category: "Climate Adaptation",
      priority: "Medium",
      title: "Enhance Microclimate Regulation",
      description:
        "Install misting systems in public spaces during heat waves. Create water features and increase humidity in dry zones to improve thermal comfort and reduce local temperature spikes.",
      impact: "Expected health risk reduction: 15%",
      actions: [
        "Install public misting stations in markets",
        "Create water fountains in parks",
        "Develop artificial lakes in suburban areas",
        "Implement fog cooling in crowded zones",
      ],
    },
    {
      icon: "Droplets",
      category: "Water Management",
      priority: "Medium",
      title: "Integrated Water Systems",
      description:
        "Develop blue-green infrastructure combining water management with vegetation. Implement rainwater harvesting, permeable pavements, and bioswales to manage runoff while cooling urban areas.",
      impact: "Expected UHI reduction: 0.5°C",
      actions: [
        "Install rainwater harvesting in 1,000 buildings",
        "Create bioswales along 50km of roads",
        "Build retention ponds in 20 neighborhoods",
        "Replace concrete with permeable surfaces",
      ],
    }]);
        setSummary({
          total_strategies: 4,
          potential_uhi_reduction: "2.5°C",
          health_risk_reduction: "15%"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [toast]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratingInsights(true);
    try {
      // Generate AI insights based on current recommendations
      const prompt = `Based on these UHI mitigation strategies for Maharashtra: ${recommendations.map(r => r.title).join(", ")}, provide a comprehensive AI-generated insights report covering:
1. Overall assessment of the mitigation strategies
2. Expected combined impact on UHI reduction
3. Implementation priorities
4. Key success factors
5. Long-term benefits

Format as a detailed, professional report.`;

      const response = await fetch(`${API_BASE}/ai-advisor/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.response || "");
        toast({
          title: "Success",
          description: "AI insights generated successfully!",
        });
      } else {
        throw new Error("Failed to generate insights");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGeneratingInsights(false);
    }
  };

  const handleDownload = () => {
    // Create downloadable content
    const content = `
UHI MAHARASHTRA ENSEMBLE PLATFORM
AI-POWERED RECOMMENDATIONS REPORT
Generated: ${new Date().toLocaleString()}

${aiInsights ? "AI-GENERATED INSIGHTS\n" + "=".repeat(50) + "\n" + aiInsights + "\n\n" : ""}

MITIGATION STRATEGIES
${"=".repeat(50)}

${recommendations.map((rec, idx) => `
${idx + 1}. ${rec.title}
   Category: ${rec.category}
   Priority: ${rec.priority}
   Impact: ${rec.impact}
   
   Description:
   ${rec.description}
   
   Recommended Actions:
   ${rec.actions?.map((action: string, i: number) => `   ${i + 1}. ${action}`).join("\n") || "N/A"}
`).join("\n")}

${summary ? `
SUMMARY
${"=".repeat(50)}
Total Strategies: ${summary.total_strategies}
Potential UHI Reduction: ${summary.potential_uhi_reduction}
Health Risk Reduction: ${summary.health_risk_reduction}
` : ""}

---
Report generated by UHI Maharashtra Ensemble Platform
For more information, visit the platform dashboard.
    `.trim();

    // Create blob and download
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `UHI_Recommendations_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Recommendations report downloaded successfully!",
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI-Powered Recommendations</h1>
          <p className="text-muted-foreground">
            Data-driven mitigation strategies to reduce Urban Heat Island effects and improve public health
          </p>
        </div>

        {/* Action Bar */}
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Generate Custom Report</div>
              <div className="text-sm text-muted-foreground">AI-powered recommendations for your cluster</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || recommendations.length === 0}
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary/10"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Insights
                </>
              )}
            </Button>
            <Button 
              onClick={handleDownload}
              disabled={recommendations.length === 0}
              className="bg-accent text-accent-foreground hover:bg-accent-dark"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </Card>

        {/* AI Insights Section */}
        {aiInsights && (
          <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">AI-Generated Insights</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {aiInsights}
              </div>
            </div>
          </Card>
        )}

        {generatingInsights && (
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Generating AI insights...</span>
            </div>
          </Card>
        )}

        {/* Recommendations */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No recommendations available</div>
          ) : (
            recommendations.map((rec, idx) => {
              // Map icon names to components
              const iconMap: { [key: string]: any } = {
                "Leaf": Leaf,
                "Building2": Building2,
                "CloudRain": CloudRain,
                "Droplets": Droplets,
              };
              const IconComponent = typeof rec.icon === "string" 
                ? iconMap[rec.icon] || Leaf 
                : rec.icon || Leaf;
              
              return (
            <Card key={idx} className="p-6 space-y-6 hover:shadow-lg transition-smooth">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-foreground">{rec.title}</h3>
                      <Badge
                        variant={rec.priority === "High" ? "destructive" : "secondary"}
                        className={rec.priority === "High" ? "bg-accent text-accent-foreground" : ""}
                      >
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{rec.category}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{rec.description}</p>

              {/* Impact Badge */}
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-semibold text-sm">{rec.impact}</span>
                </div>
              </div>

              {/* Action Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm">Recommended Actions:</h4>
                <ul className="space-y-2">
                  {rec.actions.map((action, actionIdx) => (
                    <li key={actionIdx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
              );
            })
          )}
        </div>

        {/* Summary Card */}
        {summary && (
          <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Implementation Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="text-2xl font-bold text-primary mb-1">{summary.total_strategies || 4}</div>
                <div className="text-sm text-muted-foreground">Total Strategies</div>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="text-2xl font-bold text-accent mb-1">{summary.potential_uhi_reduction || "2.5°C"}</div>
                <div className="text-sm text-muted-foreground">Potential UHI Reduction</div>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="text-2xl font-bold text-green-500 mb-1">{summary.health_risk_reduction || "15%"}</div>
                <div className="text-sm text-muted-foreground">Health Risk Reduction</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Implementing these recommendations in combination can significantly reduce Urban Heat Island 
              effects and improve public health outcomes across Maharashtra's regional clusters. Prioritize 
              high-impact interventions in areas with the highest UHI intensity.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
