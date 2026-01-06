
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { PublicationsSection } from "@/components/sections/PublicationsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CustomCursor } from "@/components/CustomCursor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmartScroll } from "@/components/SmartScroll";
import { useEffect } from "react";

const Index = () => {
  // Update document title and scroll to top
  useEffect(() => {
    document.title = 'Abhinav Sarkar | AI-ML Engineer Portfolio';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <ThemeToggle />
      <ScrollProgress />
      <SmartScroll />
      <ParticleBackground />
      <div className="flex flex-col min-h-screen relative z-10">
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
    </>
  );
};

export default Index;
