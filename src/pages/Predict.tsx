import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Loader2, Download, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://127.0.0.1:8000"; // change if your backend runs elsewhere

// <-- Updated: all 7 clusters included here. Make sure these values match your backend model keys.
const clusterOptions = [
  { label: "Aurangabad - Jalna", value: "cluster_aurangabad_jalna" },
  { label: "Kolhapur - Ichalkaranji", value: "cluster_kolhapur_ichalkaranji" },
  { label: "MMR (Mumbai Metro Region)", value: "cluster_mmr" },
  { label: "Nagpur - Wardha", value: "cluster_nagpur_wardha" },
  { label: "Nashik - Ahmednagar", value: "cluster_nashik_ahmednagar" },
  { label: "Pune (Metropolitan)", value: "cluster_pune_metropolitan" },
  { label: "Solapur - Sangli", value: "cluster_solapur_sangli" },
];


const Predict = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState<any[] | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string>(clusterOptions[0].value);
  const { toast } = useToast();

  // Batch upload -> POST /predict/batch
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      // Optionally send default cluster for files that don't contain a cluster column:
      // form.append("default_cluster", selectedCluster);

      const res = await fetch(`${API_BASE}/predict/batch`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let errMsg = `Upload failed (${res.status})`;
        try {
          const j = await res.json();
          errMsg = j.detail || JSON.stringify(j);
        } catch {
          // ignore parse errors
        }
        throw new Error(errMsg);
      }

      const json = await res.json();
      const preds = json.predictions || json;
      setPredictions(preds);
      toast({
        title: "Predictions Complete",
        description: `Batch predictions returned (${Array.isArray(preds) ? preds.length : "?"})`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Batch prediction failed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      (event.target as HTMLInputElement).value = "";
    }
  };

  // Single predict -> POST /predict/single
  const handlePredict = async () => {
    const latInput = (document.getElementById("latitude") as HTMLInputElement)?.value;
    const lonInput = (document.getElementById("longitude") as HTMLInputElement)?.value;
    const monthInput = (document.getElementById("month") as HTMLInputElement)?.value;

    if (!latInput || !lonInput || !monthInput) {
      toast({
        title: "Missing fields",
        description: "Please provide latitude, longitude and month",
        variant: "destructive",
      });
      return;
    }

    const lat = Number(latInput);
    const lon = Number(lonInput);
    const month = Number(monthInput);

    if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(month)) {
      toast({
        title: "Invalid values",
        description: "Latitude, longitude and month must be numbers",
        variant: "destructive",
      });
      return;
    }

    setIsPredicting(true);
    try {
      const features = {
        latitude: lat,
        longitude: lon,
        month: month,
      };

      const payload = {
        cluster: selectedCluster,
        features,
      };

      const res = await fetch(`${API_BASE}/predict/single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let err = `Prediction failed (${res.status})`;
        try {
          const j = await res.json();
          err = j.detail || JSON.stringify(j);
        } catch {}
        throw new Error(err);
      }

      const json = await res.json();
      const out = json.predictions || {};

      const row = {
        cluster: json.cluster || selectedCluster,
        lat,
        lon,
        uhi: out.UHI_Intensity_C ?? null,
        health_risk: out.Health_Risk_Index ?? null,
      };

      setPredictions([row]);
      toast({
        title: "Prediction Complete",
        description: `UHI: ${row.uhi ?? "N/A"}, Health risk: ${row.health_risk ?? "N/A"}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Prediction failed",
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  // Download CSV of predictions
  const handleDownload = () => {
    if (!predictions || predictions.length === 0) return;
    const headers = ["cluster", "latitude", "longitude", "UHI_Intensity_C", "Health_Risk_Index"];
    const rows = predictions.map((p) =>
      [
        p.cluster ?? "",
        p.latitude ?? p.lat ?? "",
        p.longitude ?? p.lon ?? "",
        p.uhi ?? p.UHI_Intensity_C ?? "",
        p.health_risk ?? p.Health_Risk_Index ?? "",
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `predictions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">UHI Prediction</h1>
          <p className="text-muted-foreground">
            Upload CSV data or input coordinates to predict Urban Heat Island intensity and health impact
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Batch Prediction (CSV)
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with latitude, longitude, and month columns (or include cluster column)
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4 hover:border-primary/50 transition-smooth">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="text-foreground font-medium mb-1">Click to upload or drag and drop</div>
                  <div className="text-sm text-muted-foreground">CSV file (MAX. 10MB)</div>
                </label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">CSV Format Example:</h3>
              <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                latitude,longitude,month<br />
                19.0760,72.8777,6<br />
                18.5204,73.8567,7
              </div>
            </div>
          </Card>

          {/* Manual Input */}
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                Single Location Prediction
              </h2>
              <p className="text-sm text-muted-foreground">Enter coordinates manually for instant prediction</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cluster">Cluster</Label>
                <select
                  id="cluster"
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                >
                  {clusterOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" placeholder="19.0760" step="0.0001" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" placeholder="72.8777" step="0.0001" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input id="month" type="number" placeholder="6" min="1" max="12" />
              </div>

              <Button
                onClick={handlePredict}
                disabled={isPredicting}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary-dark"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Predict Now
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Results */}
        {predictions && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Prediction Results</h2>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Cluster</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Latitude</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Longitude</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">UHI Intensity (°C)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Health Risk Index</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-smooth">
                      <td className="py-3 px-4 text-sm text-foreground font-medium">{pred.cluster}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{pred.latitude ?? pred.lat}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{pred.longitude ?? pred.lon}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-destructive/10 text-destructive rounded font-medium">
                          {pred.uhi ?? pred.UHI_Intensity_C ?? "N/A"}°C
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-accent/10 text-accent-foreground rounded font-medium">
                          {pred.health_risk ?? pred.Health_Risk_Index ?? "N/A"}/10
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Predict;
