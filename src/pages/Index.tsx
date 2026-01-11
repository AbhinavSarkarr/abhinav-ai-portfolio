
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { DataPipelineSection } from "@/components/sections/DataPipelineSection";
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
import { TrackedSection } from "@/components/TrackedSection";
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
          <TrackedSection sectionId="hero" sectionName="Hero" sectionPosition={1}>
            <HeroSection />
          </TrackedSection>
          <TrackedSection sectionId="about" sectionName="About" sectionPosition={2}>
            <AboutSection />
          </TrackedSection>
          <TrackedSection sectionId="data-pipeline" sectionName="Data Pipeline" sectionPosition={3}>
            <DataPipelineSection />
          </TrackedSection>
          <TrackedSection sectionId="experience" sectionName="Experience" sectionPosition={4}>
            <ExperienceSection />
          </TrackedSection>
          <TrackedSection sectionId="projects" sectionName="Projects" sectionPosition={5}>
            <ProjectsSection />
          </TrackedSection>
          <TrackedSection sectionId="skills" sectionName="Skills" sectionPosition={6}>
            <SkillsSection />
          </TrackedSection>
          <TrackedSection sectionId="publications" sectionName="Publications" sectionPosition={7}>
            <PublicationsSection />
          </TrackedSection>
          <TrackedSection sectionId="contact" sectionName="Contact" sectionPosition={8}>
            <ContactSection />
          </TrackedSection>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
