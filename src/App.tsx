
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import ClientDetail from "./pages/ClientDetail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { RecommenderProvider } from "@/context/RecommenderContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { ProjectRecommendation } from "@/components/ProjectRecommendation";

// Check if we're on the analytics subdomain
const isAnalyticsSubdomain = window.location.hostname.startsWith('analytics.');

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AnalyticsProvider>
        <RecommenderProvider>
          {isAnalyticsSubdomain ? (
            // Analytics subdomain: only show dashboard
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          ) : (
            // Main domain: full portfolio
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/client/:experienceId/:clientId" element={<ClientDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
          {!isAnalyticsSubdomain && <ProjectRecommendation />}
        </RecommenderProvider>
      </AnalyticsProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
