
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminDataProvider } from "./contexts/AdminDataContext";

// Admin section components will be added here as we build them
import { AdminHero } from "./components/admin/sections/AdminHero";
import { AdminExperience } from "./components/admin/sections/AdminExperience";
import { AdminProjects } from "./components/admin/sections/AdminProjects";
import { AdminSkills } from "./components/admin/sections/AdminSkills";
import { AdminCertifications } from "./components/admin/sections/AdminCertifications";
import { AdminPublications } from "./components/admin/sections/AdminPublications";
import { AdminSocial } from "./components/admin/sections/AdminSocial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="hero" element={<AdminHero />} />
              <Route path="experience" element={<AdminExperience />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="skills" element={<AdminSkills />} />
              <Route path="certifications" element={<AdminCertifications />} />
              <Route path="publications" element={<AdminPublications />} />
              <Route path="social" element={<AdminSocial />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
