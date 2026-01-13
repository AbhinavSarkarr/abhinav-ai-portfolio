
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import ClientDetail from "./pages/ClientDetail";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import Dashboard3 from "./pages/Dashboard3";
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
  // Instagram
  InstagramBioRedirect,
  InstagramPostRedirect,
  InstagramStoryRedirect,
  InstagramDMRedirect,
  InstagramReelRedirect,
  // YouTube
  YouTubeChannelRedirect,
  YouTubeVideoRedirect,
  YouTubeCommentRedirect,
  // Telegram
  TelegramDirectRedirect,
  TelegramGroupRedirect,
  TelegramChannelRedirect,
  // Facebook
  FacebookProfileRedirect,
  FacebookPostRedirect,
  FacebookMessengerRedirect,
  // Threads
  ThreadsProfileRedirect,
  ThreadsPostRedirect,
  // Kaggle
  KaggleProfileRedirect,
  KaggleNotebookRedirect,
  KaggleDiscussionRedirect,
  // Stack Overflow
  StackOverflowProfileRedirect,
  StackOverflowAnswerRedirect,
  // Developer Blogs
  DevToRedirect,
  HashnodeRedirect,
  // Tech Communities
  HackerNewsRedirect,
  ProductHuntRedirect,
  // Coding Platforms
  LeetCodeRedirect,
  HackerRankRedirect,
  // Design Platforms
  BehanceRedirect,
  DribbbleRedirect,
  // Work Platforms
  SlackRedirect,
  SlackDMRedirect,
  NotionRedirect,
  // Other
  DiscordRedirect,
  DiscordDMRedirect,
  RedditRedirect,
  RedditCommentRedirect,
  MediumRedirect,
  QRCodeRedirect,
  // Misc
  PortfolioLinkRedirect,
  ReferralRedirect,
  PresentationRedirect,
  ConferenceRedirect,
  MeetupRedirect,
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
              <Route path="/dashboard2" element={<Dashboard2 />} />
              <Route path="/dashboard3" element={<Dashboard3 />} />

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

              {/* Instagram */}
              <Route path="/ig" element={<InstagramBioRedirect />} />
              <Route path="/ig/p" element={<InstagramPostRedirect />} />
              <Route path="/ig/s" element={<InstagramStoryRedirect />} />
              <Route path="/ig/dm" element={<InstagramDMRedirect />} />
              <Route path="/ig/r" element={<InstagramReelRedirect />} />

              {/* YouTube */}
              <Route path="/yt" element={<YouTubeChannelRedirect />} />
              <Route path="/yt/v" element={<YouTubeVideoRedirect />} />
              <Route path="/yt/c" element={<YouTubeCommentRedirect />} />

              {/* Telegram */}
              <Route path="/tg" element={<TelegramDirectRedirect />} />
              <Route path="/tg/g" element={<TelegramGroupRedirect />} />
              <Route path="/tg/c" element={<TelegramChannelRedirect />} />

              {/* Facebook */}
              <Route path="/fb" element={<FacebookProfileRedirect />} />
              <Route path="/fb/p" element={<FacebookPostRedirect />} />
              <Route path="/fb/m" element={<FacebookMessengerRedirect />} />

              {/* Threads */}
              <Route path="/th" element={<ThreadsProfileRedirect />} />
              <Route path="/th/p" element={<ThreadsPostRedirect />} />

              {/* Kaggle (AI/ML) */}
              <Route path="/kg" element={<KaggleProfileRedirect />} />
              <Route path="/kg/n" element={<KaggleNotebookRedirect />} />
              <Route path="/kg/d" element={<KaggleDiscussionRedirect />} />

              {/* Stack Overflow */}
              <Route path="/so" element={<StackOverflowProfileRedirect />} />
              <Route path="/so/a" element={<StackOverflowAnswerRedirect />} />

              {/* Developer Blogs */}
              <Route path="/dv" element={<DevToRedirect />} />
              <Route path="/hs" element={<HashnodeRedirect />} />

              {/* Tech Communities */}
              <Route path="/hn" element={<HackerNewsRedirect />} />
              <Route path="/ph" element={<ProductHuntRedirect />} />

              {/* Coding Platforms */}
              <Route path="/lc" element={<LeetCodeRedirect />} />
              <Route path="/hr" element={<HackerRankRedirect />} />

              {/* Design Platforms */}
              <Route path="/be" element={<BehanceRedirect />} />
              <Route path="/dr" element={<DribbbleRedirect />} />

              {/* Work/Collaboration */}
              <Route path="/sl" element={<SlackRedirect />} />
              <Route path="/sl/dm" element={<SlackDMRedirect />} />
              <Route path="/nt" element={<NotionRedirect />} />

              {/* Other Platforms */}
              <Route path="/dc" element={<DiscordRedirect />} />
              <Route path="/dc/dm" element={<DiscordDMRedirect />} />
              <Route path="/rd" element={<RedditRedirect />} />
              <Route path="/rd/c" element={<RedditCommentRedirect />} />
              <Route path="/md" element={<MediumRedirect />} />
              <Route path="/qr" element={<QRCodeRedirect />} />

              {/* Miscellaneous */}
              <Route path="/pf" element={<PortfolioLinkRedirect />} />
              <Route path="/ref" element={<ReferralRedirect />} />
              <Route path="/ppt" element={<PresentationRedirect />} />
              <Route path="/conf" element={<ConferenceRedirect />} />
              <Route path="/meet" element={<MeetupRedirect />} />

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
