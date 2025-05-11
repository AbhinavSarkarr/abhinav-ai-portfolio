
import { motion } from 'framer-motion';
import { Award, GraduationCap, Mail, Phone } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

export function AboutSection() {
  const { hero, certifications } = portfolioData;
  
  return (
    <section id="about" className="relative py-24">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-tech-neon/10 rounded-full blur-[80px]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">About Me</h2>
          <p className="text-lg text-muted-foreground mt-6">
            Passionate AI/LLM Engineer with expertise in building innovative solutions using cutting-edge technologies.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold">{hero.name}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {hero.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="glass-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-tech-glass">
                    <Mail size={18} className="text-tech-accent" />
                  </div>
                  <h4 className="font-semibold">Email</h4>
                </div>
                <a href="mailto:abhinavsarkar53@gmail.com" className="text-sm text-muted-foreground hover:text-tech-accent">
                  abhinavsarkar53@gmail.com
                </a>
              </div>
              
              <div className="glass-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-tech-glass">
                    <Phone size={18} className="text-tech-accent" />
                  </div>
                  <h4 className="font-semibold">Phone</h4>
                </div>
                <a href="tel:+919812047920" className="text-sm text-muted-foreground hover:text-tech-accent">
                  +91-9812047920
                </a>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-tech-glass">
                  <GraduationCap size={20} className="text-tech-accent" />
                </div>
                <h4 className="font-bold">Education</h4>
              </div>
              
              <div className="pl-12 border-l border-tech-neon/30">
                <h5 className="font-semibold">B.Tech in Computer Science and Engineering (AI and ML)</h5>
                <p className="text-sm text-muted-foreground">Sharda University, Greater Noida (2020–24)</p>
                <p className="mt-1 text-sm flex items-center gap-1">
                  <Award size={14} className="text-tech-accent" />
                  <span>CGPA: 8.6</span>
                </p>
              </div>
            </div>
            
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-tech-glass">
                  <Award size={20} className="text-tech-accent" />
                </div>
                <h4 className="font-bold">Certifications</h4>
              </div>
              
              <ul className="space-y-4 pl-12 border-l border-tech-neon/30">
                {certifications.slice(0, 3).map((cert) => (
                  <li key={cert.id}>
                    <h5 className="font-semibold">{cert.title}</h5>
                    <p className="text-sm text-muted-foreground">{cert.issuer} | {cert.date}</p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
