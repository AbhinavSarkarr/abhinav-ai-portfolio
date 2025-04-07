
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, ExternalLink, Clock } from 'lucide-react';
import { useAdminData } from '@/contexts/AdminDataContext';

export function PublicationsSection() {
  const { data } = useAdminData();
  const { publications } = data;
  
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { 
    once: true,
    margin: "0px 0px -10% 0px" 
  });

  return (
    <section id="publications" className="relative py-24" ref={sectionRef}>
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-tech-neon/10 rounded-full blur-[80px]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="section-heading">Publications</h2>
          <p className="text-lg text-muted-foreground mt-6">
            Research papers and academic contributions
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {publications && publications.length > 0 ? publications.map((pub) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="glass-card relative overflow-hidden mb-6"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-tech-neon/50" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-tech-glass mt-1">
                  <BookOpen className="text-tech-accent" size={24} />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold">{pub.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>{pub.date}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-tech-accent mb-2">{pub.publisher}</p>
                  <p className="text-muted-foreground mb-4">
                    {pub.description || "A detailed publication in the field of AI and machine learning."}
                  </p>
                  
                  {pub.link && (
                    <a 
                      href={pub.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 text-tech-accent hover:underline"
                    >
                      Read Publication
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="glass-card text-center py-8">
              <p className="text-muted-foreground">No publications added yet. Use the admin panel to add your publications.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
