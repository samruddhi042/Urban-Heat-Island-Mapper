import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MapExplorer from "./pages/MapExplorer";
import Predict from "./pages/Predict";
import Dashboard from "./pages/Dashboard";
import Simulator from "./pages/Simulator";
import Recommendations from "./pages/Recommendations";
import AIAdvisor from "./pages/AIAdvisor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapExplorer />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/ai-advisor" element={<AIAdvisor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
