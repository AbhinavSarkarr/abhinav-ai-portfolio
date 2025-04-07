
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { PublicationsSection } from "@/components/sections/PublicationsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { useAdminData } from "@/contexts/AdminDataContext";

const Index = () => {
  const { data, isLoading } = useAdminData();
  const [dataReady, setDataReady] = useState(false);
  
  // Update document title and wait for data to be ready
  useEffect(() => {
    // First check for deployed data
    try {
      const deployedData = localStorage.getItem('deployedAdminData');
      if (deployedData) {
        console.log("Using deployed data for portfolio view");
      }
    } catch (err) {
      console.error("Error checking deployed data:", err);
    }
    
    document.title = `${data.hero.name || 'Abhinav'} Portfolio`;
    
    if (!isLoading) {
      setDataReady(true);
      console.log("Portfolio data ready:", data);
    }
  }, [isLoading, data]);

  if (!dataReady) {
    // Show loading state
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-tech-neon border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <PublicationsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
