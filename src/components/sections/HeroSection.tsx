
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-40 left-0 w-72 h-72 bg-tech-neon/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tech-accent/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-tech-glass border border-tech-accent/20 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tech-accent animate-pulse-soft" />
                AI/LLM Engineer
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Building<br />
              <span className="bg-gradient-tech bg-clip-text text-transparent">
                intelligent systems
              </span><br />
              for the future
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Specialized in NLP, RAG pipelines, and LLM fine-tuning. Creating solutions that leverage the power of artificial intelligence to solve real-world problems.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button className="tech-btn">Get in touch</Button>
              <Button variant="outline" className="border-tech-accent/30 hover:border-tech-accent/70 hover:bg-tech-glass">View Projects</Button>
            </motion.div>
          </div>
          
          <motion.div 
            className="lg:col-span-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-tech-accent/30 shadow-lg shadow-tech-neon/30 animate-float">
                <img 
                  src="/lovable-uploads/0f976acc-d38b-4ac7-96a7-02ccc53846b5.png" 
                  alt="Abhinav Sarkar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 glass px-4 py-2 rounded-full border border-tech-accent/30 shadow-md flex items-center gap-2.5">
                <span className="text-xl">🤗</span>
                <span className="font-medium text-sm">Hugging Face</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <span className="text-sm text-muted-foreground">Scroll to explore</span>
          <ArrowDown className="animate-bounce text-tech-accent" size={20} />
        </motion.div>
      </div>
    </section>
  );
}
