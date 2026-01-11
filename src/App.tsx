
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
import {
  // LinkedIn
  LinkedInProfileRedirect,
  LinkedInPostRedirect,
  LinkedInMessageRedirect,
  // Twitter
  TwitterProfileRedirect,
  TwitterPostRedirect,
  TwitterDMRedirect,
  // GitHub
  GitHubProfileRedirect,
  GitHubReadmeRedirect,
  GitHubRepoRedirect,
  // Email
  EmailSignatureRedirect,
  EmailNewsletterRedirect,
  EmailColdRedirect,
  // Resume
  ResumeRedirect,
  CoverLetterRedirect,
  // WhatsApp
  WhatsAppDirectRedirect,
  WhatsAppGroupRedirect,
  WhatsAppStatusRedirect,
  // Other
  DiscordRedirect,
  RedditRedirect,
  MediumRedirect,
  QRCodeRedirect,
} from "@/components/UTMRedirect";

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

              {/* UTM Redirect Routes - Short URLs with hidden tracking */}
              {/* LinkedIn */}
              <Route path="/li" element={<LinkedInProfileRedirect />} />
              <Route path="/li/p" element={<LinkedInPostRedirect />} />
              <Route path="/li/m" element={<LinkedInMessageRedirect />} />

              {/* Twitter/X */}
              <Route path="/tw" element={<TwitterProfileRedirect />} />
              <Route path="/tw/p" element={<TwitterPostRedirect />} />
              <Route path="/tw/dm" element={<TwitterDMRedirect />} />

              {/* GitHub */}
              <Route path="/gh" element={<GitHubProfileRedirect />} />
              <Route path="/gh/r" element={<GitHubReadmeRedirect />} />
              <Route path="/gh/repo" element={<GitHubRepoRedirect />} />

              {/* Email */}
              <Route path="/em" element={<EmailSignatureRedirect />} />
              <Route path="/em/n" element={<EmailNewsletterRedirect />} />
              <Route path="/em/c" element={<EmailColdRedirect />} />

              {/* Resume/CV */}
              <Route path="/cv" element={<ResumeRedirect />} />
              <Route path="/cl" element={<CoverLetterRedirect />} />

              {/* WhatsApp */}
              <Route path="/wa" element={<WhatsAppDirectRedirect />} />
              <Route path="/wa/g" element={<WhatsAppGroupRedirect />} />
              <Route path="/wa/s" element={<WhatsAppStatusRedirect />} />

              {/* Other Platforms */}
              <Route path="/dc" element={<DiscordRedirect />} />
              <Route path="/rd" element={<RedditRedirect />} />
              <Route path="/md" element={<MediumRedirect />} />
              <Route path="/qr" element={<QRCodeRedirect />} />

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
