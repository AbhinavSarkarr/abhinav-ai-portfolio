
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Globe, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Project = {
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github?: string;
  liveUrl?: string;
};

const projects: Project[] = [
  {
    title: "AutoDraft",
    description: "Chrome extension that automates email replies using Tavily AI, Crew AI, and Llama3-8B",
    technologies: ["TypeScript", "Langchain", "Llama", "Tavily AI", "Chrome Extension API"],
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    github: "#",
    liveUrl: "#"
  },
  {
    title: "TextTweak",
    description: "Real-time text improvement tool using fine-tuned Google T5-base for grammar/spell check",
    technologies: ["Python", "PyTorch", "T5", "Transformers", "FastAPI"],
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    github: "#",
    liveUrl: "#"
  },
  {
    title: "RAG Pipeline Builder",
    description: "End-to-end system for creating custom retrieval augmented generation pipelines",
    technologies: ["Python", "Qdrant", "LangChain", "Llama", "React"],
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    github: "#"
  },
  {
    title: "Insurance Document Analyzer",
    description: "AI system that extracts and cross-verifies services in insurance documents",
    technologies: ["OCR", "NLP", "BERT", "FastAPI", "React"],
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
    github: "#"
  }
];

export function ProjectsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="projects" className="relative py-24">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-tech-accent/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
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
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card className="h-full glass border-tech-neon/20 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                    {project.technologies.map((tech, i) => (
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
