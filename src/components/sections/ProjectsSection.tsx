
import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Github, Globe, ArrowUpRight, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { portfolioData } from '@/data/portfolioData';

export function ProjectsSection() {
  const { projects } = portfolioData;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  
  // For performance optimization
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { 
    once: true,
    margin: "0px 0px -10% 0px" 
  });

  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Track loaded images for smoother rendering
  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Handle image errors by providing fallbacks
  const handleImageError = (id: string, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Error loading image for project ${id}`, e);
    
    // Set project-specific fallback images based on project name/type
    const fallbacks: Record<string, string> = {
      "JurisGPT": "https://images.unsplash.com/photo-1589994965-fcf48d80b0fd?ixlib=rb-4.0.3",
      "WhatsApp Virtual Try-On Bot": "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?ixlib=rb-4.0.3",
      "default": "https://images.unsplash.com/photo-1560732488-7b5f5b6730a6?ixlib=rb-4.0.3"
    };

    // Find the project by id
    const project = projects.find(p => p.id === id);
    const projectName = project?.title || "";
    
    // Use project-specific fallback or default
    e.currentTarget.src = fallbacks[projectName] || fallbacks.default;
    handleImageLoad(id);
  };

  return (
    <section id="projects" className="relative py-24" ref={sectionRef}>
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-tech-accent/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">Projects</h2>
          <p className="text-lg text-muted-foreground mt-6">
            Exploring the intersection of AI, language models, and practical applications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              initial="hidden"
              animate={controls}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="h-full"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card className="h-full glass border-tech-neon/20 overflow-hidden group">
                <div className="relative h-48 overflow-hidden bg-tech-glass/20">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(project.id)}
                    onError={(e) => handleImageError(project.id, e)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ 
                      opacity: imagesLoaded[project.id] ? 1 : 0,
                      transition: 'opacity 0.5s ease'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {project.title}
                    <motion.span
                      animate={{ 
                        scale: hoveredIndex === index ? [1, 1.2, 1] : 1
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: hoveredIndex === index ? Infinity : 0,
                        repeatDelay: 1
                      }}
                      className="text-tech-accent"
                    >
                      <ArrowUpRight size={18} />
                    </motion.span>
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies && project.technologies.map((tech, i) => (
                      <span 
                        key={i} 
                        className="skill-badge"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <div className="flex gap-3">
                    {project.github && (
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-tech-glass transition-colors"
                      >
                        <Github size={18} />
                        <span className="sr-only">GitHub</span>
                      </a>
                    )}
                    
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-tech-glass transition-colors"
                      >
                        <Globe size={18} />
                        <span className="sr-only">Live Demo</span>
                      </a>
                    )}
                    
                    {project.whatsappLink && (
                      <div className="flex items-center">
                        <a 
                          href={`https://wa.me/${project.whatsappLink.replace(/[^0-9]/g, '')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-tech-glass transition-colors"
                        >
                          <MessageSquare size={18} />
                          <span className="sr-only">WhatsApp</span>
                        </a>
                        <span className="text-xs text-muted-foreground ml-1">
                          Message "join action-practice"
                        </span>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
