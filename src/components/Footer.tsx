
import { Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { portfolioData } from '@/data/portfolioData';

export function Footer() {
  const { social } = portfolioData;
  
  return (
    <footer className="py-6 sm:py-12 border-t border-white/10">
      <div className="container flex flex-col gap-4 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          <div className="flex flex-col gap-2 sm:gap-3">
            <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Abhinav Sarkar</h3>
            <p className="text-sm sm:text-base text-muted-foreground">AI-ML Engineer building the future of artificial intelligence one model at a time.</p>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Quick Links</h3>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <a href="#about" className="text-sm sm:text-base text-muted-foreground hover:text-tech-accent transition-colors">About</a>
              <a href="#experience" className="text-sm sm:text-base text-muted-foreground hover:text-tech-accent transition-colors">Experience</a>
              <a href="#projects" className="text-sm sm:text-base text-muted-foreground hover:text-tech-accent transition-colors">Projects</a>
              <a href="#skills" className="text-sm sm:text-base text-muted-foreground hover:text-tech-accent transition-colors">Skills</a>
              <a href="#publications" className="text-sm sm:text-base text-muted-foreground hover:text-tech-accent transition-colors">Publications</a>
              <a href="#contact" className="text-sm sm:text-base text-muted-foreground hover:text-tech-accent transition-colors">Contact</a>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">Connect</h3>
            <div className="flex items-center gap-3 sm:gap-4">
              <a href={social.github} target="_blank" rel="noopener noreferrer" className="hover:text-tech-accent transition-colors">
                <Github className="w-5 h-5 sm:w-[20px] sm:h-[20px]" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-tech-accent transition-colors">
                <Linkedin className="w-5 h-5 sm:w-[20px] sm:h-[20px]" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href={social.huggingface} target="_blank" rel="noopener noreferrer" className="hover:text-tech-accent transition-colors">
                <span className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl" role="img" aria-label="Hugging Face">🤗</span>
                </span>
                <span className="sr-only">Hugging Face</span>
              </a>
              <a href="mailto:abhinavsarkar53@gmail.com" className="hover:text-tech-accent transition-colors">
                <Mail className="w-5 h-5 sm:w-[20px] sm:h-[20px]" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center items-center pt-4 sm:pt-8 border-t border-white/10 text-xs sm:text-sm text-muted-foreground"
        >
          <p>&copy; {new Date().getFullYear()} Abhinav Sarkar. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
