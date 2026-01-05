import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Github, Globe, ArrowUpRight, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { portfolioData } from '@/data/portfolioData';
import { useRecommender } from '@/context/RecommenderContext';
import {
  staggerContainer,
  sectionHeading,
  sectionSubheading,
} from '@/lib/animations';

export function ProjectsSection() {
  const { projects } = portfolioData;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { trackHoverStart, trackHoverEnd } = useRecommender();

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px',
  });

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  const handleImageError = (id: string, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const fallbacks: Record<string, string> = {
      "JurisGPT": "https://images.unsplash.com/photo-1589994965-fcf48d80b0fd?ixlib=rb-4.0.3",
      "WhatsApp Virtual Try-On Bot": "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?ixlib=rb-4.0.3",
      "default": "https://images.unsplash.com/photo-1560732488-7b5f5b6730a6?ixlib=rb-4.0.3"
    };

    const project = projects.find(p => p.id === id);
    const projectName = project?.title || "";
    e.currentTarget.src = fallbacks[projectName] || fallbacks.default;
    handleImageLoad(id);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: i * 0.15,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <section id="projects" className="relative py-24" ref={sectionRef}>
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-0 w-96 h-96 bg-tech-accent/5 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-tech-neon/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="container relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.h2 variants={sectionHeading} className="section-heading">
            Projects
          </motion.h2>
          <motion.p variants={sectionSubheading} className="text-lg text-muted-foreground mt-6">
            Exploring the intersection of AI, language models, and practical applications
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="h-full"
              onMouseEnter={() => {
                setHoveredIndex(index);
                trackHoverStart(project.id);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                trackHoverEnd();
              }}
            >
              <motion.div
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: 'easeOut' },
                }}
                className="h-full"
              >
                <Card
                  className="h-full glass border-tech-neon/20 overflow-hidden group relative cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(123, 66, 246, 0.1), transparent 40%)',
                    }}
                  />

                  <div className="relative h-48 overflow-hidden bg-tech-glass/20">
                    <motion.img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      onLoad={() => handleImageLoad(project.id)}
                      onError={(e) => handleImageError(project.id, e)}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.1 }}
                      animate={{
                        scale: hoveredIndex === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        opacity: imagesLoaded[project.id] ? 1 : 0,
                        transition: 'opacity 0.5s ease',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                    {/* Floating tech badge */}
                    <motion.div
                      className="absolute top-4 right-4 px-3 py-1 rounded-full bg-tech-glass/80 backdrop-blur-sm border border-tech-accent/30 text-xs font-medium"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: hoveredIndex === index ? 1 : 0,
                        y: hoveredIndex === index ? 0 : -10,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {project.languages?.join(', ')}
                    </motion.div>
                  </div>

                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="group-hover:text-tech-accent transition-colors duration-300">
                        {project.title}
                      </span>
                      <motion.span
                        animate={{
                          rotate: hoveredIndex === index ? 45 : 0,
                          scale: hoveredIndex === index ? 1.2 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-tech-accent"
                      >
                        <ArrowUpRight size={18} />
                      </motion.span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies?.slice(0, 4).map((tech, i) => (
                        <motion.span
                          key={i}
                          className="skill-badge"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * i }}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: 'rgba(0, 224, 255, 0.2)',
                          }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                      {project.technologies && project.technologies.length > 4 && (
                        <span className="skill-badge opacity-60">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {project.github && (
                        <motion.a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-tech-glass transition-all duration-300 hover:text-tech-accent"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github size={18} />
                          <span className="sr-only">GitHub</span>
                        </motion.a>
                      )}

                      {project.liveUrl && (
                        <motion.a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-tech-glass transition-all duration-300 hover:text-tech-accent"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe size={18} />
                          <span className="sr-only">Live Demo</span>
                        </motion.a>
                      )}

                      {project.whatsappLink && (
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          <motion.a
                            href={`https://wa.me/${project.whatsappLink.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full hover:bg-tech-glass transition-all duration-300 hover:text-tech-accent"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <MessageSquare size={18} />
                            <span className="sr-only">WhatsApp</span>
                          </motion.a>
                          <span className="text-xs text-muted-foreground ml-1">
                            Message "join action-practice"
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-tech-accent font-medium flex items-center gap-1 group-hover:underline">
                      View Case Study
                      <ArrowUpRight size={14} />
                    </span>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
