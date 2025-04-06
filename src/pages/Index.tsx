
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
    document.title = `${data.hero.name || 'Abhinav'} Portfolio`;
    
    if (!isLoading) {
      setDataReady(true);
      console.log("Portfolio data ready:", data);
    }
  }, [isLoading, data]);

  if (!dataReady) {
    // Could add a loading spinner here if needed
    return null;
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
