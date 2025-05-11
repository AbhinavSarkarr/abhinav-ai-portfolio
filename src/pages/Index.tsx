
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
import { motion } from "framer-motion";

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
    // Show loading state with AI-themed loader
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-tech-neon border-t-transparent animate-spin mx-auto mb-4"></div>
            <motion.div 
              className="absolute inset-0 text-tech-neon"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Remove Brain component usage */}
              <div className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </div>
          <motion.p 
            className="text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Loading AI portfolio data...
          </motion.p>
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
