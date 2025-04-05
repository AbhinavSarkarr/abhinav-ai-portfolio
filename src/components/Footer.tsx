
import { GitHub, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/10">
      <div className="container flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-bold mb-2">Abhinav Sarkar</h3>
            <p className="text-muted-foreground">AI/LLM Engineer building the future of artificial intelligence one model at a time.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-bold mb-2">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="#about" className="text-muted-foreground hover:text-tech-accent transition-colors">About</a>
              <a href="#experience" className="text-muted-foreground hover:text-tech-accent transition-colors">Experience</a>
              <a href="#projects" className="text-muted-foreground hover:text-tech-accent transition-colors">Projects</a>
              <a href="#skills" className="text-muted-foreground hover:text-tech-accent transition-colors">Skills</a>
              <a href="#publications" className="text-muted-foreground hover:text-tech-accent transition-colors">Publications</a>
              <a href="#contact" className="text-muted-foreground hover:text-tech-accent transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-bold mb-2">Connect</h3>
            <div className="flex items-center gap-4">
              <a href="https://github.com/AbhinavSarkarr" target="_blank" rel="noopener noreferrer" className="hover:text-tech-accent transition-colors">
                <GitHub size={20} />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/abhinavsarkarrr/" target="_blank" rel="noopener noreferrer" className="hover:text-tech-accent transition-colors">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://huggingface.co/abhinavsarkar" target="_blank" rel="noopener noreferrer" className="hover:text-tech-accent transition-colors">
                <span className="flex items-center gap-1">
                  <span className="text-xl" role="img" aria-label="Hugging Face">🤗</span>
                </span>
                <span className="sr-only">Hugging Face</span>
              </a>
              <a href="mailto:abhinavsarkar53@gmail.com" className="hover:text-tech-accent transition-colors">
                <Mail size={20} />
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
          className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-white/10 text-sm text-muted-foreground"
        >
          <p>&copy; {new Date().getFullYear()} Abhinav Sarkar. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built with ❤️ and modern tech</p>
        </motion.div>
      </div>
    </footer>
  );
}
