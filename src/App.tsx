
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import { RecommenderProvider } from "@/context/RecommenderContext";
import { ProjectRecommendation } from "@/components/ProjectRecommendation";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <RecommenderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ProjectRecommendation />
      </BrowserRouter>
    </RecommenderProvider>
  </TooltipProvider>
);

export default App;
